const mongoose = require('mongoose');
const lineStringSchema = new mongoose.Schema({
  type: { type: String, enum: ['LineString'], required: true, default: 'LineString' },
  coordinates: { type: [[Number]], required: true, validate: { validator: (points) => points.length >= 2 && points.every((point) => point.length === 2), message: 'LineString requires two or more [longitude, latitude] points.' } }
}, { _id: false });
const pipelineSchema = new mongoose.Schema({
  ward_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true, index: true },
  name: { type: String, required: true, trim: true },
  location: { type: lineStringSchema, required: true },
  status: { type: String, enum: ['normal', 'critical', 'repair', 'under_repair'], default: 'normal' },
  max_capacity_lps: { type: Number, required: true, min: 0 }
}, { versionKey: false });
pipelineSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Pipeline', pipelineSchema);
