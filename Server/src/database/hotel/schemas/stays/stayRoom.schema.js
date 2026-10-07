import mongoose from 'mongoose';

const stayRoomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    stay_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stay',
      required: true,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    guest_id: { // The specific guest staying in this room, can be different from primary guest
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
    },
    check_in_time: {
      type: Date,
      required: true,
    },
    check_out_time: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['OCCUPIED', 'VACATED'],
      default: 'OCCUPIED',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
stayRoomSchema.index({ stay_id: 1 });
stayRoomSchema.index({ room_id: 1 });

export default stayRoomSchema;
