import Joi from "joi";

const objectId = () => Joi.string().hex().length(24);

// Amenity schemas
export const createAmenitySchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  category: Joi.string().trim().max(50).allow(''),
  description: Joi.string().max(500).allow(''),
  icon_url: Joi.string().max(500).allow('')
});

export const updateAmenitySchema = Joi.object({
  name: Joi.string().trim().max(100),
  category: Joi.string().trim().max(50).allow(''),
  description: Joi.string().max(500).allow(''),
  icon_url: Joi.string().max(500).allow('')
}).min(1);

const roomTypeAmenities = () =>
  Joi.array()
    .items(Joi.object({
      amenity_id: objectId().required(),
      is_featured: Joi.boolean()
    }))
    .unique('amenity_id')
    .max(100);

// Room Type schemas
export const createRoomTypeSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(30).required(),
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().max(1000).allow(''),
  base_occupancy: Joi.number().integer().min(1).max(50).required(),
  max_occupancy: Joi.number().integer().min(Joi.ref('base_occupancy')).max(50).required()
    .messages({ 'number.min': 'max_occupancy must be greater than or equal to base_occupancy' }),
  base_price: Joi.number().min(0).required(),
  amenities: roomTypeAmenities()
});

export const updateRoomTypeSchema = Joi.object({
  name: Joi.string().trim().max(100),
  description: Joi.string().max(1000).allow(''),
  base_occupancy: Joi.number().integer().min(1).max(50),
  max_occupancy: Joi.number().integer().min(1).max(50),
  base_price: Joi.number().min(0),
  amenities: roomTypeAmenities()
}).min(1);

// Room schemas
const extraAmenities = () =>
  Joi.array()
    .items(Joi.object({
      amenity_id: objectId().required(),
      notes: Joi.string().max(300).allow('')
    }))
    .unique('amenity_id')
    .max(100);

export const createRoomSchema = Joi.object({
  room_number: Joi.string().trim().max(20).required(),
  room_type_id: objectId().required(),
  floor: Joi.string().trim().max(20).allow(''),
  status: Joi.string().valid('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING', 'OUT_OF_ORDER'),
  housekeeping_status: Joi.string().valid('CLEAN', 'DIRTY', 'INSPECTED'),
  extra_amenities: extraAmenities()
});

export const updateRoomSchema = Joi.object({
  room_type_id: objectId(),
  floor: Joi.string().trim().max(20).allow(''),
  status: Joi.string().valid('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING', 'OUT_OF_ORDER'),
  housekeeping_status: Joi.string().valid('CLEAN', 'DIRTY', 'INSPECTED'),
  extra_amenities: extraAmenities()
}).min(1);
