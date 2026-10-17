import { Router } from "express";
import * as eventController from "./event.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import {
  createEventSchema,
  updateEventSchema,
  bulkDeleteEventsSchema,
  createBeoSchema,
  updateBeoSchema,
} from "./event.validation.js";

const router = Router();

// Base middleware for all hotel event routes
router.use(authMiddleware, hotelContext);

// =============================================================================
// BEOs (BANQUET MANAGER) ROUTES (defined before generic :id)
// =============================================================================

router.get(
  "/events/beos/metrics",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  eventController.getBeoMetrics
);

router.get(
  "/events/beos",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  eventController.getBeos
);

router.post(
  "/events/beos",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createBeoSchema),
  eventController.createBeo
);

router.get(
  "/events/beos/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  eventController.getBeoById
);

router.put(
  "/events/beos/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateBeoSchema),
  eventController.updateBeo
);

router.delete(
  "/events/beos/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  eventController.deleteBeo
);

// =============================================================================
// EVENT METRICS & BULK OPERATIONS (defined before generic :id)
// =============================================================================

router.get(
  "/events/metrics",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  eventController.getEventMetrics
);

router.post(
  "/events/bulk-delete",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(bulkDeleteEventsSchema),
  eventController.bulkDeleteEvents
);

// =============================================================================
// EVENT CRUD ROUTES
// =============================================================================

router.get(
  "/events",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  eventController.getEvents
);

router.post(
  "/events",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createEventSchema),
  eventController.createEvent
);

router.get(
  "/events/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  eventController.getEventById
);

router.put(
  "/events/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateEventSchema),
  eventController.updateEvent
);

router.delete(
  "/events/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  eventController.deleteEvent
);

export default router;
