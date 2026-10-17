import { Router } from "express";
import * as restaurantController from "./restaurant.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import {
  createCategorySchema,
  updateCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  createTableSchema,
  updateTableSchema,
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
} from "./restaurant.validation.js";

const router = Router();

// Base middleware for all restaurant routes
router.use(authMiddleware, hotelContext);
router.param("id", validateIdParam);

/* ── Category Routes ─────────────────────────────────────────── */
router.post(
  "/restaurant/categories",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createCategorySchema),
  restaurantController.createCategory
);

router.get(
  "/restaurant/categories",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  restaurantController.getCategories
);

router.get(
  "/restaurant/categories/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  restaurantController.getCategoryById
);

router.put(
  "/restaurant/categories/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateCategorySchema),
  restaurantController.updateCategory
);

router.delete(
  "/restaurant/categories/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  restaurantController.deleteCategory
);

/* ── Menu Item Routes ────────────────────────────────────────── */
router.post(
  "/restaurant/menu",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createMenuItemSchema),
  restaurantController.createMenuItem
);

router.get(
  "/restaurant/menu",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  restaurantController.getMenuItems
);

router.get(
  "/restaurant/menu/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  restaurantController.getMenuItemById
);

router.put(
  "/restaurant/menu/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateMenuItemSchema),
  restaurantController.updateMenuItem
);

router.delete(
  "/restaurant/menu/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  restaurantController.deleteMenuItem
);

/* ── Table Routes ────────────────────────────────────────────── */
router.post(
  "/restaurant/tables",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createTableSchema),
  restaurantController.createTable
);

router.get(
  "/restaurant/tables",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  restaurantController.getTables
);

router.get(
  "/restaurant/tables/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  restaurantController.getTableById
);

router.put(
  "/restaurant/tables/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateTableSchema),
  restaurantController.updateTable
);

router.delete(
  "/restaurant/tables/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  restaurantController.deleteTable
);

/* ── Order & POS Routes ──────────────────────────────────────── */
router.post(
  "/restaurant/orders",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createOrderSchema),
  restaurantController.createOrder
);

router.get(
  "/restaurant/orders",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  restaurantController.getOrders
);

router.get(
  "/restaurant/orders/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  restaurantController.getOrderById
);

router.put(
  "/restaurant/orders/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateOrderSchema),
  restaurantController.updateOrder
);

router.patch(
  "/restaurant/orders/:id/status",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateOrderStatusSchema),
  restaurantController.updateOrderStatus
);

router.delete(
  "/restaurant/orders/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  restaurantController.deleteOrder
);

export default router;
