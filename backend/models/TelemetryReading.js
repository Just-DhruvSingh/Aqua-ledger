const mongoose = require('mongoose');
const telemetryReadingSchema = new mongoose.Schema({
  pipeline_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline', required: true, index: true },
  timestamp: { type: Date, required: true, default: Date.now },
  input_lps: { type: Number, required: true, min: 0 },
  output_lps: { type: Number, required: true, min: 0 },
  nrw_percent: { type: Number, required: true, min: 0 }
}, { versionKey: false });
telemetryReadingSchema.index({ timestamp: -1 });
telemetryReadingSchema.index({ pipeline_id: 1, timestamp: -1 });
module.exports = mongoose.model('TelemetryReading', telemetryReadingSchema);
