import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import hotelContext from '../../../middlewares/hotelContext.middleware.js';
import * as controller from './data.controller.js';
import authorize from '../../../middlewares/rbac.middleware.js';
import { ROLES } from '../../../constants/roles.js';

const router = Router();
router.use(authMiddleware, hotelContext);
router.get('/data', controller.listResources);
router.get('/data/:resource', controller.listRecords);
router.post('/data/:resource', authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER), controller.createRecord);
router.get('/data/:resource/:id', controller.getRecord);
router.put('/data/:resource/:id', authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER), controller.updateRecord);
router.delete('/data/:resource/:id', authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER), controller.deleteRecord);
export default router;
