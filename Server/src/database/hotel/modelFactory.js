import { getHotelConnection } from '../connectionManager.js';
import { SCHEMAS } from './schemaRegistry.js';

const indexesReady = new WeakMap(); // Model -> Promise

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

/**
 * Retrieves a Mongoose model bound to the specific hotel's connection.
 * Automatically ensures all tenant schemas are registered on the connection
 * so populate() cross-model references never throw MissingSchemaError.
 *
 * The requested model's collection + indexes are awaited (once per connection) so
 * database-level unique constraints are ALWAYS in force before the first write.
 *
 * @param {string} hotelId - The hotel tenant ID
 * @param {string} modelName - The name of the model to retrieve (must exist in SCHEMAS)
 * @returns {Promise<mongoose.Model>}
 */
export const getModel = async (hotelIdOrConnection, modelName) => {
  let connection;
  if (hotelIdOrConnection && typeof hotelIdOrConnection === 'object' && hotelIdOrConnection.models) {
    connection = hotelIdOrConnection;
  } else {
    connection = await getHotelConnection(hotelIdOrConnection);
  }

  if (!SCHEMAS[modelName]) {
    throw new Error(`Schema for model '${modelName}' is not registered in schemaRegistry.`);
  }

  // Pre-register all tenant schemas on this connection to ensure populates succeed
  for (const [name, schema] of Object.entries(SCHEMAS)) {
    if (!connection.models[name]) {
      connection.model(name, schema);
    }
  }

  const model = connection.models[modelName];
  await ensureModelReady(model);
  return model;
};
