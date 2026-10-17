import { Router } from 'express';
import * as cashShiftController from './cashShift.controller.js';
import validate from '../../../middlewares/validate.middleware.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import hotelContext from '../../../middlewares/hotelContext.middleware.js';
import authorize from '../../../middlewares/rbac.middleware.js';
import { ROLES } from '../../../constants/roles.js';
import { validateIdParam } from '../../../utils/query.js';
import {
  openShiftSchema,
  closeShiftSchema,
  getShiftsQuerySchema,
} from './cashShift.validation.js';

const router = Router();

router.use(authMiddleware, hotelContext);

router.post(
  '/shifts/open',
  authorize(ROLES.HOTEL_ADMIN, ROLES.HOTEL_USER, ROLES.PLATFORM_ADMIN),
  validate(openShiftSchema),
  cashShiftController.openShift
);

router.get(
  '/shifts/active',
  authorize(ROLES.HOTEL_ADMIN, ROLES.HOTEL_USER, ROLES.PLATFORM_ADMIN),
  cashShiftController.getActiveShift
);

router.post(
  '/shifts/close',
  authorize(ROLES.HOTEL_ADMIN, ROLES.HOTEL_USER, ROLES.PLATFORM_ADMIN),
  validate(closeShiftSchema),
  cashShiftController.closeShift
);

router.get(
  '/shifts',
  authorize(ROLES.HOTEL_ADMIN, ROLES.HOTEL_USER, ROLES.PLATFORM_ADMIN),
  validate(getShiftsQuerySchema, 'query'),
  cashShiftController.getShifts
);

router.get(
  '/shifts/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.HOTEL_USER, ROLES.PLATFORM_ADMIN),
  validateIdParam,
  cashShiftController.getShiftById
);

export default router;
