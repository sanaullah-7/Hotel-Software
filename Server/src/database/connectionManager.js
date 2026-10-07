/**
 * connectionManager.js
 *
 * In the Single Shared Database architecture, all operations use the single
 * application connection (explore_pakistan).
 *
 * This module provides backward-compatible helper functions for database operations.
 */
import mongoose from 'mongoose';
import { SCHEMAS } from './hotel/schemaRegistry.js';

/**
 * Returns the active shared database connection.
 *
 * @param {string} [hotelId] - The hotel ID (for interface compatibility)
 * @returns {Promise<mongoose.Connection>}
 */
export const getHotelConnection = async (hotelId) => {
  return mongoose.connection;
};

/**
 * Cleans up hotel-scoped documents if a rollback is triggered.
 *
 * @param {string} hotelId
 */
export const deleteHotelDocuments = async (hotelId) => {
  if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
    throw new Error('A valid hotelId is required for provisioning cleanup');
  }
  const targetId = new mongoose.Types.ObjectId(hotelId);
  for (const name of Object.keys(SCHEMAS)) {
    const model = mongoose.models[name];
    if (model) {
      await model.deleteMany({ hotelId: targetId });
    }
  }
};

/**
 * Gracefully closes database connection if needed.
 */
export const closeAllHotelConnections = async () => {
  // Shared connection is managed centrally
};
