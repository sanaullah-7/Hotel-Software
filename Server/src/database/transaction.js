import mongoose from 'mongoose';

/**
 * Executes a callback within a MongoDB session transaction on the shared application database.
 * Falls back safely if the underlying MongoDB deployment does not support transactions.
 * 
 * @param {string|Function} hotelIdOrCallback - The hotelId or the callback if hotelId is omitted
 * @param {Function} [maybeCallback] - The operations to perform. Receives the session object.
 * @returns {Promise<any>}
 */
export const withTransaction = async (hotelIdOrCallback, maybeCallback) => {
  const callback = typeof hotelIdOrCallback === 'function' ? hotelIdOrCallback : maybeCallback;
  
  let session = null;
  try {
    session = await mongoose.startSession();
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
