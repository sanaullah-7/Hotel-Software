import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";

const router = Router();
router.use(authMiddleware, hotelContext);

router.get("/dashboard/metrics", dashboardController.getDashboardMetrics);

export default router;
