import Joi from "joi";

export const createParkingSpaceSchema = Joi.object({
  space_number: Joi.string().trim().min(1).max(30).required().messages({
    "any.required": "Space number is required",
    "string.empty": "Space number cannot be empty",
  }),
  location: Joi.string().trim().max(100).default("Main Lot"),
  is_accessible: Joi.boolean().default(false),
  vehicle_type_allowed: Joi.string()
    .valid("ANY", "COMPACT", "LARGE", "MOTORCYCLE")
    .default("ANY"),
  status: Joi.string()
    .valid("AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE", "BLOCKED")
    .default("AVAILABLE"),
});

export const updateParkingSpaceStatusSchema = Joi.object({
  status: Joi.string()
    .valid("AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE", "BLOCKED")
    .required()
    .messages({
      "any.required": "Status is required",
    }),
});

export const createParkingRecordSchema = Joi.object({
  space_id: Joi.string().trim().allow("", null).optional(),
  space_number: Joi.string().trim().allow("", null).optional(),
  parkingSpace: Joi.string().trim().allow("", null).optional(),

  vehicle_plate: Joi.string().trim().optional(),
  carNumber: Joi.string().trim().optional(),

  guest_name: Joi.string().trim().allow("", null).optional(),
  guestName: Joi.string().trim().allow("", null).optional(),
  guest_id: Joi.string().trim().allow("", null).optional(),

  room_number: Joi.string().trim().allow("", null).optional(),
  roomNumber: Joi.string().trim().allow("", null).optional(),

  vehicle_model: Joi.string().trim().allow("", null).optional(),
  vehicle_type: Joi.string()
    .valid("Sedan", "SUV", "Hatchback", "Van", "Bike", "Other")
    .optional(),
  carType: Joi.string()
    .valid("Sedan", "SUV", "Hatchback", "Van", "Bike", "Other")
    .optional(),

  entry_time: Joi.date().iso().optional(),
  entryDate: Joi.string().allow("", null).optional(),
  entryTime: Joi.string().allow("", null).optional(),

  charge_type: Joi.string().valid("Free", "Hourly", "Daily").optional(),
  chargeType: Joi.string().valid("Free", "Hourly", "Daily").optional(),

  charge_amount: Joi.number().min(0).optional(),
  chargeAmount: Joi.number().min(0).optional(),

  payment_status: Joi.string().valid("Paid", "Pending").optional(),
  paymentStatus: Joi.string().valid("Paid", "Pending").optional(),

  car_image: Joi.string().allow("", null).optional(),
  carImage: Joi.string().allow("", null).optional(),
}).or("vehicle_plate", "carNumber");

export const updateParkingRecordSchema = Joi.object({
  space_id: Joi.string().trim().allow("", null).optional(),
  space_number: Joi.string().trim().allow("", null).optional(),
  parkingSpace: Joi.string().trim().allow("", null).optional(),

  vehicle_plate: Joi.string().trim().optional(),
  carNumber: Joi.string().trim().optional(),

  guest_name: Joi.string().trim().allow("", null).optional(),
  guestName: Joi.string().trim().allow("", null).optional(),
  guest_id: Joi.string().trim().allow("", null).optional(),

  room_number: Joi.string().trim().allow("", null).optional(),
  roomNumber: Joi.string().trim().allow("", null).optional(),

  vehicle_model: Joi.string().trim().allow("", null).optional(),
  vehicle_type: Joi.string()
    .valid("Sedan", "SUV", "Hatchback", "Van", "Bike", "Other")
    .optional(),
  carType: Joi.string()
    .valid("Sedan", "SUV", "Hatchback", "Van", "Bike", "Other")
    .optional(),

  entry_time: Joi.date().iso().optional(),
  entryDate: Joi.string().allow("", null).optional(),
  entryTime: Joi.string().allow("", null).optional(),

  exit_time: Joi.date().iso().allow(null).optional(),
  exitDate: Joi.string().allow("", null).optional(),
  exitTime: Joi.string().allow("", null).optional(),

  charge_type: Joi.string().valid("Free", "Hourly", "Daily").optional(),
  chargeType: Joi.string().valid("Free", "Hourly", "Daily").optional(),

  charge_amount: Joi.number().min(0).optional(),
  chargeAmount: Joi.number().min(0).optional(),

  payment_status: Joi.string().valid("Paid", "Pending").optional(),
  paymentStatus: Joi.string().valid("Paid", "Pending").optional(),

  car_image: Joi.string().allow("", null).optional(),
  carImage: Joi.string().allow("", null).optional(),

  status: Joi.string().valid("PARKED", "EXITED", "Parked", "Checked Out").optional(),
});

export const checkoutParkingRecordSchema = Joi.object({
  exit_time: Joi.date().iso().optional(),
  exitDate: Joi.string().allow("", null).optional(),
  exitTime: Joi.string().allow("", null).optional(),
});
