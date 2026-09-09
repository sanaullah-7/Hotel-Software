import express from "express";
const app = express();


// API Route
app.get('/', (req, res) => {
    res.send("Api is Running and must i will block it.");
});

export default app;
