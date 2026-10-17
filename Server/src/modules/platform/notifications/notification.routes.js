import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = Router();

// Strictly guard notifications behind Platform Super Admin
router.use(authMiddleware);
router.use(authorize(ROLES.PLATFORM_ADMIN));

router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);
router.get("/", notificationController.getNotifications);
router.post("/", notificationController.createNotification);

export default router;
