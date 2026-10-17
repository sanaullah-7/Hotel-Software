import { Router } from "express";
import * as inventoryController from "./inventory.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  createInventoryIncidentSchema,
  updateInventoryIncidentSchema,
  stockAdjustmentSchema,
} from "./inventory.validation.js";

const router = Router();

// Base middleware for all inventory routes
router.use(authMiddleware, hotelContext);
router.param("id", validateIdParam);

// =============================================================================
// INCIDENT ROUTES (must precede :id item wildcard)
// =============================================================================
router.post(
  "/inventory/incidents",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createInventoryIncidentSchema),
  inventoryController.createIncident
);

router.get(
  "/inventory/incidents",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  inventoryController.getIncidents
);

router.get(
  "/inventory/incidents/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  inventoryController.getIncidentById
);

router.patch(
  "/inventory/incidents/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateInventoryIncidentSchema),
  inventoryController.updateIncident
);

// =============================================================================
// GLOBAL MOVEMENTS ROUTE (must precede :id item wildcard)
// =============================================================================
router.get(
  "/inventory/movements",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  inventoryController.getMovements
);

// =============================================================================
// INVENTORY ITEM ROUTES & STOCK OPERATIONS
// =============================================================================
router.post(
  "/inventory",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createInventoryItemSchema),
  inventoryController.createItem
);

router.get(
  "/inventory",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  inventoryController.getItems
);

router.get(
  "/inventory/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  inventoryController.getItemById
);

router.patch(
  "/inventory/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateInventoryItemSchema),
  inventoryController.updateItem
);

router.delete(
  "/inventory/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  inventoryController.deactivateItem
);

router.post(
  "/inventory/:id/adjust",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(stockAdjustmentSchema),
  inventoryController.adjustStock
);

router.get(
  "/inventory/:id/movements",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  inventoryController.getItemMovements
);

export default router;
