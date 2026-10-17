// Object ko freeze kar do taake uski properties accidentally change na ho saken.
export const ROLES = Object.freeze({
  PLATFORM_ADMIN: "PLATFORM_ADMIN", // Super admins for Explore Pakistan
  HOTEL_ADMIN: "HOTEL_ADMIN",       // Hotel Owners/Managers who have full control over a hotel
  HOTEL_USER: "HOTEL_USER",         // Standard PMS users (Receptionists, Staff). Fine-grained permissions handled at hotel level
});