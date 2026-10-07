import { Router } from "express";
import * as housekeepingController from "./housekeeping.controller.js";
import * as lostAndFoundController from "./lostAndFound.controller.js";
import * as inspectionController from "./inspection.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import { createHousekeepingTaskSchema, updateHousekeepingTaskSchema } from "./housekeeping.validation.js";
import { createLostFoundItemSchema, updateLostFoundItemSchema } from "./lostAndFound.validation.js";
import {
  createInspectionSchema,
  updateInspectionSchema,
  createChecklistSchema,
  updateChecklistSchema,
} from "./inspection.validation.js";

const router = Router();

router.use(authMiddleware, hotelContext);

// Housekeeping Tasks
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

router.delete(
  "/housekeeping/tasks/:id",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  housekeepingController.deleteTask
);

// Lost and Found
router.post(
  "/housekeeping/lost-and-found",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createLostFoundItemSchema),
  lostAndFoundController.createItem
);

router.get("/housekeeping/lost-and-found", lostAndFoundController.getItems);

router.get(
  "/housekeeping/lost-and-found/:id",
  validateIdParam,
  lostAndFoundController.getItemById
);

router.put(
  "/housekeeping/lost-and-found/:id",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateLostFoundItemSchema),
  lostAndFoundController.updateItem
);

router.delete(
  "/housekeeping/lost-and-found/:id",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  lostAndFoundController.deleteItem
);

// Inspection Checklist Templates
router.post(
  "/housekeeping/checklists",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createChecklistSchema),
  inspectionController.createChecklist
);

router.get("/housekeeping/checklists", inspectionController.getChecklists);

router.get(
  "/housekeeping/checklists/:id",
  validateIdParam,
  inspectionController.getChecklistById
);

router.put(
  "/housekeeping/checklists/:id",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateChecklistSchema),
  inspectionController.updateChecklist
);

router.delete(
  "/housekeeping/checklists/:id",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  inspectionController.deleteChecklist
);

// Inspections
router.post(
  "/housekeeping/inspections",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createInspectionSchema),
  inspectionController.createInspection
);

router.get("/housekeeping/inspections", inspectionController.getInspections);

router.get(
  "/housekeeping/inspections/:id",
  validateIdParam,
  inspectionController.getInspectionById
);

router.put(
  "/housekeeping/inspections/:id",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateInspectionSchema),
  inspectionController.updateInspection
);

router.delete(
  "/housekeeping/inspections/:id",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  inspectionController.deleteInspection
);

export default router;
