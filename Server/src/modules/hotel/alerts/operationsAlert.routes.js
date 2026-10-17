import { Router } from "express";
import * as alertController from "./operationsAlert.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import {
  createAlertSchema,
  updateAlertSchema,
} from "./operationsAlert.validation.js";

const router = Router();

// Base middleware for all operations alert routes
router.use(authMiddleware, hotelContext);
router.param("id", validateIdParam);

router.post(
  "/operations-alerts",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createAlertSchema),
  alertController.createAlert
);

router.get(
  "/operations-alerts",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  alertController.getAlerts
);

router.get(
  "/operations-alerts/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  alertController.getAlertById
);

router.patch(
  "/operations-alerts/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateAlertSchema),
  alertController.updateAlert
);

router.delete(
  "/operations-alerts/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  alertController.deleteAlert
);

export default router;
