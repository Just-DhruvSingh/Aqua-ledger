const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  operator_id: { type: String, unique: true, required: true, trim: true },
  password_hash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'operator'], default: 'operator' },
  assigned_ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', default: null },
  created_at: { type: Date, default: Date.now }
}, { versionKey: false });
userSchema.virtual('password').set(function setPassword(value) { this._plaintext = value; });
userSchema.pre('validate', async function hashPassword() { if (this._plaintext) { this.password_hash = await bcrypt.hash(this._plaintext, 12); this._plaintext = undefined; } });
userSchema.methods.verifyPassword = function verifyPassword(value) { return bcrypt.compare(value, this.password_hash); };
module.exports = mongoose.model('User', userSchema);
