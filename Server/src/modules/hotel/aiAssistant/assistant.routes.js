import { Router } from "express";
import * as assistantController from "./assistant.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { askAssistantSchema } from "./assistant.validation.js";

const router = Router();

// Base middleware for all hotel AI assistant routes
router.use(authMiddleware, hotelContext);

router.post(
  "/assistant/chat",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(askAssistantSchema),
  assistantController.askAssistant
);

router.get(
  "/assistant/summary",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  assistantController.getAssistantSummary
);

router.get(
  "/assistant/suggestions",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  assistantController.getAssistantSuggestions
);

export default router;
