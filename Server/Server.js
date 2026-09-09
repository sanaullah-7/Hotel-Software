import app from "./app.js"; // app instance ko import kiya
import mongoose from "mongoose";


const PORT = 5000

// DB Connection & Server Start
mongoose.connect("mongodb://localhost:27017/Hotel") // Changed localhost to 127.0.0.1
    .then(() => {
        console.log("MongoDB Connected!");
        
        // Start the server ONLY after the database is connected
        app.listen(PORT, () => {
            console.log(`Server is Running on PORT http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.log("DB Connection Failed:", error.message);
    });