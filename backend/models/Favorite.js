const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true },
    restaurant_id: { type: String, required: true },
    createdAt: { type: Date }, 
  },
  { collection: 'favorites', versionKey: false }
);

favoriteSchema.index({ ownerId: 1, restaurant_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
