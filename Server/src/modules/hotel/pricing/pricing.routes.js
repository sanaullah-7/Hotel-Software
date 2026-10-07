import { Router } from 'express';
import * as pricingController from './pricing.controller.js';
import validate from '../../../middlewares/validate.middleware.js';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import hotelContext from '../../../middlewares/hotelContext.middleware.js';
import authorize from '../../../middlewares/rbac.middleware.js';
import { ROLES } from '../../../constants/roles.js';
import {
  createRatePlanSchema,
  updateRatePlanSchema,
  createDiscountSchema,
  updateDiscountSchema,
  createTaxSchema,
  updateTaxSchema,
  createFeeSchema,
  updateFeeSchema,
} from './pricing.validation.js';

const router = Router();

// Base middleware for all hotel pricing routes
router.use(authMiddleware, hotelContext);

// ======================== RATE PLANS ========================
router.get(
  '/pricing/rate-plans',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  pricingController.getRatePlans
);

router.post(
  '/pricing/rate-plans',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createRatePlanSchema),
  pricingController.createRatePlan
);

router.put(
  '/pricing/rate-plans/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateRatePlanSchema),
  pricingController.updateRatePlan
);

router.delete(
  '/pricing/rate-plans/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  pricingController.deleteRatePlan
);

router.patch(
  '/pricing/rate-plans/:id/status',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  pricingController.toggleRatePlanStatus
);

// ======================== DISCOUNTS ========================
router.get(
  '/pricing/discounts',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  pricingController.getDiscounts
);

router.post(
  '/pricing/discounts',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createDiscountSchema),
  pricingController.createDiscount
);

router.put(
  '/pricing/discounts/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateDiscountSchema),
  pricingController.updateDiscount
);

router.delete(
  '/pricing/discounts/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  pricingController.deleteDiscount
);

router.patch(
  '/pricing/discounts/:id/status',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  pricingController.toggleDiscountStatus
);

// ======================== TAXES ========================
router.get(
  '/pricing/taxes',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  pricingController.getTaxes
);

router.post(
  '/pricing/taxes',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createTaxSchema),
  pricingController.createTax
);

router.put(
  '/pricing/taxes/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateTaxSchema),
  pricingController.updateTax
);

router.delete(
  '/pricing/taxes/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  pricingController.deleteTax
);

router.patch(
  '/pricing/taxes/:id/status',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  pricingController.toggleTaxStatus
);

// ======================== FEES ========================
router.get(
  '/pricing/fees',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  pricingController.getFees
);

router.post(
  '/pricing/fees',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(createFeeSchema),
  pricingController.createFee
);

router.put(
  '/pricing/fees/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  validate(updateFeeSchema),
  pricingController.updateFee
);

router.delete(
  '/pricing/fees/:id',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  pricingController.deleteFee
);

router.patch(
  '/pricing/fees/:id/status',
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN),
  pricingController.toggleFeeStatus
);

export default router;
