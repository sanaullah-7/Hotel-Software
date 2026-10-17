import mongoose from 'mongoose';

const restaurantMenuItemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
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
      trim: true,
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
      type: [String], // e.g., ['VEG', 'NON_VEG', 'VEGAN', 'GLUTEN_FREE', 'HALAL']
      default: [],
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
// Note: sku has unique: true which creates a unique index.
restaurantMenuItemSchema.index({ category_id: 1 });
restaurantMenuItemSchema.index({ is_available: 1 });
restaurantMenuItemSchema.index({ category_id: 1, is_available: 1 });

export default restaurantMenuItemSchema;
