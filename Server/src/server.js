import app from './app.js';
import connectDB from './config/db.js';
import { ENV } from "./config/env.js";
import logger from "./config/logger.js";

//  const  PORT = process.env.PORT || 7000;
 
// 1. Pehle Database Connect karein
connectDB()
  .then(() => {
    // 2. DB Connection kamyab hone ke baad server start hoga
    app.listen(ENV.PORT, () => {  
      logger.info(`Server Running on PORT http://localhost:${ENV.PORT}`);
    });
   
  })
  .catch((error) => {
    logger.error("Database connection failed:", error.message); 
  });


  // chatgpt
//   const startServer = async () => {
//   await connectDatabase();

//   app.listen(env.PORT, () => {
//     console.log(
//       `Server started on port ${env.PORT}`
//     );
//   });
// };