import mongoose from 'mongoose';

const restaurantTableSchema = new mongoose.Schema(
  {
    table_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String, // e.g., 'Patio', 'Main Dining', 'Window'
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_SERVICE'],
      default: 'AVAILABLE',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
restaurantTableSchema.index({ table_number: 1 });
restaurantTableSchema.index({ status: 1 });

export default restaurantTableSchema;
