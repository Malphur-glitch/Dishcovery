const mongoose = require('mongoose');

// One document per (browser, restaurant). ownerId is the anonymous id stored in the browser's cookie.
const favoriteSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true },
    restaurant_id: { type: String, required: true },
    createdAt: { type: Date }, // set with $setOnInsert so re-adding never moves a favorite
  },
  { collection: 'favorites', versionKey: false }
);

favoriteSchema.index({ ownerId: 1, restaurant_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
