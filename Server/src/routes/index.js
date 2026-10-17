/**
 * Main API route entry point.
 * API versioning: /api/v1
 */
import { Router } from "express";
import platformRouter from "./platform.routes.js";
import hotelPmsRouter from "./hotel.routes.js";

const router = Router();

router.use(platformRouter);
router.use(hotelPmsRouter);

export default router;