const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const anonymousUser = require('./middleware/anonymousUser');
const { notFound, errorHandler } = require('./middleware/errorHandlers');
const { ok } = require('./utils/respond');
const restaurantRoutes = require('./routes/restaurantRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // CORS: only the frontend's exact origin(s). "credentials" lets the browser send/receive the
  // anonymous-id cookie (the frontend must use credentials: 'include' for that to work).
  const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  app.use(
    cors({
      origin: origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      maxAge: 600,
    })
  );

  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => {
    ok(res, { status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  });
  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/favorites', anonymousUser, favoriteRoutes);
  app.use('/api/reviews', anonymousUser, reviewRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
