// routes/telemetry.js
const express  = require('express');
const router   = express.Router();
const Ward      = require('../models/Ward');
const Pipeline  = require('../models/Pipeline');
const Complaint = require('../models/Complaint');
const Alert     = require('../models/Alert');
const { getIO } = require('../sockets/socketManager');

// GET /api/v1/telemetry/metrics
router.get('/metrics', async (req, res) => {
  try {
    const pipelines  = await Pipeline.find();
    const complaints = await Complaint.find({ status: 'open' });
    const ward       = await Ward.findOne();

    // Calculate aggregated metrics from pipeline capacities
    const totalMaxCapacity = pipelines.reduce((acc, p) => acc + p.max_capacity_lps, 0);
    const hasCritical      = pipelines.some((p) => p.status === 'critical');

    // Baseline readings
    let input_lps   = totalMaxCapacity * 0.8;
    let output_lps  = hasCritical ? input_lps * 0.72 : input_lps * 0.94;
    let nrw_percent = Number((((input_lps - output_lps) / input_lps) * 100).toFixed(1));

    // Dynamic Water Equity Score calculation
    let baseEquity  = ward ? ward.base_equity_score : 80;
    let penalty     = (nrw_percent * 1.1) + (complaints.length * 4);
    let equity_score = Number(Math.max(10, Math.min(100, baseEquity - penalty)).toFixed(1));

    res.json({
      success: true,
      data: {
        input_lps:    Number(input_lps.toFixed(1)),
        output_lps:   Number(output_lps.toFixed(1)),
        nrw_percent,
        equity_score,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/telemetry/network (GeoJSON map layer)
router.get('/network', async (req, res) => {
  try {
    const ward       = await Ward.findOne();
    const pipelines  = await Pipeline.find();
    const complaints = await Complaint.find();

    res.json({
      success: true,
      data: {
        ward: ward ? ward.name : 'Unknown Ward',
        pipelines: pipelines.map((p) => ({
          id:               p._id,
          name:             p.name,
          status:           p.status,
          max_capacity_lps: p.max_capacity_lps,
          coordinates:      p.location.coordinates,
        })),
        complaints: complaints.map((c) => ({
          id:          c._id,
          type:        c.type,
          status:      c.status,
          details:     c.details,
          coordinates: c.location.coordinates, // [lng, lat]
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/telemetry/simulate-leak (The Demo Anomaly Trigger)
router.post('/simulate-leak', async (req, res) => {
  try {
    // 1. Locate the Sector 4 loop pipeline
    const pipeline = await Pipeline.findOne({ name: /Sector 4/i });
    if (!pipeline) {
      return res.status(404).json({ success: false, message: 'Pipeline not found' });
    }

    // 2. Mark it critical
    pipeline.status = 'critical';
    await pipeline.save();

    // 3. Create a high-priority alert record in MongoDB
    const alert = await Alert.create({
      pipeline_id:   pipeline._id,
      severity:      'CRITICAL',
      loss_rate_lpm: 5400,
      equity_impact: 42.0,
      status:        'active',
    });

    // 4. Geospatial lookup: Find unresolved complaints within 600m of this pipeline
    const [lng, lat] = pipeline.location.coordinates[0];
    const nearbyComplaints = await Complaint.find({
      location: {
        $near: {
          $geometry:   { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 600,
        },
      },
      status: 'open',
    });

    // 5. Broadcast CRITICAL_LEAK_DETECTED to all connected dashboard clients
    getIO().emit('CRITICAL_LEAK_DETECTED', {
      alert,
      pipeline: {
        id:          pipeline._id,
        name:        pipeline.name,
        status:      pipeline.status,
        coordinates: pipeline.location.coordinates,
      },
      corroborating_complaints: nearbyComplaints,
    });

    res.json({
      success:                  true,
      message:                  'Simulated leak triggered successfully on MongoDB records',
      data: {
        alert,
        corroborating_complaints: nearbyComplaints,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/telemetry/reset
router.post('/reset', async (req, res) => {
  try {
    await Pipeline.updateMany({}, { status: 'normal' });
    await Alert.deleteMany({});

    // Notify dashboard that system is back to normal
    getIO().emit('TELEMETRY_RESET', { message: 'All pipelines restored to normal status.' });

    res.json({ success: true, message: 'Telemetry and pipelines reset to normal.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;