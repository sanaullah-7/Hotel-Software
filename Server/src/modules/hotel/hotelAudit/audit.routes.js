import { Router } from "express";
import * as auditController from "./audit.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { createAuditLogSchema } from "./audit.validation.js";

const router = Router();

// Base middleware for all hotel audit routes
router.use(authMiddleware, hotelContext);

router.get(
  "/audit-logs/metrics",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  auditController.getAuditMetrics
);

router.get(
  "/audit-logs",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  auditController.getAuditLogs
);

router.post(
  "/audit-logs",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createAuditLogSchema),
  auditController.createAuditLog
);

router.get(
  "/audit-logs/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  auditController.getAuditLogById
);

export default router;
