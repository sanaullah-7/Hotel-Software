/**
 * Registers platform business domain modules.
 * Endpoints remain identical to preserve existing API behavior.
 */
import { Router } from "express";
import authRoutes from "../modules/platform/auth/auth.routes.js";
import provisioningRoutes from "../modules/platform/provisioning/provisioning.routes.js";
import hotelRegistryRoutes from "../modules/platform/hotelsRegistry/hotelRegistry.routes.js";
import userRoutes from "../modules/platform/users/user.routes.js";
import subscriptionRoutes from "../modules/platform/subscriptions/subscription.routes.js";
import financeRoutes from "../modules/platform/finance/finance.routes.js";
import auditRoutes from "../modules/platform/platformAudit/audit.routes.js";
import reportRoutes from "../modules/platform/reports/report.routes.js";
import notificationRoutes from "../modules/platform/notifications/notification.routes.js";

export const platformRouter = Router();

if (authRoutes) platformRouter.use("/auth", authRoutes);
if (provisioningRoutes) platformRouter.use("/provisioning", provisioningRoutes);
if (hotelRegistryRoutes) {
  platformRouter.use("/hotels", hotelRegistryRoutes);
  platformRouter.use("/platform/hotels", hotelRegistryRoutes);
}
if (userRoutes) {
  platformRouter.use("/users", userRoutes);
  platformRouter.use("/platform/users", userRoutes);
}
if (subscriptionRoutes) {
  platformRouter.use("/subscriptions", subscriptionRoutes);
  platformRouter.use("/platform/subscriptions", subscriptionRoutes);
}
if (financeRoutes) {
  platformRouter.use("/analytics", financeRoutes);
  platformRouter.use("/platform/analytics", financeRoutes);
  platformRouter.use("/finance", financeRoutes);
  platformRouter.use("/platform/finance", financeRoutes);
}
if (auditRoutes) {
  platformRouter.use("/audit-logs", auditRoutes);
  platformRouter.use("/platform/audit-logs", auditRoutes);
}
if (reportRoutes) {
  platformRouter.use("/reports", reportRoutes);
  platformRouter.use("/platform/reports", reportRoutes);
}
if (notificationRoutes) {
  platformRouter.use("/notifications", notificationRoutes);
  platformRouter.use("/platform/notifications", notificationRoutes);
}

export default platformRouter;
