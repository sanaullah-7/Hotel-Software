import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true, // e.g., 'LINEN', 'TOILETRIES', 'CLEANING_SUPPLIES', 'FOOD_BEVERAGE'
    },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: true, // e.g., 'PIECE', 'BOX', 'KG', 'LITER'
    },
    reorder_level: {
      type: Number,
      default: 10,
    },
    unit_cost: {
      type: Number,
      default: 0,
      min: 0,
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
inventoryItemSchema.index({ sku: 1 });
inventoryItemSchema.index({ category: 1 });

export default inventoryItemSchema;
