const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined. Check your .env file.');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, 
    });
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;