import { Router } from "express";
import * as reportController from "./report.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = Router();

// Strictly guard reports behind Platform Super Admin
router.use(authMiddleware);
router.use(authorize(ROLES.PLATFORM_ADMIN));

router.get("/hotels", reportController.getHotelReport);
router.get("/revenue", reportController.getRevenueReport);
router.get("/users", reportController.getUserReport);

export default router;
