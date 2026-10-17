import { Router } from "express";
import * as paymentController from "./payment.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import { createPaymentSchema } from "./payment.validation.js";

const router = Router();

router.use(authMiddleware, hotelContext);

router.post(
  "/payments",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createPaymentSchema),
  paymentController.createPayment
);

router.get("/payments", paymentController.getPayments);

router.get("/payments/:id", validateIdParam, paymentController.getPaymentById);

export default router;
