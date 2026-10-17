import { Router } from 'express';
import * as attendanceController from './attendance.controller.js';
import validate from '../../../middlewares/validate.middleware.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import hotelContext from '../../../middlewares/hotelContext.middleware.js';
import authorize from '../../../middlewares/rbac.middleware.js';
import { ROLES } from '../../../constants/roles.js';
import { validateIdParam } from '../../../utils/query.js';
import {
  createAttendanceSchema,
  updateAttendanceSchema,
  queryAttendanceSchema,
} from './attendance.validation.js';

const router = Router();

// Pipeline: authentication -> hotelContext -> validateIdParam
router.use(authMiddleware, hotelContext);
router.param('id', validateIdParam);

router.post(
  '/attendance',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createAttendanceSchema),
  attendanceController.createAttendance
);

router.get(
  '/attendance',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  attendanceController.getAttendance
);

router.get(
  '/attendance/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  attendanceController.getAttendanceById
);

router.put(
  '/attendance/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateAttendanceSchema),
  attendanceController.updateAttendance
);

router.delete(
  '/attendance/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  attendanceController.deleteAttendance
);

export default router;
