// Load environment variables FIRST, before anything reads process.env
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./database/db');
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';




app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.status(200).json({ message: 'Restaurants API is running ' });
});

app.use('/api/restaurants', restaurantRoutes);


app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});


const startServer = async () => {
  await connectDB(); 

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
startServer();

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\nMongoDB connection closed. Goodbye!');
  process.exit(0);
});