const mongoose = require('mongoose');

// One review per (browser, restaurant). Field names match the frontend's review object.
const reviewSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true },
    rid: { type: String, required: true }, // the restaurant's restaurant_id
    name: { type: String, required: true },
    cuisine: { type: String, required: true },
    borough: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, maxlength: 600 },
    ts: { type: Number, required: true }, // milliseconds since epoch
  },
  { collection: 'reviews', versionKey: false }
);

reviewSchema.index({ ownerId: 1, rid: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
