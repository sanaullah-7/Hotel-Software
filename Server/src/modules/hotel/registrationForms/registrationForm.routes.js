import { Router } from 'express';
import * as registrationFormController from './registrationForm.controller.js';
import validate from '../../../middlewares/validate.middleware.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import hotelContext from '../../../middlewares/hotelContext.middleware.js';
import authorize from '../../../middlewares/rbac.middleware.js';
import { ROLES } from '../../../constants/roles.js';
import { createRegistrationFormSchema } from './registrationForm.validation.js';

const router = Router();

router.use(authMiddleware, hotelContext);

router.get(
  '/registration-forms',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  registrationFormController.getRegistrationForms
);

router.post(
  '/registration-forms',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createRegistrationFormSchema),
  registrationFormController.createRegistrationForm
);

router.get(
  '/registration-forms/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  registrationFormController.getRegistrationFormById
);

router.delete(
  '/registration-forms/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  registrationFormController.deleteRegistrationForm
);

export default router;
