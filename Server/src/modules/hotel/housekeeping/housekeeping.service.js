import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";

export const createTask = async (tenantConn, taskData) => {
  const Room = await getModel(tenantConn, "Room");
  const Employee = await getModel(tenantConn, "Employee");
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");

  const { room_id, assigned_to, task_type, priority = "MEDIUM", notes } = taskData;

  // 1. Cross-tenant check for Room & Employee
  if (!mongoose.Types.ObjectId.isValid(room_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
  }
  const room = await Room.findById(room_id);
  if (!room) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found in this hotel");
  }

  let employee = null;
  if (assigned_to) {
    if (!mongoose.Types.ObjectId.isValid(assigned_to)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Employee ID format");
    }
    employee = await Employee.findById(assigned_to);
    if (!employee) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employee not found in this hotel");
    }
  }

  const task = await HousekeepingTask.create({
    room_id: room._id,
    assigned_to: employee ? employee._id : null,
    task_type,
    priority,
    status: employee ? "ASSIGNED" : "PENDING",
    notes,
  });

  return task;
};

export const getTasks = async (tenantConn, query = {}) => {
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");

  const filter = {};
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

export const updateTask = async (tenantConn, taskId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid HousekeepingTask ID format");
  }

  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");
  const Room = await getModel(tenantConn, "Room");

  const task = await HousekeepingTask.findById(taskId);
  if (!task) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Housekeeping task not found");
  }

  if (updateData.status) {
    task.status = updateData.status;
    if (updateData.status === "IN_PROGRESS" && !task.started_at) {
      task.started_at = new Date();
    }
    if (["COMPLETED", "VERIFIED"].includes(updateData.status)) {
      task.completed_at = new Date();
      // Update room housekeeping status to CLEAN
      const room = await Room.findById(task.room_id);
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
  return HousekeepingTask.findById(taskId)
    .populate("room_id", "room_number status housekeeping_status floor")
    .populate("assigned_to", "first_name last_name employee_ref");
};
