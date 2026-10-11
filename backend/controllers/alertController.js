// controllers/alertController.js
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const Alert    = require('../models/Alert');
const Pipeline = require('../models/Pipeline');
const { getIO } = require('../sockets/socketManager');

// Initialize Lambda client once at module load — same region as your SNS config.
const lambdaClient = process.env.AWS_REGION
  ? new LambdaClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

// ── GET /api/v1/alerts/active ────────────────────────────────────────────────
async function getActive(req, res, next) {
  try {
    const filter = { status: 'active' };

    // Operators only see alerts for pipelines in their assigned ward
    if (req.user.role === 'operator') {
      if (!req.user.assigned_ward) {
        return res.status(403).json({ success: false, message: 'Operator has no assigned ward.' });
      }
      const pipelines = await Pipeline.find({ ward_id: req.user.assigned_ward }).select('_id').lean();
      filter.pipeline_id = { $in: pipelines.map((p) => p._id) };
    }

    const alerts = await Alert.find(filter)
      .populate('pipeline_id', 'name ward_id location status')
      .sort({ created_at: -1 })
      .lean();

    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    return next(error);
  }
}

// ── POST /api/v1/alerts/:alert_id/dispatch ───────────────────────────────────
async function dispatch(req, res, next) {
  try {
    // 1. Fetch and validate the alert
    const alert = await Alert.findById(req.params.alert_id);
    if (!alert || alert.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Active alert not found.' });
    }

    // 2. Fetch and validate the associated pipeline
    const pipeline = await Pipeline.findById(alert.pipeline_id);
    if (!pipeline) {
      return res.status(404).json({ success: false, message: 'Pipeline not found.' });
    }

    // 3. RBAC: operators can only dispatch within their own ward
    if (req.user.role === 'operator' && String(pipeline.ward_id) !== String(req.user.assigned_ward)) {
      return res.status(403).json({ success: false, message: 'Pipeline is outside your assigned ward.' });
    }

    // 4. Persist state changes atomically
    alert.status    = 'dispatched';
    pipeline.status = 'under_repair';   // frontend maps this to yellow on the map
    await Promise.all([alert.save(), pipeline.save()]);

    // 5. Broadcast CREW_DISPATCHED — React map turns the pipeline segment yellow instantly
    const [lng, lat] = pipeline.location.coordinates[0];
    getIO().emit('CREW_DISPATCHED', {
      alert_id:    alert._id,
      pipeline_id: pipeline._id,
      pipeline: {
        id:          pipeline._id,
        name:        pipeline.name,
        status:      'under_repair',
        coordinates: pipeline.location.coordinates,
      },
    });

    // 6. Invoke Lambda (fire-and-forget) — a Lambda failure never blocks the HTTP 200
    if (lambdaClient) {
      const lambdaPayload = {
        alert_id:      String(alert._id),
        severity:      alert.severity,
        pipeline_id:   String(pipeline._id),
        pipeline_name: pipeline.name,
        coordinates:   [lng, lat],
      };

      lambdaClient
        .send(
          new InvokeCommand({
            FunctionName:   process.env.LAMBDA_DISPATCH_FN || 'aqualedger-dispatch-sms',
            InvocationType: 'Event',  // async — don't wait for Lambda to finish
            Payload:        Buffer.from(JSON.stringify(lambdaPayload)),
          })
        )
        .then(() => console.log(`[Lambda] Dispatch invoked for alert ${alert._id}`))
        .catch((err) => console.error('[Lambda] Invocation error:', err.message));
    } else {
      console.warn('[Lambda] AWS_REGION not set — Lambda invocation skipped.');
    }

    // 7. Respond immediately — DB and socket are already done
    return res.json({
      success: true,
      message: 'Repair crew dispatched. Lambda SMS trigger fired.',
      data: {
        alert:    { id: alert._id,    status: alert.status },
        pipeline: { id: pipeline._id, status: pipeline.status },
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { dispatch, getActive };
