const dns = require('node:dns');
const mongoose = require('mongoose');

const DB_NAME = process.env.DB_NAME || 'dbRestaurants';

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');

  if (uri.startsWith('mongodb+srv://') && process.env.USE_PUBLIC_DNS !== 'false') {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  await mongoose.connect(uri, { dbName: DB_NAME, serverSelectionTimeoutMS: 10000 });
  console.log(`[MongoDB] Connected to database "${mongoose.connection.name}"`);
}

module.exports = connectDB;
