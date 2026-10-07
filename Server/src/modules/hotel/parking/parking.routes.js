import { Router } from "express";
import * as parkingController from "./parking.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import {
  createParkingSpaceSchema,
  updateParkingSpaceStatusSchema,
  createParkingRecordSchema,
  updateParkingRecordSchema,
  checkoutParkingRecordSchema,
} from "./parking.validation.js";

const router = Router();

// Base middleware for all hotel parking routes
router.use(authMiddleware, hotelContext);

// SPACES
router.get(
  "/parking/spaces",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  parkingController.getParkingSpaces
);

router.post(
  "/parking/spaces",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createParkingSpaceSchema),
  parkingController.createParkingSpace
);

router.patch(
  "/parking/spaces/:id/status",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateParkingSpaceStatusSchema),
  parkingController.updateParkingSpaceStatus
);

router.delete(
  "/parking/spaces/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  parkingController.deleteParkingSpace
);

// METRICS
router.get(
  "/parking/metrics",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  parkingController.getParkingMetrics
);

// RECORDS
router.get(
  "/parking/records",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  parkingController.getParkingRecords
);

router.post(
  "/parking/records",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createParkingRecordSchema),
  parkingController.createParkingRecord
);

router.get(
  "/parking/records/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  parkingController.getParkingRecordById
);

router.patch(
  "/parking/records/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateParkingRecordSchema),
  parkingController.updateParkingRecord
);

router.post(
  "/parking/records/:id/checkout",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(checkoutParkingRecordSchema),
  parkingController.checkoutParkingRecord
);

router.delete(
  "/parking/records/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  parkingController.deleteParkingRecord
);

export default router;
