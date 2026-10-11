const mongoose = require('mongoose');
const alertSchema = new mongoose.Schema({
  pipeline_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline', required: true, index: true },
  severity: { type: String, enum: ['HIGH', 'CRITICAL'], required: true },
  loss_rate_lpm: { type: Number, required: true, min: 0 },
  equity_impact: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['active', 'dispatched', 'resolved'], default: 'active', index: true },
  created_at: { type: Date, default: Date.now }
}, { versionKey: false });
alertSchema.index({ created_at: -1 });
module.exports = mongoose.model('Alert', alertSchema);
