import mongoose from 'mongoose';

// Embedded subdocument for room_amenities (amenities specific to a physical room, beyond the room type)
const roomAmenitySchema = new mongoose.Schema(
  {
    amenity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Amenity',
      required: true,
    },
    notes: {
      type: String,
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    room_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    room_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true,
    },
    floor: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING', 'OUT_OF_ORDER'],
      default: 'AVAILABLE',
      required: true,
      set: (v) => (v ? v.toUpperCase() : v),
    },
    housekeeping_status: {
      type: String,
      enum: ['CLEAN', 'DIRTY', 'INSPECTED', 'INSPECTING', 'CLEANING', 'OUT_OF_SERVICE'],
      default: 'CLEAN',
      set: (v) => (v ? v.toUpperCase() : v),
    },
    extra_amenities: [roomAmenitySchema],
    active_bookings: [
      {
        reservation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
        check_in: { type: Date, required: true },
        check_out: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
roomSchema.index({ room_type_id: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ housekeeping_status: 1, status: 1 });

// Middleware to prevent duplicate extra amenities
roomSchema.pre('save', function () {
  if (this.extra_amenities && this.extra_amenities.length > 0) {
    const uniqueAmenities = new Set(this.extra_amenities.map(a => a.amenity_id.toString()));
    if (uniqueAmenities.size !== this.extra_amenities.length) {
      throw new Error('Duplicate extra amenities are not allowed in a Room.');
    }
  }
});

export default roomSchema;
