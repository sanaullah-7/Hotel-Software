import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";
import { resolveAlertsForRoom } from "../alerts/operationsAlert.service.js";

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
    status: taskData.status || (employee ? "ASSIGNED" : "PENDING"),
    notes,
    scheduled_at: taskData.scheduled_at || null,
    scheduled_end_at: taskData.scheduled_end_at || null,
    started_at: taskData.started_at || (taskData.status === "IN_PROGRESS" ? new Date() : null),
    completed_at: taskData.completed_at || (["COMPLETED", "VERIFIED"].includes(taskData.status) ? new Date() : null),
    is_deleted: false,
  });

  if (["COMPLETED", "VERIFIED"].includes(task.status)) {
    room.housekeeping_status = task.status === "VERIFIED" ? "INSPECTED" : "CLEAN";
    await room.save();
    await resolveAlertsForRoom(tenantConn, room.room_number, ["HOUSEKEEPING", "MAINTENANCE"]);
  } else if (task.status === "IN_PROGRESS" && room.housekeeping_status !== "CLEANING") {
    room.housekeeping_status = "CLEANING";
    await room.save();
  }

  return HousekeepingTask.findById(task._id)
    .populate("room_id", "room_number status housekeeping_status floor")
    .populate("assigned_to", "first_name last_name employee_ref");
};

export const getTasks = async (tenantConn, query = {}) => {
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");

  const filter = { is_deleted: { $ne: true } };

  const status = asString(query.status);
  if (status) filter.status = status.toUpperCase();

  const roomId = asString(query.room_id);
  if (roomId) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
    }
    filter.room_id = roomId;
  }

  const assignedTo = asString(query.assigned_to);
  if (assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Employee ID format");
    }
    filter.assigned_to = assignedTo;
  }

  const taskType = asString(query.task_type);
  if (taskType) filter.task_type = taskType.toUpperCase();

  const priority = asString(query.priority);
  if (priority) filter.priority = priority.toUpperCase();

  // Scheduled date filtering
  const scheduledDate = asString(query.scheduled_date || query.date);
  if (scheduledDate) {
    const start = new Date(`${scheduledDate}T00:00:00.000Z`);
    const end = new Date(`${scheduledDate}T23:59:59.999Z`);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      filter.scheduled_at = { $gte: start, $lte: end };
    }
  } else if (query.start_date || query.end_date) {
    filter.scheduled_at = {};
    if (query.start_date) filter.scheduled_at.$gte = new Date(query.start_date);
    if (query.end_date) filter.scheduled_at.$lte = new Date(query.end_date);
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const tasks = await HousekeepingTask.find(filter)
    .populate("room_id", "room_number status housekeeping_status floor")
    .populate("assigned_to", "first_name last_name employee_ref")
    .sort({ scheduled_at: -1, created_at: -1, _id: -1 })
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
  if (!task || task.is_deleted) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Housekeeping task not found");
  }

  if (updateData.status) {
    task.status = updateData.status;
    if (updateData.status === "IN_PROGRESS") {
      if (!task.started_at) {
        task.started_at = new Date();
      }
      const room = await Room.findById(task.room_id);
      if (room && room.housekeeping_status !== "CLEANING") {
        room.housekeeping_status = "CLEANING";
        await room.save();
      }
    }
    if (["COMPLETED", "VERIFIED"].includes(updateData.status)) {
      task.completed_at = updateData.completed_at || new Date();
      // Update room housekeeping status to CLEAN / INSPECTED
      const room = await Room.findById(task.room_id);
      if (room) {
        room.housekeeping_status = updateData.status === "VERIFIED" ? "INSPECTED" : "CLEAN";
        await room.save();
        await resolveAlertsForRoom(tenantConn, room.room_number, ["HOUSEKEEPING", "MAINTENANCE"]);
      }
    }
  }

  if (updateData.assigned_to !== undefined) {
    task.assigned_to = updateData.assigned_to;
  }
  if (updateData.notes !== undefined) {
    task.notes = updateData.notes;
  }
  if (updateData.priority !== undefined) {
    task.priority = updateData.priority;
  }
  if (updateData.task_type !== undefined) {
    task.task_type = updateData.task_type;
  }
  if (updateData.scheduled_at !== undefined) {
    task.scheduled_at = updateData.scheduled_at;
  }
  if (updateData.scheduled_end_at !== undefined) {
    task.scheduled_end_at = updateData.scheduled_end_at;
  }
  if (updateData.started_at !== undefined) {
    task.started_at = updateData.started_at;
  }
  if (updateData.completed_at !== undefined) {
    task.completed_at = updateData.completed_at;
  }

  await task.save();
  return HousekeepingTask.findById(taskId)
    .populate("room_id", "room_number status housekeeping_status floor")
    .populate("assigned_to", "first_name last_name employee_ref");
};

export const deleteTask = async (tenantConn, taskId) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid HousekeepingTask ID format");
  }

  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");
  const task = await HousekeepingTask.findById(taskId);
  if (!task || task.is_deleted) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Housekeeping task not found");
  }

  task.is_deleted = true;
  await task.save();
  return { message: "Housekeeping task deleted successfully" };
};
