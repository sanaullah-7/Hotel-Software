import { Router } from "express";
import * as housekeepingController from "./housekeeping.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import { createHousekeepingTaskSchema, updateHousekeepingTaskSchema } from "./housekeeping.validation.js";

const router = Router();

router.use(authMiddleware, hotelContext);

router.post(
  "/housekeeping/tasks",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createHousekeepingTaskSchema),
  housekeepingController.createTask
);

router.get("/housekeeping/tasks", housekeepingController.getTasks);

router.put(
  "/housekeeping/tasks/:id",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateHousekeepingTaskSchema),
  housekeepingController.updateTask
);

export default router;
