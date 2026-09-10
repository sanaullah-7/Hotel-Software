import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.config.js';


console.log(process.env.MONGO_URI)

const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    // Connect to the database
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1); // Exit the process with failure
  }
}

startServer();