import { Router } from "express";
import * as refundController from "./refund.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import { createRefundSchema } from "./refund.validation.js";

const router = Router();

router.use(authMiddleware, hotelContext);

router.post(
  "/refunds",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createRefundSchema),
  refundController.createRefund
);

router.get("/refunds", refundController.getRefunds);

router.get("/refunds/:id", validateIdParam, refundController.getRefundById);

export default router;
