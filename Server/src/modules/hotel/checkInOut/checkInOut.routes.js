import { Router } from "express";
import * as checkInOutController from "./checkInOut.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import { checkInSchema, checkOutSchema, transferStayRoomSchema } from "./checkInOut.validation.js";

const router = Router();

router.use(authMiddleware, hotelContext);

router.post(
  "/stays/check-in",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(checkInSchema),
  checkInOutController.checkIn
);

router.post(
  "/stays/check-out",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(checkOutSchema),
  checkInOutController.checkOut
);

router.post(
  "/stays/:id/check-out",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(checkOutSchema),
  checkInOutController.checkOut
);

router.post(
  "/stays/:id/transfer-room",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(transferStayRoomSchema),
  checkInOutController.transferRoom
);

router.get("/stays", checkInOutController.getStays);

router.get("/stays/:id", validateIdParam, checkInOutController.getStayById);


export default router;
