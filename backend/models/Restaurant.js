const mongoose = require('mongoose');

const { Schema } = mongoose;


const addressSchema = new Schema(
  {
    building: { type: String, trim: true },
    coord: { type: [Number], default: undefined }, 
    street: { type: String, trim: true },
    zipcode: { type: String, trim: true },
  },
  { _id: false }
);

const gradeSchema = new Schema(
  {
    date: { type: Date },
    grade: { type: String, trim: true },
    score: { type: Number },
  },
  { _id: false }
);



const restaurantSchema = new Schema(
  {
    address: { 
        type: addressSchema },
    borough: { 
        type: String, 
        required: [true, 'Borough is required'], 
        trim: true },
    cuisine: { 
        type: String, 
        required: [true, 'Cuisine is required'], 
        trim: true },
    grades: { 
        type: [gradeSchema], 
        default: [] },
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true },
    restaurant_id: { 
        type: String, 
        required: [true, 'restaurant_id is required'], 
        trim: true },
  },
  {
    collection: 'restaurants',
    versionKey: false,
  }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);