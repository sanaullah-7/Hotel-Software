import mongoose from 'mongoose';

const hotelProfileSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      unique: true,
    },
    // Singleton guard: a constant, immutable, UNIQUE key so the database itself guarantees that
    // a tenant can never hold more than one profile document (even under concurrent first access).
    _singleton: {
      type: String,
      default: 'main',
      immutable: true,
      select: false,
    },
    property_name: {
      type: String,
      required: true,
      trim: true,
    },
    legal_name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'PKR',
    },
    timezone: {
      type: String,
      required: true,
      default: 'Asia/Karachi',
    },
    logo_url: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default hotelProfileSchema;
