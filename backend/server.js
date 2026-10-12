// Load environment variables FIRST, before anything reads process.env
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./database/db');
const createApp = require('./app');
const Restaurant = require('./models/Restaurant');
const Favorite = require('./models/Favorite');
const Review = require('./models/Review');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  // Make sure the unique indexes exist (restaurant_id; owner+restaurant for favorites/reviews).
  await Promise.all([Restaurant.init(), Favorite.init(), Review.init()]);

  const total = await Restaurant.estimatedDocumentCount();
  if (total === 0) console.warn('[Warning] The restaurants collection is empty. Run "npm run seed".');

  const server = createApp().listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}/api  (allowing ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'})`);
  });

  const shutdown = async () => {
    console.log('\nShutting down...');
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
