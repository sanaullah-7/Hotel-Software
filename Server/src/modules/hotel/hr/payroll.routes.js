import { Router } from 'express';
import * as payrollController from './payroll.controller.js';
import validate from '../../../middlewares/validate.middleware.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import hotelContext from '../../../middlewares/hotelContext.middleware.js';
import authorize from '../../../middlewares/rbac.middleware.js';
import { ROLES } from '../../../constants/roles.js';
import { validateIdParam } from '../../../utils/query.js';
import {
  createPayrollRunSchema,
  updatePayrollRunSchema,
  createPayrollItemSchema,
  updatePayrollItemSchema,
  queryPayrollRunSchema,
  queryPayrollItemSchema,
  updateEmployeeSalarySchema,
} from './payroll.validation.js';

const router = Router();

// Pipeline: authentication -> hotelContext -> validateIdParam
router.use(authMiddleware, hotelContext);
router.param('id', validateIdParam);

// Roster for Employee Salary management UI
router.get(
  '/payroll/roster',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  payrollController.getEmployeeSalaryRoster
);

router.put(
  '/payroll/employees/:id/salary',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateEmployeeSalarySchema),
  payrollController.updateEmployeeSalaryReference
);

// Payroll Runs
router.post(
  '/payroll/runs',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createPayrollRunSchema),
  payrollController.createPayrollRun
);

router.get(
  '/payroll/runs',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(queryPayrollRunSchema, 'query'),
  payrollController.getPayrollRuns
);

router.get(
  '/payroll/runs/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  payrollController.getPayrollRunById
);

router.put(
  '/payroll/runs/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updatePayrollRunSchema),
  payrollController.updatePayrollRun
);

router.delete(
  '/payroll/runs/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  payrollController.deletePayrollRun
);

// Payroll Items
router.post(
  '/payroll/runs/:id/items',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createPayrollItemSchema),
  payrollController.createPayrollItem
);

router.get(
  '/payroll/items',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(queryPayrollItemSchema, 'query'),
  payrollController.getPayrollItems
);

router.get(
  '/payroll/items/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  payrollController.getPayrollItemById
);

router.put(
  '/payroll/items/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updatePayrollItemSchema),
  payrollController.updatePayrollItem
);

router.delete(
  '/payroll/items/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  payrollController.deletePayrollItem
);

export default router;
