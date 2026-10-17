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
import cashShiftRoutes from "../modules/hotel/cashShifts/cashShift.routes.js";
import housekeepingRoutes from "../modules/hotel/housekeeping/housekeeping.routes.js";
import maintenanceRoutes from "../modules/hotel/maintenance/maintenance.routes.js";
import complaintRoutes from "../modules/hotel/complaints/complaint.routes.js";
import operationsAlertRoutes from "../modules/hotel/alerts/operationsAlert.routes.js";
import guestChargeRoutes from "../modules/hotel/guestCharges/guestCharge.routes.js";
import refundRoutes from "../modules/hotel/refunds/refund.routes.js";
import leaveRequestRoutes from "../modules/hotel/hr/leaveRequest.routes.js";
import attendanceRoutes from "../modules/hotel/hr/attendance.routes.js";
import payrollRoutes from "../modules/hotel/hr/payroll.routes.js";
import inventoryRoutes from "../modules/hotel/inventory/inventory.routes.js";
import restaurantRoutes from "../modules/hotel/restaurant/restaurant.routes.js";
import parkingRoutes from "../modules/hotel/parking/parking.routes.js";
import pricingRoutes from "../modules/hotel/pricing/pricing.routes.js";
import registrationFormRoutes from "../modules/hotel/registrationForms/registrationForm.routes.js";
import eventRoutes from "../modules/hotel/events/event.routes.js";
import reportRoutes from "../modules/hotel/reports/report.routes.js";
import auditRoutes from "../modules/hotel/hotelAudit/audit.routes.js";
import assistantRoutes from "../modules/hotel/aiAssistant/assistant.routes.js";
import dashboardRoutes from "../modules/hotel/dashboard/dashboard.routes.js";
import fileRoutes from "../modules/hotel/files/file.routes.js";
import quickSearchRoutes from "../modules/hotel/quickSearch/quickSearch.routes.js";

export const hotelPmsRouter = Router();

hotelPmsRouter.use("/hotel", quickSearchRoutes); // Quick Search API

hotelPmsRouter.use("/hotel", configRoutes); // Profile and policies
hotelPmsRouter.use("/hotel", dashboardRoutes); // Authoritative Dashboard Metrics
hotelPmsRouter.use("/hotel", fileRoutes); // File & Media Storage (Cloudinary / GridFS)
hotelPmsRouter.use("/hotel", organizationRoutes); // Departments and employees
hotelPmsRouter.use("/hotel", roomsRoutes); // Amenities, room types, rooms
hotelPmsRouter.use("/hotel", guestRoutes); // Guest management
hotelPmsRouter.use("/hotel", reservationRoutes); // Reservations & Availability
hotelPmsRouter.use("/hotel", checkInOutRoutes); // Stay Lifecycle (Check-in / Check-out)
hotelPmsRouter.use("/hotel", folioRoutes); // Guest Folios
hotelPmsRouter.use("/hotel", invoiceRoutes); // Invoices & Charges
hotelPmsRouter.use("/hotel", paymentRoutes); // Payments
hotelPmsRouter.use("/hotel", cashShiftRoutes); // Cash Shift Management & Z-Reports
hotelPmsRouter.use("/hotel", refundRoutes); // Refunds
hotelPmsRouter.use("/hotel", guestChargeRoutes); // Guest Charges
hotelPmsRouter.use("/hotel", housekeepingRoutes); // Housekeeping
hotelPmsRouter.use("/hotel", maintenanceRoutes); // Maintenance
hotelPmsRouter.use("/hotel", complaintRoutes); // Guest Complaints
hotelPmsRouter.use("/hotel", operationsAlertRoutes); // Operations Alerts
hotelPmsRouter.use("/hotel", leaveRequestRoutes); // Leave Requests
hotelPmsRouter.use("/hotel", attendanceRoutes); // Attendance Records
hotelPmsRouter.use("/hotel", payrollRoutes); // Payroll & Employee Salary
hotelPmsRouter.use("/hotel", inventoryRoutes); // Inventory & Stock
hotelPmsRouter.use("/hotel", restaurantRoutes); // Restaurant & POS
hotelPmsRouter.use("/hotel", parkingRoutes); // Car Parking
hotelPmsRouter.use("/hotel", pricingRoutes); // Rates & Pricing (Rate Plans, Discounts, Taxes, Fees)
hotelPmsRouter.use("/hotel", registrationFormRoutes); // Registration Forms
hotelPmsRouter.use("/hotel", eventRoutes); // Events & Banquets (BEOs)
hotelPmsRouter.use("/hotel", reportRoutes); // Reports & Expenses
hotelPmsRouter.use("/hotel", auditRoutes); // System Audit Logs
hotelPmsRouter.use("/hotel", assistantRoutes); // AI Executive Assistant

export default hotelPmsRouter;

