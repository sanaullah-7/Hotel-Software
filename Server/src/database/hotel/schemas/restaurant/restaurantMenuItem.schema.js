import mongoose from 'mongoose';

const restaurantMenuItemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantCategory',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    is_available: {
      type: Boolean,
      default: true,
    },
    dietary_flags: {
      type: [String], // e.g., ['VEGAN', 'GLUTEN_FREE', 'HALAL']
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
restaurantMenuItemSchema.index({ sku: 1 });
restaurantMenuItemSchema.index({ category_id: 1 });

export default restaurantMenuItemSchema;
