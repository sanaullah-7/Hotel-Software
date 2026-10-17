import { getHotelConnection } from './connectionManager.js';

/**
 * Executes a callback within a MongoDB session transaction.
 * Falls back safely if the underlying MongoDB deployment does not support transactions.
 * 
 * @param {string} hotelId - The hotel tenant ID
 * @param {Function} callback - The operations to perform. Receives the session object.
 * @returns {Promise<any>}
 */
export const withTransaction = async (hotelId, callback) => {
  const connection = await getHotelConnection(hotelId);
  
  let session = null;
  try {
    session = await connection.startSession();
  } catch (err) {
    return await callback(null);
  }

  let result;
  try {
    await session.withTransaction(async (sess) => {
      result = await callback(sess);
    });
  } catch (err) {
    if (
      err.name === "MongoServerError" &&
      (err.message.includes("retryable writes") ||
       err.message.includes("Transaction numbers are only allowed") ||
       err.message.includes("Standalone"))
    ) {
      result = await callback(null);
    } else {
      throw err;
    }
  } finally {
    if (session) {
      await session.endSession().catch(() => {});
    }
  }

  return result;
};
