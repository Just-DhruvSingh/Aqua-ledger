const mongoose = require('mongoose');
const pointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true, default: 'Point' },
  coordinates: { type: [Number], required: true, validate: { validator: (coordinates) => coordinates.length === 2, message: 'Point requires [longitude, latitude].' } }
}, { _id: false });
const complaintSchema = new mongoose.Schema({
  ward_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true, index: true },
  location: { type: pointSchema, required: true },
  type: { type: String, enum: ['low_pressure', 'no_water'], required: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open', index: true },
  timestamp: { type: Date, default: Date.now }
}, { versionKey: false });
complaintSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Complaint', complaintSchema);
