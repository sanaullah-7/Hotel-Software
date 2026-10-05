import mongoose from 'mongoose';

const registrationFormSchema = new mongoose.Schema(
  {
    stay_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stay',
      required: true,
      unique: true, // Usually one registration form per stay
    },
    primary_guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    terms_accepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    signature_url: {
      type: String, // E-signature
    },
    completed_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
registrationFormSchema.index({ stay_id: 1 });

export default registrationFormSchema;
