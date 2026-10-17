/**
 * connectionManager.js
 *
 * Manages dynamic MongoDB connections for tenant-isolated hotel operational databases.
 * Uses a connection registry (caching) to avoid opening a new connection for every request.
 *
 * Hardening:
 *  - hotelId is restricted to a safe charset so it can never inject into the DB name/URI.
 *  - Concurrent first-time requests share ONE in-flight connection promise (no duplicate
 *    connections / leaked pools).
 *  - autoIndex is disabled; modelFactory explicitly awaits index creation for the models that
 *    are actually used, so unique indexes are guaranteed to exist BEFORE the first write.
 */
import mongoose from 'mongoose';
import { ENV } from '../config/env.js';

const connections = new Map();
const pending = new Map();

const SAFE_HOTEL_ID = /^[A-Za-z0-9_]{1,64}$/;

/**
 * Retrieves an active Mongoose connection for a specific hotel tenant.
 * If the connection does not exist, it securely creates and caches one.
 *
 * @param {string} hotelId - The Platform ID of the hotel.
 * @returns {Promise<mongoose.Connection>}
 */
export const getHotelConnection = async (hotelId) => {
  if (!hotelId) throw new Error('Hotel ID is required to resolve database connection.');

  const key = String(hotelId);
  if (!SAFE_HOTEL_ID.test(key)) {
    throw new Error('Invalid hotel ID.');
  }

  const cached = connections.get(key);
  if (cached && cached.readyState === 1) return cached;

  if (pending.has(key)) return pending.get(key);

  const baseUri = ENV.MONGODB_HOTEL_BASE_URI || 'mongodb://localhost:27017/hotel_';
  const tenantUri = `${baseUri}${key}`;

  const promise = (async () => {
    try {
      const connection = await mongoose
        .createConnection(tenantUri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          autoIndex: false,
        })
        .asPromise();

      connections.set(key, connection);

      connection.on('error', (err) => {
        console.error(`Hotel DB Connection Error [${key}]:`, err.message);
      });

      connection.on('disconnected', () => {
        if (connections.get(key) === connection) connections.delete(key);
      });

      return connection;
    } catch (error) {
      throw new Error(`Failed to establish connection for hotel ${key}: ${error.message}`);
    } finally {
      pending.delete(key);
    }
  })();

  pending.set(key, promise);
  return promise;
};

/**
 * Drops the tenant database and evicts the cached connection.
 * Used ONLY to roll back a failed provisioning attempt.
 */
export const dropHotelDatabase = async (hotelId) => {
  const key = String(hotelId);
  if (!SAFE_HOTEL_ID.test(key)) return;
  const conn = connections.get(key) || (pending.has(key) ? await pending.get(key) : null);
  if (!conn) return;
  try {
    await conn.dropDatabase();
  } finally {
    connections.delete(key);
    await conn.close().catch(() => {});
  }
};

/**
 * Gracefully closes all cached hotel connections.
 */
export const closeAllHotelConnections = async () => {
  for (const [hotelId, conn] of connections.entries()) {
    await conn.close();
    connections.delete(hotelId);
  }
};
