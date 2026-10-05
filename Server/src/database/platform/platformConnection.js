import mongoose from 'mongoose';
import { ENV } from '../../config/env.js';
import Account from './models/account.model.js';
import Hotel from './models/hotel.model.js';
import PasswordReset from './models/passwordReset.model.js';

// Ensure platform unique indexes (Account.email/phone, Hotel.tenant_db_name, ...) are really built
// before the app serves traffic - never rely on lazy background index creation.
const ensurePlatformIndexes = async () => {
  const results = await Promise.allSettled([Account.init(), Hotel.init(), PasswordReset.init()]);
  for (const r of results) {
    if (r.status === 'rejected') {
      console.error('Platform index creation failed:', r.reason?.message);
    }
  }
};

export const connectPlatformDB = async () => {
  if (mongoose.connection.readyState === 1) {
    await ensurePlatformIndexes();
    return mongoose.connection;
  }

  try {
    await mongoose.connect(ENV.PLATFORM_MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('Connected to Platform Database');
    await ensurePlatformIndexes();
    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to Platform Database:', error.message);
    throw error;
  }
};

export const getPlatformConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Platform database is not connected. Call connectPlatformDB() first.');
  }
  return mongoose.connection;
};

export const closePlatformDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('Platform Database connection closed.');
  }
};
