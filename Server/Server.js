import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = 5000

// API Route
app.get('/', (req, res) => {
    res.send("Api is Running and must i will block it.");
});

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