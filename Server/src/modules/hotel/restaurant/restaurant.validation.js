import Joi from "joi";

export const ORDER_STATUSES = [
  "PENDING",
  "PREPARING",
  "SERVED",
  "COMPLETED",
  "CANCELLED",
];

export const VALID_ORDER_STATUS_TRANSITIONS = {
  PENDING: ["PREPARING", "CANCELLED"],
  PREPARING: ["SERVED", "CANCELLED"],
  SERVED: ["COMPLETED"],
  COMPLETED: [], // Terminal
  CANCELLED: [], // Terminal
};

export const PAYMENT_MODES = ["ROOM_FOLIO", "CASH", "CARD", "ONLINE"];

export const DIETARY_FLAGS = [
  "VEG",
  "NON_VEG",
  "VEGAN",
  "GLUTEN_FREE",
  "HALAL",
  "NUT_FREE",
  "DAIRY_FREE",
];

export const TABLE_STATUSES = [
  "AVAILABLE",
  "OCCUPIED",
  "RESERVED",
  "OUT_OF_SERVICE",
];

export const CATEGORY_STATUSES = ["ACTIVE", "INACTIVE"];

/* ── Category Validation ─────────────────────────────────────── */
export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "any.required": "Category name is required",
    "string.empty": "Category name cannot be empty",
  }),
  description: Joi.string().trim().max(500).optional().allow(""),
  status: Joi.string()
    .valid(...CATEGORY_STATUSES)
    .default("ACTIVE")
    .optional(),
  display_order: Joi.number().integer().min(0).default(0).optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(500).optional().allow(""),
  status: Joi.string().valid(...CATEGORY_STATUSES).optional(),
  display_order: Joi.number().integer().min(0).optional(),
}).min(1);

export const queryCategorySchema = Joi.object({
  status: Joi.string().valid(...CATEGORY_STATUSES).optional(),
  search: Joi.string().trim().max(100).optional().allow(""),
});

/* ── Menu Item Validation ────────────────────────────────────── */
export const createMenuItemSchema = Joi.object({
  sku: Joi.string().trim().uppercase().max(50).optional().allow("").messages({
    "string.max": "SKU must not exceed 50 characters",
  }),
  category_id: Joi.string().hex().length(24).required().messages({
    "any.required": "Category ID is required",
    "string.length": "Invalid Category ID format",
    "string.hex": "Invalid Category ID format",
  }),
  name: Joi.string().trim().min(2).max(150).required().messages({
    "any.required": "Menu item name is required",
    "string.empty": "Menu item name cannot be empty",
  }),
  description: Joi.string().trim().max(1000).optional().allow(""),
  price: Joi.number().min(0).required().messages({
    "any.required": "Price is required",
    "number.min": "Price cannot be negative",
  }),
  currency: Joi.string().trim().uppercase().max(10).default("PKR").optional(),
  is_available: Joi.boolean().default(true).optional(),
  dietary_flags: Joi.array()
    .items(Joi.string().trim().uppercase())
    .default([])
    .optional(),
  status: Joi.string()
    .valid("ACTIVE", "INACTIVE")
    .default("ACTIVE")
    .optional(),
});

export const updateMenuItemSchema = Joi.object({
  sku: Joi.string().trim().uppercase().max(50).optional(),
  category_id: Joi.string().hex().length(24).optional().messages({
    "string.length": "Invalid Category ID format",
    "string.hex": "Invalid Category ID format",
  }),
  name: Joi.string().trim().min(2).max(150).optional(),
  description: Joi.string().trim().max(1000).optional().allow(""),
  price: Joi.number().min(0).optional().messages({
    "number.min": "Price cannot be negative",
  }),
  currency: Joi.string().trim().uppercase().max(10).optional(),
  is_available: Joi.boolean().optional(),
  dietary_flags: Joi.array()
    .items(Joi.string().trim().uppercase())
    .optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
}).min(1);

export const queryMenuItemSchema = Joi.object({
  category_id: Joi.string().hex().length(24).optional(),
  is_available: Joi.boolean().optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
  dietary: Joi.string().trim().optional(),
  search: Joi.string().trim().max(100).optional().allow(""),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(200).optional(),
});

/* ── Table Validation ────────────────────────────────────────── */
export const createTableSchema = Joi.object({
  table_number: Joi.string().trim().min(1).max(20).required().messages({
    "any.required": "Table number is required",
  }),
  capacity: Joi.number().integer().min(1).required().messages({
    "any.required": "Table capacity is required",
    "number.min": "Capacity must be at least 1",
  }),
  location: Joi.string().trim().max(100).optional().allow(""),
  status: Joi.string()
    .valid(...TABLE_STATUSES)
    .default("AVAILABLE")
    .optional(),
});

export const updateTableSchema = Joi.object({
  table_number: Joi.string().trim().min(1).max(20).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  location: Joi.string().trim().max(100).optional().allow(""),
  status: Joi.string().valid(...TABLE_STATUSES).optional(),
}).min(1);

/* ── Order Item Validation ───────────────────────────────────── */
export const orderItemInputSchema = Joi.object({
  menu_item_id: Joi.string().hex().length(24).required().messages({
    "any.required": "Menu item ID is required",
    "string.length": "Invalid Menu Item ID format",
    "string.hex": "Invalid Menu Item ID format",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Quantity is required",
    "number.min": "Quantity must be at least 1",
  }),
  special_requests: Joi.string().trim().max(500).optional().allow(""),
});

/* ── Order Validation ────────────────────────────────────────── */
export const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemInputSchema).min(1).required().messages({
    "any.required": "At least one order item is required",
    "array.min": "Order must contain at least one item",
  }),
  table_id: Joi.string().hex().length(24).optional().allow(null, "").messages({
    "string.length": "Invalid Table ID format",
  }),
  guest_id: Joi.string().hex().length(24).optional().allow(null, "").messages({
    "string.length": "Invalid Guest ID format",
  }),
  folio_id: Joi.string().hex().length(24).optional().allow(null, "").messages({
    "string.length": "Invalid Folio ID format",
  }),
  server_id: Joi.string().hex().length(24).optional().allow(null, "").messages({
    "string.length": "Invalid Server ID format",
  }),
  customer_name: Joi.string().trim().max(100).optional().allow(""),
  room_number: Joi.string().trim().max(50).optional().allow(""),
  payment_mode: Joi.string()
    .valid(...PAYMENT_MODES)
    .default("ROOM_FOLIO")
    .optional(),
  idempotency_key: Joi.string().trim().max(100).optional().allow(""),
  notes: Joi.string().trim().max(1000).optional().allow(""),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...ORDER_STATUSES)
    .required()
    .messages({
      "any.required": "Target status is required",
      "any.only": "Invalid order status",
    }),
  notes: Joi.string().trim().max(1000).optional().allow(""),
});

export const updateOrderSchema = Joi.object({
  customer_name: Joi.string().trim().max(100).optional().allow(""),
  room_number: Joi.string().trim().max(50).optional().allow(""),
  payment_mode: Joi.string().valid(...PAYMENT_MODES).optional(),
  notes: Joi.string().trim().max(1000).optional().allow(""),
  status: Joi.string().valid(...ORDER_STATUSES).optional(),
}).min(1);

export const queryOrderSchema = Joi.object({
  status: Joi.string().valid(...ORDER_STATUSES).optional(),
  table_id: Joi.string().hex().length(24).optional(),
  folio_id: Joi.string().hex().length(24).optional(),
  room_number: Joi.string().trim().optional(),
  search: Joi.string().trim().max(100).optional().allow(""),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid("asc", "desc", "1", "-1").optional(),
});
