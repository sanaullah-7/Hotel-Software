import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    guest_ref: {
      type: String,
      required: true,
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
    // Official identities are unique within each hotel. Partial compound indexes
    // exclude absent identities; compound sparse indexes would still index hotelId.
    passport_number: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
      sparse: true,
      },
    national_id: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
      sparse: true,
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

guestSchema.index({ hotelId: 1, guest_ref: 1 }, { unique: true });

guestSchema.index({ hotelId: 1, passport_number: 1 }, {
  unique: true, partialFilterExpression: { passport_number: { $type: 'string' } },
});

guestSchema.index({ hotelId: 1, national_id: 1 }, {
  unique: true, partialFilterExpression: { national_id: { $type: 'string' } },
});

export default guestSchema;
