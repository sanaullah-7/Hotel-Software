import mongoose from 'mongoose';

const amenitySchema = new mongoose.Schema(
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
    category: {
      type: String, // e.g., 'BATHROOM', 'ENTERTAINMENT', 'FURNITURE'
    },
    icon_url: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes are automatically created via unique: true on name

amenitySchema.index({ hotelId: 1, name: 1 }, { unique: true });

export default amenitySchema;
