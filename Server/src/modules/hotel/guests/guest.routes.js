import { Router } from "express";
import * as guestController from "./guest.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import { createGuestSchema, updateGuestSchema } from "./guest.validation.js";

const router = Router();

// Base middleware for all guest routes
router.use(authMiddleware, hotelContext);
router.param("id", validateIdParam);

router.post(
  "/guests",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createGuestSchema),
  guestController.createGuest
);

router.get("/guests", guestController.getGuests);

router.get("/guests/:id", guestController.getGuestById);

router.put(
  "/guests/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateGuestSchema),
  guestController.updateGuest
);

router.delete(
  "/guests/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  guestController.deleteGuest
);

export default router;
