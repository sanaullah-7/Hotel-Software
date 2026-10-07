import mongoose from 'mongoose';

const restaurantCategorySchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
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

restaurantCategorySchema.index({ hotelId: 1, name: 1 }, { unique: true });

export default restaurantCategorySchema;
