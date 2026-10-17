import Joi from "joi";

export const createReservationSchema = Joi.object({
  primary_guest_id: Joi.string().hex().length(24).required().messages({
    "string.hex": "primary_guest_id must be a valid hex string",
    "string.length": "primary_guest_id must be a 24-character ObjectId",
    "any.required": "primary_guest_id is required",
  }),
  group_id: Joi.string().hex().length(24).optional().allow(null, ""),
  expected_check_in: Joi.date().iso().required().messages({
    "any.required": "expected_check_in date is required",
    "date.format": "expected_check_in must be a valid ISO date",
  }),
  expected_check_out: Joi.date().iso().greater(Joi.ref("expected_check_in")).required().messages({
    "any.required": "expected_check_out date is required",
    "date.greater": "expected_check_out must be after expected_check_in",
  }),
  adults: Joi.number().integer().min(1).default(1).required(),
  children: Joi.number().integer().min(0).default(0),
  special_requests: Joi.string().allow("", null).max(500),
  room_type_id: Joi.string().hex().length(24).optional(),
  room_id: Joi.string().hex().length(24).optional(),
  rate_plan_id: Joi.string().hex().length(24).optional().allow(null),
  payment_status: Joi.string().optional().allow(null, ""),
  payment: Joi.string().optional().allow(null, ""),
  payment_method: Joi.string().optional().allow(null, ""),
}).or("room_type_id", "room_id").messages({
  "object.missing": "At least one of room_type_id or room_id is required to create a reservation",
});

export const updateReservationSchema = Joi.object({
  expected_check_in: Joi.date().iso().optional(),
  expected_check_out: Joi.date().iso().optional(),
  adults: Joi.number().integer().min(1).optional(),
  children: Joi.number().integer().min(0).optional(),
  special_requests: Joi.string().allow("", null).max(500),
  status: Joi.string().valid("PENDING", "CONFIRMED", "IN_HOUSE", "CHECKED_OUT", "CANCELLED", "NO_SHOW").optional(),
  cancellation_reason: Joi.string().allow("", null).max(500),
  room_id: Joi.string().hex().length(24).optional().allow(null),
  room_type_id: Joi.string().hex().length(24).optional().allow(null),
});

export const cancelReservationSchema = Joi.object({
  cancellation_reason: Joi.string().allow("", null).max(500),
});

export const availabilityQuerySchema = Joi.object({
  check_in: Joi.date().iso().required().messages({
    "any.required": "check_in is required",
  }),
  check_out: Joi.date().iso().greater(Joi.ref("check_in")).required().messages({
    "any.required": "check_out is required",
    "date.greater": "check_out must be after check_in",
  }),
  room_type_id: Joi.string().hex().length(24).optional(),
});

export const createGroupReservationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "any.required": "Group name is required",
  }),
  contact_person: Joi.string().trim().required().messages({
    "any.required": "Contact person is required",
  }),
  email: Joi.string().email().allow("", null),
  phone: Joi.string().allow("", null),
  expected_check_in: Joi.date().iso().allow(null),
  expected_check_out: Joi.date().iso().allow(null),
  rooms_count: Joi.number().integer().min(1).default(1),
  total_guests: Joi.number().integer().min(1).default(1),
  room_types: Joi.string().allow("", null),
  status: Joi.string().valid("PENDING", "CONFIRMED", "CANCELLED", "Pending", "Confirmed", "Cancelled").default("PENDING"),
  total_price: Joi.number().min(0).default(0),
  notes: Joi.string().allow("", null).max(1000),
  billing_instructions: Joi.string().allow("", null).max(1000),
  company_name: Joi.string().allow("", null).max(200),
  guest_id: Joi.string().hex().length(24).optional().allow(null),
});

export const updateGroupReservationSchema = Joi.object({
  name: Joi.string().trim().optional(),
  contact_person: Joi.string().trim().optional(),
  email: Joi.string().email().allow("", null),
  phone: Joi.string().allow("", null),
  expected_check_in: Joi.date().iso().allow(null),
  expected_check_out: Joi.date().iso().allow(null),
  rooms_count: Joi.number().integer().min(1).optional(),
  total_guests: Joi.number().integer().min(1).optional(),
  room_types: Joi.string().allow("", null),
  status: Joi.string().valid("PENDING", "CONFIRMED", "CANCELLED", "Pending", "Confirmed", "Cancelled").optional(),
  total_price: Joi.number().min(0).optional(),
  notes: Joi.string().allow("", null).max(1000),
  billing_instructions: Joi.string().allow("", null).max(1000),
  company_name: Joi.string().allow("", null).max(200),
  guest_id: Joi.string().hex().length(24).optional().allow(null),
});

export const cancelGroupReservationSchema = Joi.object({
  cancellation_reason: Joi.string().allow("", null).max(500),
});

export const reassignReservationRoomSchema = Joi.object({
  room_id: Joi.string().hex().length(24).required().messages({
    "any.required": "Destination room_id is required",
    "string.length": "room_id must be a valid 24-character ObjectId",
  }),
  reservation_room_id: Joi.string().hex().length(24).optional().allow(null),
});



