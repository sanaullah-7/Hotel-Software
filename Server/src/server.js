import app from './app.js';
import connectDB from './config/db.js';


 const  PORT = process.env.PORT || 7000;
 
// 1. Pehle Database Connect karein
connectDB()
  .then(() => {
    // 2. Connection kamyab hone ke baad server start hoga
    app.listen(PORT, () => {  
      console.log(`Server Running on PORT http://localhost:${PORT}`);
    });
   
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message); 
  });
