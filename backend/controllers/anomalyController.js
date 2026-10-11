const Pipeline = require('../models/Pipeline');
const Complaint = require('../models/Complaint');
const TelemetryReading = require('../models/TelemetryReading');
const Alert = require('../models/Alert');
const { getIO } = require('../sockets/socketManager');
const EARTH_RADIUS_METERS = 6378137;
function round(value) { return Number(value.toFixed(2)); }
function distanceMeters(a, b) { const r = Math.PI / 180; const dLat = (b[1] - a[1]) * r; const dLng = (b[0] - a[0]) * r; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLng / 2) ** 2; return EARTH_RADIUS_METERS * 2 * Math.asin(Math.sqrt(h)); }
// MongoDB $near takes Point geometry. Sampling each line segment every 250m gives
// a 500m searchable buffer over the entire LineString, rather than one endpoint.
function lineSamples(coordinates) { const samples = [coordinates[0]]; for (let i = 1; i < coordinates.length; i += 1) { const from = coordinates[i - 1]; const to = coordinates[i]; const steps = Math.max(1, Math.ceil(distanceMeters(from, to) / 250)); for (let step = 1; step <= steps; step += 1) samples.push([from[0] + ((to[0] - from[0]) * step / steps), from[1] + ((to[1] - from[1]) * step / steps)]); } return samples; }
async function openComplaintsWithinPipelineBuffer(pipeline) {
  const matches = await Promise.all(lineSamples(pipeline.location.coordinates).map((coordinates) => Complaint.find({ ward_id: pipeline.ward_id, status: 'open', location: { $near: { $geometry: { type: 'Point', coordinates }, $maxDistance: 500 } } }).lean()));
  return [...new Map(matches.flat().map((complaint) => [String(complaint._id), complaint])).values()];
}
async function ingestTelemetry(req, res, next) {
  try {
    const { pipeline_id, input_lps, output_lps, timestamp } = req.body;
    if (!pipeline_id || !Number.isFinite(input_lps) || !Number.isFinite(output_lps) || input_lps < 0 || output_lps < 0) return res.status(400).json({ success: false, message: 'pipeline_id and non-negative numeric input_lps/output_lps are required.' });
    const pipeline = await Pipeline.findById(pipeline_id);
    if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found.' });
    if (req.user.role === 'operator' && String(pipeline.ward_id) !== req.user.assigned_ward) return res.status(403).json({ success: false, message: 'Pipeline is outside your assigned ward.' });
    const history = await TelemetryReading.find({ pipeline_id }).sort({ timestamp: -1 }).limit(10).lean();
    const outputs = history.map((item) => item.output_lps); const mean = outputs.length ? outputs.reduce((sum, value) => sum + value, 0) / outputs.length : output_lps; const sd = outputs.length > 1 ? Math.sqrt(outputs.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / outputs.length) : 0;
    const zScore = outputs.length >= 5 ? (sd ? (mean - output_lps) / sd : (output_lps < mean ? 99 : 0)) : 0;
    const nrwPercent = input_lps ? Math.max(0, ((input_lps - output_lps) / input_lps) * 100) : 0; const failed = zScore > 2 && output_lps < mean;
    const complaints = failed ? await openComplaintsWithinPipelineBuffer(pipeline) : [];
    const equityImpact = Math.min(100, round((nrwPercent * 1.2) + (complaints.length * 5)));
    const reading = await TelemetryReading.create({ pipeline_id, timestamp: timestamp ? new Date(timestamp) : new Date(), input_lps, output_lps, nrw_percent: round(nrwPercent) });
    let alert = null; if (failed) { pipeline.status = 'critical'; await pipeline.save(); alert = await Alert.create({ pipeline_id, severity: (nrwPercent >= 20 || zScore >= 3) ? 'CRITICAL' : 'HIGH', loss_rate_lpm: Math.max(0, (input_lps - output_lps) * 60), equity_impact: equityImpact }); }
    getIO().emit('telemetry:reading', { pipeline_id, input_lps, output_lps, nrw_percent: round(nrwPercent), z_score: round(zScore) }); if (alert) getIO().emit('alert:created', { alert, nearby_open_complaints: complaints });
    return res.status(201).json({ success: true, data: { reading, anomaly_detected: failed, z_score: round(zScore), nearby_open_complaints: complaints, alert } });
  } catch (error) { return next(error); }
}
module.exports = { ingestTelemetry, openComplaintsWithinPipelineBuffer };
