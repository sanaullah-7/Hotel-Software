import { Router } from 'express';
import * as quickSearchController from './quickSearch.controller.js';
import validate from '../../../middlewares/validate.middleware.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import hotelContext from '../../../middlewares/hotelContext.middleware.js';
import authorize from '../../../middlewares/rbac.middleware.js';
import { ROLES } from '../../../constants/roles.js';
import { quickSearchSchema } from './quickSearch.validation.js';

const router = Router();

router.use(authMiddleware, hotelContext);

router.get(
  '/quick-search',
  authorize(ROLES.HOTEL_ADMIN, ROLES.HOTEL_USER, ROLES.PLATFORM_ADMIN),
  validate(quickSearchSchema),
  quickSearchController.handleQuickSearch
);

export default router;
