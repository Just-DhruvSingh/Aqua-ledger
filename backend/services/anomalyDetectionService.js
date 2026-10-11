const Alert = require('../models/Alert');
const Complaint = require('../models/Complaint');
const TelemetryReading = require('../models/TelemetryReading');

const WINDOW_SIZE = 10;
const EARTH_RADIUS_METERS = 6378137;
const outputWindows = new Map();

function round(value) { return Number(value.toFixed(2)); }

function calculateNrw(inputFlow, outputFlow) {
  return inputFlow > 0 ? Math.max(0, ((inputFlow - outputFlow) / inputFlow) * 100) : 0;
}

function statistics(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  return { mean, standardDeviation: Math.sqrt(variance) };
}

function pointDistanceMeters(a, b) {
  const radians = Math.PI / 180;
  const lat1 = a[1] * radians;
  const lat2 = b[1] * radians;
  const dLat = (b[1] - a[1]) * radians;
  const dLng = (b[0] - a[0]) * radians;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

// Samples every line segment at <=250m intervals, then queries 500m circles around
// those points. This forms a geospatial buffer for a LineString using 2dsphere indexes.
function sampleLineString(coordinates) {
  const samples = [coordinates[0]];
  for (let i = 1; i < coordinates.length; i += 1) {
    const from = coordinates[i - 1];
    const to = coordinates[i];
    const steps = Math.max(1, Math.ceil(pointDistanceMeters(from, to) / 250));
    for (let step = 1; step <= steps; step += 1) {
      const ratio = step / steps;
      samples.push([from[0] + ((to[0] - from[0]) * ratio), from[1] + ((to[1] - from[1]) * ratio)]);
    }
  }
  return samples;
}

async function findUnresolvedComplaintsNearPipeline(pipeline, radiusMeters = 500) {
  const radiusRadians = radiusMeters / EARTH_RADIUS_METERS;
  const spatialZones = sampleLineString(pipeline.location.coordinates).map((center) => ({
    location: { $geoWithin: { $centerSphere: [center, radiusRadians] } }
  }));
  return Complaint.find({ status: 'open', $or: spatialZones }).lean();
}

// Uses $near with the pipeline's first LineString coordinate to support nearest-complaint UI lookups.
async function findClosestComplaint(pipeline) {
  return Complaint.findOne({
    status: 'open',
    location: { $near: { $geometry: { type: 'Point', coordinates: pipeline.location.coordinates[0] }, $maxDistance: 500 } }
  }).lean();
}

async function processReading({ pipeline, inputFlow, outputFlow, recordedAt }) {
  const key = pipeline._id.toString();
  const history = outputWindows.get(key) || [];
  const baseline = history.length >= 5 ? statistics(history) : null;
  const zScore = baseline
    ? (baseline.standardDeviation > 0
      ? (baseline.mean - outputFlow) / baseline.standardDeviation
      : (outputFlow < baseline.mean ? 99 : 0))
    : 0;
  const nrwPercent = calculateNrw(inputFlow, outputFlow);
  const isLeak = zScore > 2 && outputFlow < baseline.mean;
  const nearbyComplaints = isLeak ? await findUnresolvedComplaintsNearPipeline(pipeline) : [];
  const equityScore = Math.max(10, Math.min(100, 100 - ((nrwPercent * 1.2) + (nearbyComplaints.length * 5))));

  const reading = await TelemetryReading.create({
    pipeline: pipeline._id,
    input_flow_lps: inputFlow,
    output_flow_lps: outputFlow,
    nrw_percent: round(nrwPercent),
    z_score: round(zScore),
    equity_score: round(equityScore),
    recordedAt
  });

  pipeline.latestInputFlowLps = inputFlow;
  pipeline.latestOutputFlowLps = outputFlow;
  let alert = null;
  if (isLeak) {
    const severity = nrwPercent >= 20 || zScore >= 3 ? 'CRITICAL' : 'HIGH';
    const activeAlert = await Alert.findOne({ pipeline: pipeline._id, status: 'active' });
    if (!activeAlert) {
      pipeline.status = 'critical';
      alert = await Alert.create({
        pipeline: pipeline._id, severity, loss_rate_lpm: Math.max(0, (inputFlow - outputFlow) * 60),
        nrw_percent: round(nrwPercent), z_score: round(zScore), equity_score: round(equityScore),
        complaintCount: nearbyComplaints.length, complaintIds: nearbyComplaints.map((item) => item._id),
        description: `Output-flow anomaly: ${round(zScore)}σ below rolling mean; ${nearbyComplaints.length} unresolved complaint(s) within 500m.`
      });
    }
  }
  await pipeline.save();
  outputWindows.set(key, [...history, outputFlow].slice(-WINDOW_SIZE));

  return { reading, alert, isLeak, nearbyComplaints, metrics: { nrw_percent: round(nrwPercent), equity_score: round(equityScore), z_score: round(zScore) } };
}

module.exports = { calculateNrw, findClosestComplaint, findUnresolvedComplaintsNearPipeline, processReading };
