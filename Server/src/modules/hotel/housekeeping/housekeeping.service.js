import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";

export const createTask = async (hotelContext, taskData) => {
  const Room = await getModel(hotelContext, "Room");
  const Employee = await getModel(hotelContext, "Employee");
  const HousekeepingTask = await getModel(hotelContext, "HousekeepingTask");

  const { room_id, assigned_to, task_type, priority = "MEDIUM", notes } = taskData;

  // 1. Cross-tenant check for Room & Employee
  if (!mongoose.Types.ObjectId.isValid(room_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
  }
  const room = await Room.findOne({ _id: room_id, hotelId: hotelContext });
  if (!room) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found in this hotel");
  }

  let employee = null;
  if (assigned_to) {
    if (!mongoose.Types.ObjectId.isValid(assigned_to)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Employee ID format");
    }
    employee = await Employee.findOne({ _id: assigned_to, hotelId: hotelContext });
    if (!employee) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employee not found in this hotel");
    }
  }

  const task = await HousekeepingTask.create({
    hotelId: hotelContext,
    room_id: room._id,
    assigned_to: employee ? employee._id : null,
    task_type,
    priority,
    status: employee ? "ASSIGNED" : "PENDING",
    notes,
  });

  return task;
};

export const getTasks = async (hotelContext, query = {}) => {
  const HousekeepingTask = await getModel(hotelContext, "HousekeepingTask");

  const filter = { hotelId: hotelContext };
  const status = asString(query.status);
  if (status) filter.status = status.toUpperCase();

  const roomId = asString(query.room_id);
  if (roomId) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
    }
    filter.room_id = roomId;
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const tasks = await HousekeepingTask.find(filter)
    .populate("room_id", "room_number status housekeeping_status floor")
    .populate("assigned_to", "first_name last_name employee_ref")
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await HousekeepingTask.countDocuments(filter);

  return {
    tasks,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const updateTask = async (hotelContext, taskId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid HousekeepingTask ID format");
  }

  const HousekeepingTask = await getModel(hotelContext, "HousekeepingTask");
  const Room = await getModel(hotelContext, "Room");

  const task = await HousekeepingTask.findOne({ _id: taskId, hotelId: hotelContext });
  if (!task) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Housekeeping task not found");
  }

  // Validate all references before any status change can modify the room.
  if (updateData.assigned_to) {
    const Employee = await getModel(hotelContext, 'Employee');
    if (!mongoose.Types.ObjectId.isValid(updateData.assigned_to) ||
        !await Employee.exists({ _id: updateData.assigned_to, hotelId: hotelContext })) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Employee not found in this hotel');
    }
  }

  if (updateData.status) {
    task.status = updateData.status;
    if (updateData.status === "IN_PROGRESS" && !task.started_at) {
      task.started_at = new Date();
    }
    if (["COMPLETED", "VERIFIED"].includes(updateData.status)) {
      task.completed_at = new Date();
      // Update room housekeeping status to CLEAN
      const room = await Room.findOne({ _id: task.room_id, hotelId: hotelContext });
      if (room) {
        room.housekeeping_status = updateData.status === "VERIFIED" ? "INSPECTED" : "CLEAN";
        await room.save();
      }
    }
  }

  if (updateData.assigned_to !== undefined) {
    task.assigned_to = updateData.assigned_to;
  }
  if (updateData.notes !== undefined) {
    task.notes = updateData.notes;
  }

  await task.save();
  return HousekeepingTask.findOne({ _id: taskId, hotelId: hotelContext })
    .populate("room_id", "room_number status housekeeping_status floor")
    .populate("assigned_to", "first_name last_name employee_ref");
};
