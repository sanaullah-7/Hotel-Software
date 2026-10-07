import mongoose from 'mongoose';
import { ENV } from '../../config/env.js';
import Account from './models/account.model.js';
import Hotel from './models/hotel.model.js';
import PasswordReset from './models/passwordReset.model.js';
import { initAllHotelModels } from '../hotel/modelFactory.js';

const ensurePlatformIndexes = async () => {
  await Promise.all([Account.init(), Hotel.init(), PasswordReset.init()]);
};

export const connectPlatformDB = async (customUri) => {
  const uri = customUri || ENV.MONGODB_URI;
  const expectedDatabase = ENV.NODE_ENV === 'test' ? 'test_explore_pakistan' : 'explore_pakistan';
  const databaseName = uri.match(/\/([^/?]+)(?:\?.*)?$/)?.[1];
  if (databaseName !== expectedDatabase) {
    throw new Error(`Refusing connection: expected the ${expectedDatabase} database`);
  }

  if (mongoose.connection.readyState === 1) {
    if (mongoose.connection.name !== expectedDatabase) {
      throw new Error('The active MongoDB connection uses an unexpected database');
    }
    await ensurePlatformIndexes();
    await initAllHotelModels();
    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`Connected to Explore Pakistan Database: ${uri}`);
    await ensurePlatformIndexes();
    await initAllHotelModels();
    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to Explore Pakistan Database:', error.message);
    throw error;
  }
};

export const getPlatformConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database is not connected. Call connectPlatformDB() first.');
  }
  return mongoose.connection;
};

export const closePlatformDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('Explore Pakistan Database connection closed.');
  }
};
