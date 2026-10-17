import mongoose from 'mongoose';

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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

export default amenitySchema;
