import { Router } from "express";
import * as departmentController from "./department.controller.js";
import * as employeeController from "./employee.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createEmployeeSchema,
  updateEmployeeSchema
} from "./organization.validation.js";

const router = Router();

// Pipeline: authentication -> tenant context -> (per-route) RBAC -> validation -> controller
router.use(authMiddleware, hotelContext);
router.param("id", validateIdParam);

// ----------------------------------------------------
// Departments
// ----------------------------------------------------
router.post(
  "/departments",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createDepartmentSchema),
  departmentController.createDepartment
);
router.get("/departments", departmentController.getDepartments);
router.get("/departments/:id", departmentController.getDepartmentById);
router.put(
  "/departments/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateDepartmentSchema),
  departmentController.updateDepartment
);
router.delete(
  "/departments/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  departmentController.deleteDepartment
);

// ----------------------------------------------------
// Employees
// ----------------------------------------------------
router.post(
  "/employees",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createEmployeeSchema),
  employeeController.createEmployee
);
router.get("/employees", employeeController.getEmployees);
router.get("/employees/:id", employeeController.getEmployeeById);
router.put(
  "/employees/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateEmployeeSchema),
  employeeController.updateEmployee
);
router.delete(
  "/employees/:id",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  employeeController.deleteEmployee
);

export default router;
