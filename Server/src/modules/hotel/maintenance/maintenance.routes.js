import { Router } from "express";
import * as maintenanceController from "./maintenance.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import { createMaintenanceTicketSchema, updateMaintenanceTicketSchema } from "./maintenance.validation.js";

const router = Router();

router.use(authMiddleware, hotelContext);

router.post(
  "/maintenance/tickets",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createMaintenanceTicketSchema),
  maintenanceController.createTicket
);

router.get("/maintenance/tickets", maintenanceController.getTickets);

router.put(
  "/maintenance/tickets/:id",
  validateIdParam,
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(updateMaintenanceTicketSchema),
  maintenanceController.updateTicket
);

export default router;
