import mongoose from 'mongoose';

const restaurantCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    display_order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
// Note: name has unique: true which creates a unique index.
restaurantCategorySchema.index({ display_order: 1 });
restaurantCategorySchema.index({ status: 1 });

export default restaurantCategorySchema;
