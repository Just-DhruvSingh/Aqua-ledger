const mongoose = require('mongoose');
const polygonSchema = new mongoose.Schema({
  type: { type: String, enum: ['Polygon'], required: true, default: 'Polygon' },
  coordinates: { type: [[[Number]]], required: true, validate: { validator: (rings) => rings.length > 0 && rings.every((ring) => ring.length >= 4), message: 'A Polygon needs closed rings with at least four coordinates.' } }
}, { _id: false });
const wardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  boundary: { type: polygonSchema, required: true },
  base_equity_score: { type: Number, min: 0, max: 100, default: 100 }
}, { versionKey: false });
wardSchema.index({ boundary: '2dsphere' });
module.exports = mongoose.model('Ward', wardSchema);
