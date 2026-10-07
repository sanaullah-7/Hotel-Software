import mongoose from 'mongoose';

const restaurantTableSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    table_number: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String, // e.g., 'Patio', 'Main Dining', 'Window'
      trim: true,
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
// Note: table_number has unique: true which creates a unique index.
restaurantTableSchema.index({ status: 1 });

restaurantTableSchema.index({ hotelId: 1, table_number: 1 }, { unique: true });

export default restaurantTableSchema;
