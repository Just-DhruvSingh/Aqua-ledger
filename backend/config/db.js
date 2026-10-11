const mongoose = require('mongoose');

async function connectDatabase() {
  // A local default makes `npm run dev` work without a .env file. Production
  // deployments must set MONGODB_URI to their Atlas or managed MongoDB URI.
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aqualedger';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDatabase;
