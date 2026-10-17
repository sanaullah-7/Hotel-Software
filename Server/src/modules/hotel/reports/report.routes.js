import { Router } from "express";
import * as expenseController from "./expense.controller.js";
import * as reportController from "./report.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
  bulkDeleteExpensesSchema,
} from "./expense.validation.js";

const router = Router();

// Base middleware for all hotel reports and expense routes
router.use(authMiddleware, hotelContext);

// =============================================================================
// REPORT AGGREGATION ROUTES
// =============================================================================

router.get(
  "/reports/revenue",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  reportController.getRevenueReport
);

router.get(
  "/reports/occupancy",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  reportController.getOccupancyReport
);

router.get(
  "/reports/expense-vs-revenue",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  reportController.getExpenseVsRevenueReport
);

router.get(
  "/reports/summary",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  reportController.getAllReportsSummary
);

// =============================================================================
// EXPENSE ROUTES (Static before :id)
// =============================================================================

router.get(
  "/expenses/summary",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  expenseController.getExpenseSummary
);

router.post(
  "/expenses/bulk-delete",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(bulkDeleteExpensesSchema),
  expenseController.bulkDeleteExpenses
);

router.get(
  "/expenses",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  expenseController.getExpenses
);

router.post(
  "/expenses",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createExpenseSchema),
  expenseController.createExpense
);

router.get(
  "/expenses/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  expenseController.getExpenseById
);

router.put(
  "/expenses/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateExpenseSchema),
  expenseController.updateExpense
);

router.delete(
  "/expenses/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  expenseController.deleteExpense
);

export default router;
