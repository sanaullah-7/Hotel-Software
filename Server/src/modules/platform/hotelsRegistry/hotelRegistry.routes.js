import { Router } from "express";
import * as hotelRegistryController from "./hotelRegistry.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = Router();

// All hotel registry routes are restricted strictly to Platform Super Admins
router.use(authMiddleware);
router.use(authorize(ROLES.PLATFORM_ADMIN));

router.get("/stats", hotelRegistryController.getHotelStats);
router.get("/:id", hotelRegistryController.getHotelById);
router.get("/", hotelRegistryController.getHotels);

router.patch("/:id/approve", hotelRegistryController.approveHotel);
router.patch("/:id/reject", hotelRegistryController.rejectHotel);
router.patch("/:id/suspend", hotelRegistryController.suspendHotel);
router.patch("/:id/reactivate", hotelRegistryController.reactivateHotel);

export default router;
