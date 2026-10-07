import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiError from "../../../utils/apiError.js";
import { asString, objectIdQuery, parsePagination } from "../../../utils/query.js";

const ROOM_STATUSES = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "CLEANING", "OUT_OF_ORDER"];
const HK_STATUSES = ["CLEAN", "DIRTY", "INSPECTED"];

// Cross-tenant protection: references must exist in THIS hotel's data.
const assertRoomRefsInTenant = async (hotelContext, body) => {
  if (body.room_type_id) {
    const RoomType = await getModel(hotelContext, "RoomType");
    const roomType = await RoomType.findOne({ _id: body.room_type_id, hotelId: hotelContext });
    if (!roomType) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Referenced RoomType does not exist in this hotel");
    }
  }
  if (Array.isArray(body.extra_amenities) && body.extra_amenities.length > 0) {
    const Amenity = await getModel(hotelContext, "Amenity");
    const ids = [...new Set(body.extra_amenities.map((a) => a.amenity_id))];
    const found = await Amenity.countDocuments({ _id: { $in: ids }, hotelId: hotelContext });
    if (found !== ids.length) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "One or more referenced amenities do not exist in this hotel");
    }
  }
};

// Uniqueness: the UNIQUE index on `hotelId + room_number` is the final guarantee (E11000 -> 409).
export const createRoom = asyncHandler(async (req, res) => {
  const Room = await getModel(req.hotelContext, "Room");

  const existing = await Room.findOne({ hotelId: req.hotelContext, room_number: req.body.room_number });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Room with this number already exists in this hotel");
  }

  await assertRoomRefsInTenant(req.hotelContext, req.body);

  const roomData = { ...req.body, hotelId: req.hotelContext };
  const room = await Room.create(roomData);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, room, "Room created successfully"));
});

export const getRooms = asyncHandler(async (req, res) => {
  const Room = await getModel(req.hotelContext, "Room");

  const query = { hotelId: req.hotelContext };
  const floor = asString(req.query.floor);
  if (floor) query.floor = floor;
  const roomTypeId = objectIdQuery(req.query.room_type_id, "room_type_id");
  if (roomTypeId) query.room_type_id = roomTypeId;
  const status = asString(req.query.status);
  if (status) {
    if (!ROOM_STATUSES.includes(status.toUpperCase())) throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid status filter");
    query.status = status.toUpperCase();
  }
  const hk = asString(req.query.housekeeping_status);
  if (hk) {
    if (!HK_STATUSES.includes(hk.toUpperCase())) throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid housekeeping_status filter");
    query.housekeeping_status = hk.toUpperCase();
  }

  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 50 });

  const rooms = await Room.find(query).populate("room_type_id").sort({ room_number: 1 }).skip(skip).limit(limit);
  const total = await Room.countDocuments(query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, rooms, "Rooms retrieved successfully", { page, limit, total }));
});

export const getRoomById = asyncHandler(async (req, res) => {
  const Room = await getModel(req.hotelContext, "Room");
  const room = await Room.findOne({ _id: req.params.id, hotelId: req.hotelContext }).populate("room_type_id");

  if (!room) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, room, "Room retrieved successfully"));
});

export const updateRoom = asyncHandler(async (req, res) => {
  const Room = await getModel(req.hotelContext, "Room");

  await assertRoomRefsInTenant(req.hotelContext, req.body);

  const updateData = { ...req.body };
  delete updateData.hotelId;

  const room = await Room.findOneAndUpdate(
    { _id: req.params.id, hotelId: req.hotelContext },
    updateData,
    { returnDocument: "after", runValidators: true }
  );

  if (!room) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, room, "Room updated successfully"));
});

// Business rule: an OCCUPIED room cannot be removed from inventory.
export const deleteRoom = asyncHandler(async (req, res) => {
  const Room = await getModel(req.hotelContext, "Room");
  const room = await Room.findOne({ _id: req.params.id, hotelId: req.hotelContext });
  if (!room) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found");
  }
  if (room.status === "OCCUPIED") {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Occupied rooms cannot be deleted");
  }
  await Room.deleteOne({ _id: room._id, hotelId: req.hotelContext, status: { $ne: "OCCUPIED" } });
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, "Room deleted successfully"));
});
