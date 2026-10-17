import mongoose from 'mongoose';

const hotelPoliciesSchema = new mongoose.Schema(
  {
    // Singleton guard (see hotelProfile.schema.js)
    _singleton: {
      type: String,
      default: 'main',
      immutable: true,
      unique: true,
      select: false,
    },
    check_in_time: {
      type: String,
      required: true,
      default: '14:00',
    },
    check_out_time: {
      type: String,
      required: true,
      default: '12:00',
    },
    cancellation_policy: {
      type: String,
    },
    early_checkin_policy: {
      type: String,
    },
    late_checkout_policy: {
      type: String,
    },
    no_show_policy: {
      type: String,
    },
    pet_policy: {
      type: String,
    },
    smoking_policy: {
      type: String,
    },
    age_policy: {
      type: String,
    },
    payment_methods_accepted: [
      {
        type: String,
      },
    ],
    id_verification_required: {
      type: Boolean,
      default: true,
    },
    pets_allowed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default hotelPoliciesSchema;
