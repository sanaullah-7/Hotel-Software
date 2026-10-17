import { Router } from "express";
import * as leaveController from "./leaveRequest.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import {
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
} from "./leaveRequest.validation.js";

const router = Router();

// Pipeline: authentication -> hotelContext -> validateIdParam
router.use(authMiddleware, hotelContext);
router.param("id", validateIdParam);

router.post(
  "/leave-requests",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createLeaveRequestSchema),
  leaveController.createLeaveRequest
);

router.get(
  "/leave-requests",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  leaveController.getLeaveRequests
);

router.get(
  "/leave-requests/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  leaveController.getLeaveRequestById
);

router.put(
  "/leave-requests/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateLeaveRequestSchema),
  leaveController.updateLeaveRequest
);

router.delete(
  "/leave-requests/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  leaveController.deleteLeaveRequest
);

export default router;
