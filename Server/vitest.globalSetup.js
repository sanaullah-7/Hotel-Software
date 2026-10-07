import mongoose from 'mongoose';

// Only this suite's explicitly configured database may be destroyed.
const testUri = 'mongodb://localhost:27017/test_explore_pakistan';
export async function setup() {
  return async () => {
    const connection = await mongoose.createConnection(testUri, {
      serverSelectionTimeoutMS: 5000,
    }).asPromise();
    try {
      if (connection.name !== 'test_explore_pakistan') {
        throw new Error('Refusing cleanup outside the dedicated test database');
      }
      await connection.dropDatabase();
    } finally {
      await connection.close();
    }
  };
}
