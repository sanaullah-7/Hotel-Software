import mongoose from 'mongoose';

const registrationFormSchema = new mongoose.Schema(
  {
    form_no: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    guest_name: {
      type: String,
      required: true,
      trim: true,
    },
    first_name: {
      type: String,
      default: '',
    },
    last_name: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    arrival_date: {
      type: Date,
    },
    departure_date: {
      type: Date,
    },
    room_type: {
      type: String,
      default: '',
    },
    room_number: {
      type: String,
      default: 'Allocating',
    },
    number_of_guests: {
      type: Number,
      default: 1,
    },
    id_type: {
      type: String,
      default: 'National ID / Doc',
    },
    id_number: {
      type: String,
      default: '',
    },
    special_requests: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Signed & Verified',
    },
    terms_accepted: {
      type: Boolean,
      default: true,
    },
    signature_url: {
      type: String,
      default: '',
    },
    completed_at: {
      type: Date,
      default: Date.now,
    },
    stay_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stay',
      required: false,
    },
    primary_guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

registrationFormSchema.index({ form_no: 1 }, { unique: true });
registrationFormSchema.index({ guest_name: 1 });
registrationFormSchema.index({ id_number: 1 });

export default registrationFormSchema;
