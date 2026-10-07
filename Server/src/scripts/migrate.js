import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { SCHEMAS } from '../database/hotel/schemaRegistry.js';

// Read-only by default. Never overwrite conflicts or delete a source database.
const apply = process.argv.includes('--apply');
const targetName = 'explore_pakistan';
const platformNames = ['explore_pakistan_platform', 'hotel_pms_platform'];
const connection = await mongoose.createConnection(`mongodb://localhost:27017/${targetName}`, {
  serverSelectionTimeoutMS: 5000,
}).asPromise();
const { EJSON } = mongoose.mongo.BSON;
const report = { mode: apply ? 'apply' : 'audit', target: targetName, sources: [], conflicts: [], ownershipErrors: [] };
try {
  const client = connection.getClient();
  const names = (await connection.db.admin().listDatabases()).databases.map(d => d.name);
  const sources = names.filter(n => platformNames.includes(n) || /^hotel_[a-f\d]{24}$/.test(n));
  const target = client.db(targetName);
  const hotelCollections = new Set(Object.entries(SCHEMAS).map(([name, schema]) =>
    mongoose.model(`Migration${name}`, schema, mongoose.pluralize()(name)).collection.name));
  const planned = new Map();
  const backup = {};
  for (const sourceName of sources) {
    const source = client.db(sourceName);
    const tenantId = /^hotel_([a-f\d]{24})$/.exec(sourceName)?.[1];
    const summary = { database: sourceName, collections: [] };
    backup[sourceName] = {};
    for (const { name } of await source.listCollections().toArray()) {
      const docs = await source.collection(name).find({}).toArray();
      backup[sourceName][name] = docs;
      const stats = { collection: name, count: docs.length, identical: 0, missing: 0, conflicts: 0 };
      for (const original of docs) {
        const doc = { ...original };
        if (tenantId) {
          if (!hotelCollections.has(name)) {
            report.conflicts.push({ database: sourceName, collection: name, id: String(doc._id), reason: 'Unknown tenant collection requires review' });
            stats.conflicts++;
            continue;
          }
          if (doc.hotelId && String(doc.hotelId) !== tenantId) {
            report.ownershipErrors.push({ database: sourceName, collection: name, id: String(doc._id), reason: 'Existing ownership contradicts source database' });
          }
          doc.hotelId = new mongoose.Types.ObjectId(tenantId);
        }
        const key = `${name}:${EJSON.stringify(doc._id)}`;
        const existing = planned.get(key)?.doc || await target.collection(name).findOne({ _id: doc._id });
        if (existing && !isDeepStrictEqual(existing, doc)) {
          stats.conflicts++;
          report.conflicts.push({ database: sourceName, collection: name, id: String(doc._id), reason: 'Conflicting contents; canonical record requires review' });
        } else if (existing) stats.identical++;
        else { stats.missing++; planned.set(key, { collection: name, doc }); }
      }
      summary.collections.push(stats);
    }
    report.sources.push(summary);
  }
  for (const { collection, doc } of planned.values()) {
    if (hotelCollections.has(collection)) {
      const hotel = doc.hotelId && (await target.collection('hotels').findOne({ _id: doc.hotelId }) || planned.get(`hotels:${EJSON.stringify(doc.hotelId)}`)?.doc);
      if (!hotel) report.ownershipErrors.push({ collection, id: String(doc._id), reason: 'Missing hotel in shared database' });
    }
  }
  report.absentSources = platformNames.filter(n => !names.includes(n));
  report.safeToApply = !report.conflicts.length && !report.ownershipErrors.length;
  if (apply) {
    if (!report.safeToApply) throw new Error('Migration blocked: unresolved conflicts or ownership errors');
    if (planned.size) {
      const backupPath = new URL(`../../migration-backup-${Date.now()}.json`, import.meta.url);
      await fs.writeFile(backupPath, EJSON.stringify(backup, null, 2), { flag: 'wx' });
      report.backup = backupPath.pathname;
    }
    for (const { collection, doc } of planned.values()) {
      // $setOnInsert preserves a canonical target that another process might create.
      await target.collection(collection).updateOne({ _id: doc._id }, { $setOnInsert: doc }, { upsert: true });
      if (!isDeepStrictEqual(await target.collection(collection).findOne({ _id: doc._id }), doc)) {
        throw new Error(`Verification failed: ${collection}/${doc._id}; source databases preserved`);
      }
    }
    report.verifiedInserted = planned.size;
  }
  await fs.writeFile(new URL('../../migration-audit.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await connection.close();
}
