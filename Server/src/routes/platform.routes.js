/**
 * Registers platform business domain modules.
 * Endpoints remain identical to preserve existing API behavior.
 */
import { Router } from "express";
import authRoutes from "../modules/platform/auth/auth.routes.js";
import provisioningRoutes from "../modules/platform/provisioning/provisioning.routes.js";

export const platformRouter = Router();

if (authRoutes) platformRouter.use("/auth", authRoutes);
if (provisioningRoutes) platformRouter.use("/provisioning", provisioningRoutes);

export default platformRouter;
