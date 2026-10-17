import { Router } from "express";
import * as invoiceController from "./invoice.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import { createInvoiceSchema } from "./invoice.validation.js";

const router = Router();

router.use(authMiddleware, hotelContext);

router.post(
  "/invoices",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createInvoiceSchema),
  invoiceController.createInvoice
);

router.get("/invoices", invoiceController.getInvoices);

router.get("/invoices/:id", validateIdParam, invoiceController.getInvoiceById);

export default router;
