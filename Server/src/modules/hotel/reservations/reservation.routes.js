import { Router } from "express";
import * as reservationController from "./reservation.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import {
  createReservationSchema,
  updateReservationSchema,
  cancelReservationSchema,
  reassignReservationRoomSchema,
  availabilityQuerySchema,
  createGroupReservationSchema,
  updateGroupReservationSchema,
  cancelGroupReservationSchema,
} from "./reservation.validation.js";


const router = Router();

router.use(authMiddleware, hotelContext);
router.param("id", validateIdParam);

router.get(
  "/reservations/availability",
  validate(availabilityQuerySchema, "query"),
  reservationController.checkAvailability
);

router.post(
  "/reservations",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createReservationSchema),
  reservationController.createReservation
);

// Group Reservations
router.get("/reservations/groups", reservationController.getGroupReservations);
router.post(
  "/reservations/groups",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createGroupReservationSchema),
  reservationController.createGroupReservation
);
router.get("/reservations/groups/:id", reservationController.getGroupReservationById);
router.put(
  "/reservations/groups/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateGroupReservationSchema),
  reservationController.updateGroupReservation
);
router.post(
  "/reservations/groups/:id/cancel",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(cancelGroupReservationSchema),
  reservationController.cancelGroupReservation
);
router.delete(
  "/reservations/groups/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  reservationController.cancelGroupReservation
);

router.get("/reservations", reservationController.getReservations);

router.get("/reservations/:id", reservationController.getReservationById);

router.put(
  "/reservations/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateReservationSchema),
  reservationController.updateReservation
);

router.post(
  "/reservations/:id/reassign-room",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(reassignReservationRoomSchema),
  reservationController.reassignRoom
);

router.post(
  "/reservations/:id/cancel",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(cancelReservationSchema),
  reservationController.cancelReservation
);


export default router;
