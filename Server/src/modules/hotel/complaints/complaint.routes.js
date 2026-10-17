import { Router } from "express";
import * as complaintController from "./complaint.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import {
  createComplaintSchema,
  updateComplaintSchema,
} from "./complaint.validation.js";

const router = Router();

// Base middleware for all complaint routes
router.use(authMiddleware, hotelContext);
router.param("id", validateIdParam);

router.post(
  "/complaints",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createComplaintSchema),
  complaintController.createComplaint
);

router.get(
  "/complaints",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  complaintController.getComplaints
);

router.get(
  "/complaints/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  complaintController.getComplaintById
);

router.patch(
  "/complaints/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateComplaintSchema),
  complaintController.updateComplaint
);

router.delete(
  "/complaints/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  complaintController.deleteComplaint
);

export default router;
