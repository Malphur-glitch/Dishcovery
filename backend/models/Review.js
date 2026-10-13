const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true },
    rid: { type: String, required: true },
    name: { type: String, required: true },
    cuisine: { type: String, required: true },
    borough: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, maxlength: 600 },
    ts: { type: Number, required: true }, 
  },
  { collection: 'reviews', versionKey: false }
);

reviewSchema.index({ ownerId: 1, rid: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
