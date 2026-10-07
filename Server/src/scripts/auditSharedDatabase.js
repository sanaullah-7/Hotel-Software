import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import { SCHEMAS } from '../database/hotel/schemaRegistry.js';
const connection = await mongoose.createConnection('mongodb://localhost:27017/explore_pakistan', {
  serverSelectionTimeoutMS: 5000, autoCreate: false, autoIndex: false,
}).asPromise();
try {
  const hotels = await connection.db.collection('hotels').find({}).toArray();
  const hotelIds = new Set(hotels.map(h => String(h._id)));
  const report = { database: connection.name, hotels: hotels.length, collections: [], errors: [] };
  for (const [name, schema] of Object.entries(SCHEMAS)) {
    const model = connection.model(name, schema);
    const documents = await model.collection.find({}).toArray();
    report.collections.push({ collection: model.collection.name, count: documents.length });
    for (const doc of documents) {
      if (!(doc.hotelId instanceof mongoose.Types.ObjectId) || !hotelIds.has(String(doc.hotelId))) {
        report.errors.push({ collection: model.collection.name, id: String(doc._id), reason: 'Missing or invalid hotel ownership' });
      }
      for (const [path, definition] of Object.entries(schema.paths)) {
        const ref = definition.options?.ref;
        if (!ref || ref === 'Hotel' || !doc[path]) continue;
        const refSchema = SCHEMAS[ref];
        const collection = refSchema ? connection.model(ref, refSchema).collection : connection.db.collection(ref === 'Account' ? 'accounts' : ref.toLowerCase() + 's');
        const referenced = await collection.findOne({ _id: doc[path] });
        if (!referenced || (refSchema && String(referenced.hotelId) !== String(doc.hotelId))) {
          report.errors.push({ collection: model.collection.name, id: String(doc._id), path, reason: 'Missing or cross-hotel reference' });
        }
      }
    }
  }
  for (const hotel of hotels) {
    if (!await connection.db.collection('accounts').findOne({ _id: hotel.ownerId, hotelId: hotel._id })) {
      report.errors.push({ collection: 'hotels', id: String(hotel._id), reason: 'Missing owner account or inconsistent account ownership' });
    }
  }
  report.accounts = await connection.db.collection('accounts').countDocuments();
  report.pass = report.errors.length === 0;
  await fs.writeFile(new URL('../../shared-database-audit.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await connection.close(); }
