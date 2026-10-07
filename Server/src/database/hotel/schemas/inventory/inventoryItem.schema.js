import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true, // e.g., 'BATHROOM', 'BEDROOM', 'ELECTRONICS', 'FURNITURE', 'KITCHEN', 'CLEANING', 'AMENITIES', 'LINENS'
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location_type: {
      type: String,
      enum: ['ROOM', 'STORAGE'],
      default: 'STORAGE',
      required: true,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    room_number: {
      type: String,
      trim: true,
      default: null,
    },
    location: {
      type: String,
      trim: true, // e.g. "Room 203 - Bathroom", "Central Storage Depot"
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: true, // e.g., 'PIECE', 'BOX', 'KG', 'LITER', 'SET', 'PACK'
      default: 'PIECE',
      trim: true,
    },
    reorder_level: {
      type: Number,
      default: 10,
      min: 0,
    },
    unit_cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    condition: {
      type: String,
      enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED'],
      default: 'GOOD',
    },
    supplier: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ status: 1 });
inventoryItemSchema.index({ location_type: 1, room_number: 1 });

inventoryItemSchema.index({ hotelId: 1, sku: 1 }, { unique: true });

export default inventoryItemSchema;
