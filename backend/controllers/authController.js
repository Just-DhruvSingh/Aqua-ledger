const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
function signToken(user) { return jwt.sign({ sub: String(user._id), role: user.role, assigned_ward: user.assigned_ward || null }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }); }
async function login(req, res, next) {
  try {
    const { operator_id, password } = req.body;
    if (!operator_id || !password) return res.status(400).json({ success: false, message: 'operator_id and password are required.' });
    const user = await User.findOne({ operator_id }).select('+password_hash');
    if (!user || !(await user.verifyPassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    return res.json({ success: true, token: signToken(user), data: { operator_id: user.operator_id, role: user.role, assigned_ward: user.assigned_ward } });
  } catch (error) { return next(error); }
}
async function bootstrapAdmin() {
  const operator_id = process.env.SEED_ADMIN_USERNAME; const password = process.env.SEED_ADMIN_PASSWORD;
  if (!operator_id || !password || await User.exists({ operator_id })) return;
  await User.create({ operator_id, password_hash: await bcrypt.hash(password, 12), role: 'admin' });
  console.log(`Seeded administrator: ${operator_id}`);
}
module.exports = { bootstrapAdmin, login };
