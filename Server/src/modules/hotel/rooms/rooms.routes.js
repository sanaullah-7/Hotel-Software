import { Router } from "express";
import * as amenityController from "./amenity.controller.js";
import * as roomTypeController from "./roomType.controller.js";
import * as roomController from "./room.controller.js";
import * as tapeChartController from "./tapeChart.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import {
  createAmenitySchema,
  updateAmenitySchema,
  createRoomTypeSchema,
  updateRoomTypeSchema,
  createRoomSchema,
  updateRoomSchema
} from "./rooms.validation.js";
import { validateTapeChartQuery } from "./tapeChart.validation.js";

const router = Router();

// Pipeline: authentication -> tenant context -> (per-route) RBAC -> validation -> controller
router.use(authMiddleware, hotelContext);
router.param("id", validateIdParam);

// ----------------------------------------------------
// Amenities
// ----------------------------------------------------
router.post(
  "/amenities",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createAmenitySchema),
  amenityController.createAmenity
);
router.get("/amenities", amenityController.getAmenities);
router.get("/amenities/:id", amenityController.getAmenityById);
router.put(
  "/amenities/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateAmenitySchema),
  amenityController.updateAmenity
);
router.delete(
  "/amenities/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  amenityController.deleteAmenity
);

// ----------------------------------------------------
// Room Types
// ----------------------------------------------------
router.post(
  "/room-types",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createRoomTypeSchema),
  roomTypeController.createRoomType
);
router.get("/room-types", roomTypeController.getRoomTypes);
router.get("/room-types/:id", roomTypeController.getRoomTypeById);
router.put(
  "/room-types/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateRoomTypeSchema),
  roomTypeController.updateRoomType
);
router.delete(
  "/room-types/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  roomTypeController.deleteRoomType
);

// ----------------------------------------------------
// Rooms
// ----------------------------------------------------
router.post(
  "/rooms",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createRoomSchema),
  roomController.createRoom
);
router.get("/rooms", roomController.getRooms);
router.get(
  "/rooms/tape-chart",
  authorize(ROLES.HOTEL_ADMIN, ROLES.HOTEL_USER, ROLES.PLATFORM_ADMIN),
  validateTapeChartQuery,
  tapeChartController.getTapeChart
);
router.get("/rooms/:id", roomController.getRoomById);
router.put(
  "/rooms/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER), // Allows standard users (like reception/housekeeping) to update status
  validate(updateRoomSchema),
  roomController.updateRoom
);
router.delete(
  "/rooms/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  roomController.deleteRoom
);

export default router;
