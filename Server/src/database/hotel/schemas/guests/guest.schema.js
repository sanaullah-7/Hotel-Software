import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema(
  {
    guest_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    // Official identity documents. Unique PER TENANT DATABASE (each hotel has its own DB, so a
    // unique index here is automatically hotel-scoped). Sparse: guests without the document
    // (field ABSENT) never collide. The service guarantees empty values are stored as ABSENT.
    passport_number: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
      sparse: true,
      unique: true,
    },
    national_id: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
      sparse: true,
      unique: true,
    },
    address: {
      type: String,
      maxlength: 255,
    },
    city: {
      type: String,
      maxlength: 100,
    },
    country: {
      type: String,
      maxlength: 100,
    },
    nationality: {
      type: String,
      maxlength: 100,
    },
    date_of_birth: {
      type: Date,
    },
    vip_status: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Additional non-unique Indexes
guestSchema.index({ email: 1 });
guestSchema.index({ phone: 1 });

export default guestSchema;
