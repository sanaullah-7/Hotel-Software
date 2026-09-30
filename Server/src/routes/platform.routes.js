/**
 * Registers platform business domain modules.
 * Endpoints remain identical to preserve existing API behavior.
 */
import { Router } from "express";
import authRoutes from "../modules/platform/auth/auth.routes.js";

export const platformRouter = Router();

if (authRoutes) platformRouter.use("/auth", authRoutes);

export default platformRouter;
