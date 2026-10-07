// Config
import hotelProfileSchema from './schemas/config/hotelProfile.schema.js';
import hotelPoliciesSchema from './schemas/config/hotelPolicies.schema.js';

// Organization
import departmentSchema from './schemas/organization/department.schema.js';
import employeeSchema from './schemas/organization/employee.schema.js';
import employeeDocumentSchema from './schemas/organization/employeeDocument.schema.js';

// Rooms
import roomTypeSchema from './schemas/rooms/roomType.schema.js';
import amenitySchema from './schemas/rooms/amenity.schema.js';
import roomSchema from './schemas/rooms/room.schema.js';

// Guests
import guestSchema from './schemas/guests/guest.schema.js';
import guestDocumentSchema from './schemas/guests/guestDocument.schema.js';

// Reservations
import reservationGroupSchema from './schemas/reservations/reservationGroup.schema.js';
import reservationSchema from './schemas/reservations/reservation.schema.js';
import reservationRoomSchema from './schemas/reservations/reservationRoom.schema.js';
import reservationStatusHistorySchema from './schemas/reservations/reservationStatusHistory.schema.js';

// Stays
import staySchema from './schemas/stays/stay.schema.js';
import stayRoomSchema from './schemas/stays/stayRoom.schema.js';
import registrationFormSchema from './schemas/stays/registrationForm.schema.js';

// Pricing
import ratePlanSchema from './schemas/pricing/ratePlan.schema.js';
import rateCalendarSchema from './schemas/pricing/rateCalendar.schema.js';
import discountSchema from './schemas/pricing/discount.schema.js';
import taxSchema from './schemas/pricing/tax.schema.js';
import feeSchema from './schemas/pricing/fee.schema.js';

// Financials
import folioSchema from './schemas/financials/folio.schema.js';
import guestChargeSchema from './schemas/financials/guestCharge.schema.js';
import invoiceSchema from './schemas/financials/invoice.schema.js';
import paymentSchema from './schemas/financials/payment.schema.js';
import refundSchema from './schemas/financials/refund.schema.js';
import expenseSchema from './schemas/financials/expense.schema.js';

// Housekeeping
import housekeepingTaskSchema from './schemas/housekeeping/housekeepingTask.schema.js';
import housekeepingInspectionSchema from './schemas/housekeeping/housekeepingInspection.schema.js';
import housekeepingChecklistSchema from './schemas/housekeeping/housekeepingChecklist.schema.js';
import lostFoundItemSchema from './schemas/housekeeping/lostFoundItem.schema.js';

// Maintenance
import maintenanceTicketSchema from './schemas/maintenance/maintenanceTicket.schema.js';

// Inventory
import inventoryItemSchema from './schemas/inventory/inventoryItem.schema.js';
import inventoryMovementSchema from './schemas/inventory/inventoryMovement.schema.js';
import inventoryIncidentSchema from './schemas/inventory/inventoryIncident.schema.js';

// Parking
import parkingSpaceSchema from './schemas/parking/parkingSpace.schema.js';
import parkingRecordSchema from './schemas/parking/parkingRecord.schema.js';

// Operations
import complaintSchema from './schemas/operations/complaint.schema.js';
import operationsAlertSchema from './schemas/operations/operationsAlert.schema.js';

// HR
import attendanceRecordSchema from './schemas/hr/attendanceRecord.schema.js';
import leaveRequestSchema from './schemas/hr/leaveRequest.schema.js';
import payrollRunSchema from './schemas/hr/payrollRun.schema.js';
import payrollItemSchema from './schemas/hr/payrollItem.schema.js';

// Restaurant
import restaurantCategorySchema from './schemas/restaurant/restaurantCategory.schema.js';
import restaurantMenuItemSchema from './schemas/restaurant/restaurantMenuItem.schema.js';
import restaurantTableSchema from './schemas/restaurant/restaurantTable.schema.js';
import restaurantOrderSchema from './schemas/restaurant/restaurantOrder.schema.js';

// Events
import eventSchema from './schemas/events/event.schema.js';
import beoSchema from './schemas/events/beo.schema.js';
import eventResourceSchema from './schemas/events/eventResource.schema.js';

// System
import notificationSchema from './schemas/system/notification.schema.js';
import fileRecordSchema from './schemas/system/fileRecord.schema.js';
import auditLogSchema from './schemas/system/auditLog.schema.js';

export const SCHEMAS = {
  HotelProfile: hotelProfileSchema,
  HotelPolicies: hotelPoliciesSchema,
  Department: departmentSchema,
  Employee: employeeSchema,
  EmployeeDocument: employeeDocumentSchema,
  RoomType: roomTypeSchema,
  Amenity: amenitySchema,
  Room: roomSchema,
  Guest: guestSchema,
  GuestDocument: guestDocumentSchema,
  ReservationGroup: reservationGroupSchema,
  Reservation: reservationSchema,
  ReservationRoom: reservationRoomSchema,
  ReservationStatusHistory: reservationStatusHistorySchema,
  Stay: staySchema,
  StayRoom: stayRoomSchema,
  RegistrationForm: registrationFormSchema,
  RatePlan: ratePlanSchema,
  RateCalendar: rateCalendarSchema,
  Discount: discountSchema,
  Tax: taxSchema,
  Fee: feeSchema,
  Folio: folioSchema,
  GuestCharge: guestChargeSchema,
  Invoice: invoiceSchema,
  Payment: paymentSchema,
  Refund: refundSchema,
  Expense: expenseSchema,
  HousekeepingTask: housekeepingTaskSchema,
  HousekeepingInspection: housekeepingInspectionSchema,
  HousekeepingChecklist: housekeepingChecklistSchema,
  LostFoundItem: lostFoundItemSchema,
  MaintenanceTicket: maintenanceTicketSchema,
  InventoryItem: inventoryItemSchema,
  InventoryMovement: inventoryMovementSchema,
  InventoryIncident: inventoryIncidentSchema,
  ParkingSpace: parkingSpaceSchema,
  ParkingRecord: parkingRecordSchema,
  Complaint: complaintSchema,
  OperationsAlert: operationsAlertSchema,
  AttendanceRecord: attendanceRecordSchema,
  LeaveRequest: leaveRequestSchema,
  PayrollRun: payrollRunSchema,
  PayrollItem: payrollItemSchema,
  RestaurantCategory: restaurantCategorySchema,
  RestaurantMenuItem: restaurantMenuItemSchema,
  RestaurantTable: restaurantTableSchema,
  RestaurantOrder: restaurantOrderSchema,
  Event: eventSchema,
  BEO: beoSchema,
  EventResource: eventResourceSchema,
  Notification: notificationSchema,
  FileRecord: fileRecordSchema,
  AuditLog: auditLogSchema,
};

// Every hotel-owned collection needs an efficient ownership filter, including
// collections without a natural unique business key.
for (const schema of Object.values(SCHEMAS)) {
  if (!schema.indexes().some(([keys]) => Object.keys(keys)[0] === 'hotelId')) {
    schema.index({ hotelId: 1 });
  }
}
