import mongoose from 'mongoose';

const reservationGroupSchema = new mongoose.Schema(
  {
    group_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    contact_person: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company_name: {
      type: String,
      trim: true,
      default: '',
    },
    billing_instructions: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
    },
    cancellation_reason: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
      default: 'PENDING',
    },
    expected_check_in: {
      type: Date,
    },
    expected_check_out: {
      type: Date,
    },
    rooms_count: {
      type: Number,
      default: 1,
    },
    total_guests: {
      type: Number,
      default: 1,
    },
    room_types: {
      type: String,
      default: '',
    },
    total_price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
reservationGroupSchema.index({ guest_id: 1 });

export default reservationGroupSchema;
