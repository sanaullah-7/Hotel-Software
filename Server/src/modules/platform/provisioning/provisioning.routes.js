import { Router } from "express";
import * as provisioningController from "./provisioning.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { onboardSchema } from "./provisioning.validation.js";

const router = Router();

// Onboarding route: Requires authentication but MUST NOT use hotelContext
// because the user does not have a hotel yet.
router.post(
  "/onboard",
  authMiddleware,
  validate(onboardSchema),
  provisioningController.onboard
);

export default router;
