/**
 * Registers hotel PMS business domain modules.
 * Endpoints remain identical to preserve existing API behavior.
 */
import { Router } from "express";
import configRoutes from "../modules/hotel/config/config.routes.js";
import organizationRoutes from "../modules/hotel/organization/organization.routes.js";
import roomsRoutes from "../modules/hotel/rooms/rooms.routes.js";
import guestRoutes from "../modules/hotel/guests/guest.routes.js";
import reservationRoutes from "../modules/hotel/reservations/reservation.routes.js";
import checkInOutRoutes from "../modules/hotel/checkInOut/checkInOut.routes.js";
import folioRoutes from "../modules/hotel/folios/folio.routes.js";
import invoiceRoutes from "../modules/hotel/invoices/invoice.routes.js";
import paymentRoutes from "../modules/hotel/payments/payment.routes.js";
import housekeepingRoutes from "../modules/hotel/housekeeping/housekeeping.routes.js";
import maintenanceRoutes from "../modules/hotel/maintenance/maintenance.routes.js";

export const hotelPmsRouter = Router();

hotelPmsRouter.use("/hotel", configRoutes); // Profile and policies
hotelPmsRouter.use("/hotel", organizationRoutes); // Departments and employees
hotelPmsRouter.use("/hotel", roomsRoutes); // Amenities, room types, rooms
hotelPmsRouter.use("/hotel", guestRoutes); // Guest management
hotelPmsRouter.use("/hotel", reservationRoutes); // Reservations & Availability
hotelPmsRouter.use("/hotel", checkInOutRoutes); // Stay Lifecycle (Check-in / Check-out)
hotelPmsRouter.use("/hotel", folioRoutes); // Guest Folios
hotelPmsRouter.use("/hotel", invoiceRoutes); // Invoices & Charges
hotelPmsRouter.use("/hotel", paymentRoutes); // Payments
hotelPmsRouter.use("/hotel", housekeepingRoutes); // Housekeeping
hotelPmsRouter.use("/hotel", maintenanceRoutes); // Maintenance

export default hotelPmsRouter;
