import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
// aur modules ki routes yahan add hoti jayengi: hotels, bookings, payments, etc.

export default router;

// chagpt
// import { Router } from "express";

// import authRoutes from "../modules/auth/auth.routes.js";

// const router = Router();

// router.use("/auth", authRoutes);

// export default router;