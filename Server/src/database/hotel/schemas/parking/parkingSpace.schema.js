import mongoose from 'mongoose';

const parkingSpaceSchema = new mongoose.Schema(
  {
    space_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String, // e.g., 'Main Lot', 'Level 1', 'Basement 2'
      default: 'Main Lot',
    },
    is_accessible: { // For disabled parking
      type: Boolean,
      default: false,
    },
    vehicle_type_allowed: {
      type: String,
      enum: ['ANY', 'COMPACT', 'LARGE', 'MOTORCYCLE'],
      default: 'ANY',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'BLOCKED'],
      default: 'AVAILABLE',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
parkingSpaceSchema.index({ status: 1 });

export default parkingSpaceSchema;
