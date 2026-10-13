require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const { EJSON } = require('bson');
const connectDB = require('../database/db');
const Restaurant = require('../models/Restaurant');

const fileArg = process.argv.find((a) => a.startsWith('--file='));
const FILE_PATH = fileArg ? path.resolve(fileArg.slice(7)) : path.join(__dirname, '..', 'data', 'restaurants.json');
const overwrite = process.argv.includes('--overwrite');
const BATCH = 500;

(async () => {
  try {
    await connectDB();

    const raw = fs.readFileSync(FILE_PATH, 'utf8').replace(/^\uFEFF/, '').trim();
    const all = EJSON.parse(raw);
    if (!Array.isArray(all)) throw new Error('The data file must contain an array.');

    const seen = new Set();
    const records = [];
    let skipped = 0;
    let duplicates = 0;
    for (const r of all) {
      const ok = r && r.restaurant_id != null && r.name && r.cuisine && r.borough;
      if (!ok) { skipped++; continue; }
      const id = String(r.restaurant_id);
      if (seen.has(id)) { duplicates++; continue; }
      seen.add(id);
      const { _id, ...fields } = r;
      records.push({ ...fields, restaurant_id: id, Meals: Array.isArray(r.Meals) ? r.Meals : [] });
    }

    try {
      await Restaurant.init(); 
    } catch (err) {
      throw new Error(`Could not build the unique restaurant_id index (${err.message}). ` +
        'The collection probably already has duplicate restaurant_id values; clear it in Atlas and run the seed again.');
    }

    const { ObjectId } = mongoose.Types;
    let inserted = 0;
    let matched = 0;
    let modified = 0;
    for (let i = 0; i < records.length; i += BATCH) {
      const ops = records.slice(i, i + BATCH).map(({ restaurant_id, ...fields }) => ({
        updateOne: {
          filter: { restaurant_id },
          update: overwrite
            ? { $set: fields, $setOnInsert: { _id: new ObjectId() } }
            : { $setOnInsert: { _id: new ObjectId(), ...fields } },
          upsert: true,
        },
      }));
      const result = await Restaurant.collection.bulkWrite(ops, { ordered: true });
      inserted += result.upsertedCount;
      matched += result.matchedCount;
      modified += result.modifiedCount;
    }

    const total = await Restaurant.countDocuments();
    console.log(`Records in file:      ${all.length}`);
    if (skipped) console.log(`Skipped (incomplete): ${skipped}`);
    if (duplicates) console.log(`Skipped (duplicate id in file): ${duplicates}`);
    console.log(`Inserted:             ${inserted}`);
    console.log(`Already present:      ${matched}${overwrite ? ` (${modified} changed by --overwrite)` : ' (left unchanged)'}`);
    console.log(`Documents now in "${mongoose.connection.name}.restaurants": ${total}`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();
