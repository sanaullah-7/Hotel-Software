import mongoose from 'mongoose';

async function dropIndexes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/explore_pakistan');
    console.log('Connected to DB');
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      console.log('Dropping indexes for', collection.collectionName);
      try {
        await collection.dropIndexes();
      } catch (e) {
        console.log('Error dropping index for', collection.collectionName, e.message);
      }
    }
    console.log('All indexes dropped successfully. Mongoose will rebuild them automatically on next start.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

dropIndexes();
