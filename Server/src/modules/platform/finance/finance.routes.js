import { Router } from "express";
import * as financeController from "./finance.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = Router();

// Strictly guard financial telemetry and ledger behind Super Admin
router.use(authMiddleware);
router.use(authorize(ROLES.PLATFORM_ADMIN));

router.get("/overview", financeController.getRevenueOverview);
router.get("/revenue", financeController.getRevenueTrend);
router.get("/hotel-growth", financeController.getHotelGrowth);
router.get("/user-growth", financeController.getUserGrowth);
router.get("/recent-activity", financeController.getRecentActivity);
router.get("/dashboard", financeController.getDashboardAnalytics);
router.get("/transactions", financeController.getTransactions);
router.post("/transactions", financeController.recordTransaction);

export default router;
