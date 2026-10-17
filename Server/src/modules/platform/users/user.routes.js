import { Router } from "express";
import * as userController from "./user.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = Router();

// All user management routes strictly restricted to Platform Super Admins
router.use(authMiddleware);
router.use(authorize(ROLES.PLATFORM_ADMIN));

router.get("/stats", userController.getUserStats);
router.get("/:id", userController.getUserById);
router.get("/", userController.getUsers);

router.patch("/:id/activate", userController.activateUser);
router.patch("/:id/suspend", userController.suspendUser);
router.post("/:id/assign-hotel", userController.assignHotel);

export default router;
