import mongoose from 'mongoose';
import { SCHEMAS } from './schemaRegistry.js';

const indexesReady = new WeakMap(); // Model -> Promise
const scopedModels = new Map();

const withHotel = (hotelId, filter = {}) => ({ ...filter, hotelId });

const scopeModel = (model, hotelId) => {
  const cacheKey = `${model.modelName}:${hotelId}`;
  if (scopedModels.has(cacheKey)) return scopedModels.get(cacheKey);

  const scoped = new Proxy(model, {
    get(target, property, receiver) {
      if (property === 'create') {
        return (docs, ...args) => {
          const addHotel = (doc) => ({ ...doc, hotelId });
          return target.create(Array.isArray(docs) ? docs.map(addHotel) : addHotel(docs), ...args);
        };
      }
      if (property === 'insertMany') {
        return (docs, ...args) => target.insertMany(docs.map((doc) => ({ ...doc, hotelId })), ...args);
      }
      if (['find', 'findOne', 'countDocuments', 'estimatedDocumentCount', 'exists', 'deleteMany',
        'deleteOne', 'updateMany', 'updateOne', 'findOneAndUpdate', 'findOneAndDelete',
        'findOneAndReplace', 'replaceOne'].includes(property)) {
        return (filter = {}, ...args) => target[property](withHotel(hotelId, filter), ...args);
      }
      if (property === 'findById') {
        return (id, ...args) => target.findOne(withHotel(hotelId, { _id: id }), ...args);
      }
      if (property === 'findByIdAndUpdate') {
        return (id, update, ...args) => target.findOneAndUpdate(withHotel(hotelId, { _id: id }), update, ...args);
      }
      if (property === 'findByIdAndDelete') {
        return (id, ...args) => target.findOneAndDelete(withHotel(hotelId, { _id: id }), ...args);
      }
      if (property === 'aggregate') {
        return (pipeline = [], ...args) => target.aggregate([{ $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } }, ...pipeline], ...args);
      }
      if (property === 'bulkWrite') {
        return (operations, ...args) => target.bulkWrite(operations.map((operation) => {
          const [kind, value] = Object.entries(operation)[0];
          const next = { ...value };
          if (next.filter) next.filter = withHotel(hotelId, next.filter);
          if (next.document) next.document = { ...next.document, hotelId };
          return { [kind]: next };
        }), ...args);
      }
      return Reflect.get(target, property, receiver);
    },
  });
  scopedModels.set(cacheKey, scoped);
  return scoped;
};

const ensureModelReady = (model) => {
  if (!indexesReady.has(model)) {
    const p = (async () => {
      await model.createCollection().catch((err) => {
        // NamespaceExists (48) is fine - collection already there
        if (err?.code !== 48) throw err;
      });
      await model.createIndexes();
    })().catch((err) => {
      indexesReady.delete(model); // allow retry
      throw err;
    });
    indexesReady.set(model, p);
  }
  return indexesReady.get(model);
};

// Register all schemas on default mongoose instance once
for (const [name, schema] of Object.entries(SCHEMAS)) {
  if (!mongoose.models[name]) {
    mongoose.model(name, schema);
  }
}

/**
 * Initializes and builds indexes for all hotel models on the application database.
 */
export const initAllHotelModels = async () => {
  const promises = [];
  for (const name of Object.keys(SCHEMAS)) {
    const model = mongoose.models[name];
    if (model) {
      promises.push(ensureModelReady(model));
    }
  }
  await Promise.all(promises);
};

/**
 * Retrieves a Mongoose model from the shared application database.
 * Supports:
 *   getModel(hotelId, modelName)
 *   getModel(modelName)
 *
 * @param {string} hotelIdOrModelName - The hotelId or modelName
 * @param {string} [maybeModelName] - The modelName if hotelId is passed as first arg
 * @returns {Promise<mongoose.Model>}
 */
export const getModel = async (hotelIdOrModelName, maybeModelName) => {
  const modelName = maybeModelName || hotelIdOrModelName;

  if (!SCHEMAS[modelName]) {
    throw new Error(`Schema for model '${modelName}' is not registered in schemaRegistry.`);
  }

  if (!mongoose.models[modelName]) {
    mongoose.model(modelName, SCHEMAS[modelName]);
  }

  const model = mongoose.models[modelName];
  if (mongoose.connection.readyState === 1) {
    await ensureModelReady(model);
  }
  return maybeModelName ? scopeModel(model, hotelIdOrModelName) : model;
};
