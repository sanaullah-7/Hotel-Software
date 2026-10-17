import { Router } from "express";
import * as subscriptionController from "./subscription.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = Router();

// SuperAdmin protected routes
router.use(authMiddleware);
router.use(authorize(ROLES.PLATFORM_ADMIN));

router.get("/plans", subscriptionController.getPlans);
router.get("/plans/:id", subscriptionController.getPlanById);
router.patch("/plans/:id", subscriptionController.updatePlan);
router.put("/plans/:id", subscriptionController.updatePlan);

router.get("/stats", subscriptionController.getSubscriptionStats);
router.get("/:id", subscriptionController.getSubscriptions);
router.get("/", subscriptionController.getSubscriptions);

router.patch("/:id", subscriptionController.updateSubscription);
router.put("/:id", subscriptionController.updateSubscription);

export default router;
