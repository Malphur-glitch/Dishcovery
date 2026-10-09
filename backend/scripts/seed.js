require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { EJSON } = require('bson');
const connectDB = require('../database/db');

const FILE_PATH = path.join(__dirname, '..', 'data', 'restaurants.json');

(async () => {
  try {
    await connectDB();

    const raw = fs.readFileSync(FILE_PATH, 'utf8').replace(/^\uFEFF/, '').trim();
    const all = EJSON.parse(raw);

    const valid = all.filter((r) => r && r.name && r.cuisine && r.borough);

    console.log(`Records in file:                   ${all.length}`);
    console.log(`Records with name/cuisine/borough: ${valid.length}`);

    const col = mongoose.connection.collection('restaurants');

   
    await col.deleteMany({});
    const BATCH = 1000;
    for (let i = 0; i < valid.length; i += BATCH) {
      await col.insertMany(valid.slice(i, i + BATCH));
    }

    console.log(`✅ Imported ${valid.length} restaurants into "${mongoose.connection.name}"`);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();