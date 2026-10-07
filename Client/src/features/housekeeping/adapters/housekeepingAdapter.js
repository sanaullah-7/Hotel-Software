/**
 * housekeepingAdapter.js
 *
 * Dedicated bidirectional adapter between UI contracts in RoomsAndCleaning.jsx
 * and CleaningSchedule.jsx and the canonical backend HousekeepingTask contract.
 */

export const TASK_TYPE_UI_TO_BACKEND = {
  'Full Clean': 'CLEANING',
  'Quick Clean': 'CLEANING',
  'Deep Clean': 'DEEP_CLEANING',
  'Deep Cleaning': 'DEEP_CLEANING',
  'Turn Down': 'TURN_DOWN',
  'Inspection': 'INSPECTION',
  'Daily': 'CLEANING',
  'Checkout Cleaning': 'CLEANING',
  'Touch-up': 'CLEANING',
  'Stayover Cleaning': 'CLEANING',
  'VIP Cleaning': 'CLEANING',
  'Extra Cleaning': 'CLEANING'
};

export const TASK_TYPE_BACKEND_TO_UI = {
  'CLEANING': 'Full Clean',
  'DEEP_CLEANING': 'Deep Clean',
  'TURN_DOWN': 'Turn Down',
  'INSPECTION': 'Inspection'
};

export const PRIORITY_UI_TO_BACKEND = {
  'Low': 'LOW',
  'Standard': 'MEDIUM',
  'Normal': 'MEDIUM',
  'Medium': 'MEDIUM',
  'High': 'HIGH',
  'Urgent': 'URGENT'
};

export const PRIORITY_BACKEND_TO_UI = {
  'LOW': 'Low',
  'MEDIUM': 'Standard',
  'HIGH': 'High',
  'URGENT': 'Urgent'
};

export const PRIORITY_BACKEND_TO_SCHEDULE_UI = {
  'LOW': 'Low',
  'MEDIUM': 'Medium',
  'HIGH': 'High',
  'URGENT': 'High'
};

export const STATUS_UI_TO_BACKEND = {
  'Scheduled': 'PENDING',
  'Pending': 'PENDING',
  'In Progress': 'IN_PROGRESS',
  'Completed': 'COMPLETED',
  'Clean / Ready': 'VERIFIED',
  'Delayed': 'PENDING',
  'Cancelled': 'CANCELLED'
};

export const STATUS_BACKEND_TO_UI = {
  'PENDING': 'Scheduled',
  'ASSIGNED': 'Scheduled',
  'IN_PROGRESS': 'In Progress',
  'COMPLETED': 'Completed',
  'VERIFIED': 'Clean / Ready',
  'CANCELLED': 'Scheduled'
};

export const STATUS_BACKEND_TO_SCHEDULE_UI = {
  'PENDING': 'Pending',
  'ASSIGNED': 'Pending',
  'IN_PROGRESS': 'In Progress',
  'COMPLETED': 'Completed',
  'VERIFIED': 'Completed',
  'CANCELLED': 'Delayed'
};

function formatToHHMM(dateVal, fallback = '09:00') {
  if (!dateVal) return fallback;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return fallback;
  return d.toTimeString().slice(0, 5);
}

function formatToYYYYMMDD(dateVal, fallback = null) {
  if (!dateVal) return fallback || new Date().toISOString().split('T')[0];
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return fallback || new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
}

/**
 * Maps a single backend HousekeepingTask entity to the frontend display record (Rooms & Cleaning).
 */
export function toFrontendTask(task, roomLookup = {}, employeeLookup = {}) {
  if (!task) return null;

  // Resolve room information
  const roomId = task.room_id?._id || task.room_id;
  const populatedRoom = task.room_id && typeof task.room_id === 'object' ? task.room_id : null;
  const lookupRoom = (roomId && roomLookup[roomId]) || null;
  const roomNo = String(
    populatedRoom?.room_number ||
    lookupRoom?.room_number ||
    task.room_number ||
    ''
  );
  const floor = populatedRoom?.floor || lookupRoom?.floor || (roomNo.length >= 3 ? roomNo[0] : '1');

  // Resolve employee / assigned staff
  const empId = task.assigned_to?._id || task.assigned_to;
  const populatedEmp = task.assigned_to && typeof task.assigned_to === 'object' ? task.assigned_to : null;
  const lookupEmp = (empId && employeeLookup[empId]) || null;
  let assignedStaff = '';
  if (populatedEmp) {
    const fullName = `${populatedEmp.first_name || ''} ${populatedEmp.last_name || ''}`.trim();
    assignedStaff = fullName || populatedEmp.employee_ref || '';
  } else if (lookupEmp) {
    const fullName = `${lookupEmp.first_name || ''} ${lookupEmp.last_name || ''}`.trim();
    assignedStaff = fullName || lookupEmp.employee_ref || '';
  }

  // Extract guest name if stored in notes e.g. [Guest: John Doe]
  let guestName = '';
  let cleanNotes = task.notes || '';
  if (cleanNotes.includes('[Guest:')) {
    const match = cleanNotes.match(/\[Guest:\s*([^\]]+)\]/);
    if (match && match[1]) {
      guestName = match[1].trim();
      cleanNotes = cleanNotes.replace(/\[Guest:\s*[^\]]+\]/, '').trim();
    }
  }

  // Task type & priority & status
  const cleaningType = TASK_TYPE_BACKEND_TO_UI[task.task_type] || 'Full Clean';
  const priority = PRIORITY_BACKEND_TO_UI[task.priority] || 'Standard';
  const cleaningStatus = STATUS_BACKEND_TO_UI[task.status] || 'Scheduled';

  // Scheduled date and time from scheduled_at (or fallback to started_at / created_at)
  const scheduledDate = formatToYYYYMMDD(task.scheduled_at || task.started_at || task.created_at);
  const scheduledTime = formatToHHMM(task.scheduled_at || task.started_at, '09:00');

  let completionTime = '';
  let lastCleanedDate = '';
  if (task.completed_at) {
    const d = new Date(task.completed_at);
    if (!isNaN(d.getTime())) {
      completionTime = d.toTimeString().slice(0, 5);
      lastCleanedDate = d.toLocaleDateString();
    }
  } else if (task.status === 'COMPLETED' || task.status === 'VERIFIED') {
    lastCleanedDate = 'Today';
  }

  return {
    id: task._id,
    _id: task._id,
    roomId,
    roomNo,
    guestName,
    cleaningStatus,
    status: cleaningStatus,
    priority,
    cleaningType,
    assignedStaff,
    employeeId: empId || null,
    scheduledDate,
    scheduledTime,
    completionTime,
    notes: cleanNotes,
    lastCleanedDate,
    floor,
    frequency: 'Daily',
    rawBackend: task
  };
}

/**
 * Transforms an array of backend tasks to frontend records for RoomsAndCleaning.
 */
export function toFrontendTaskList(tasks = [], rooms = [], employees = []) {
  const roomLookup = {};
  rooms.forEach(r => {
    if (r._id) roomLookup[r._id] = r;
  });

  const employeeLookup = {};
  employees.forEach(e => {
    if (e._id) employeeLookup[e._id] = e;
  });

  return tasks.map(t => toFrontendTask(t, roomLookup, employeeLookup));
}

/**
 * Maps a single backend HousekeepingTask to the CleaningSchedule UI representation.
 */
export function toScheduleTask(task, roomLookup = {}, employeeLookup = {}) {
  if (!task) return null;

  // Resolve room
  const roomId = task.room_id?._id || task.room_id;
  const populatedRoom = task.room_id && typeof task.room_id === 'object' ? task.room_id : null;
  const lookupRoom = (roomId && roomLookup[roomId]) || null;
  const roomNo = String(
    populatedRoom?.room_number ||
    lookupRoom?.room_number ||
    task.room_number ||
    ''
  );

  // Resolve staff
  const empId = task.assigned_to?._id || task.assigned_to;
  const populatedEmp = task.assigned_to && typeof task.assigned_to === 'object' ? task.assigned_to : null;
  const lookupEmp = (empId && employeeLookup[empId]) || null;
  let assignedStaff = '';
  if (populatedEmp) {
    const fullName = `${populatedEmp.first_name || ''} ${populatedEmp.last_name || ''}`.trim();
    assignedStaff = fullName || populatedEmp.employee_ref || '';
  } else if (lookupEmp) {
    const fullName = `${lookupEmp.first_name || ''} ${lookupEmp.last_name || ''}`.trim();
    assignedStaff = fullName || lookupEmp.employee_ref || '';
  }

  let cleanNotes = task.notes || '';
  let isDelayed = cleanNotes.includes('[Delayed]');
  if (isDelayed) {
    cleanNotes = cleanNotes.replace(/\[Delayed\]\s*/, '').trim();
  }

  const taskType = TASK_TYPE_BACKEND_TO_UI[task.task_type] || 'Full Clean';
  const priority = PRIORITY_BACKEND_TO_SCHEDULE_UI[task.priority] || 'Medium';
  let status = STATUS_BACKEND_TO_SCHEDULE_UI[task.status] || 'Pending';
  if (isDelayed && status === 'Pending') {
    status = 'Delayed';
  }

  const startTime = formatToHHMM(task.scheduled_at || task.started_at, '09:00');
  const endTime = formatToHHMM(task.scheduled_end_at || task.completed_at, '10:00');

  return {
    id: task._id,
    _id: task._id,
    roomId,
    roomNo,
    taskType,
    cleaningType: taskType,
    assignedStaff,
    employeeId: empId || null,
    startTime,
    endTime,
    priority,
    status,
    notes: cleanNotes,
    rawBackend: task
  };
}

/**
 * Transforms an array of backend tasks to CleaningSchedule records.
 */
export function toScheduleTaskList(tasks = [], rooms = [], employees = []) {
  const roomLookup = {};
  rooms.forEach(r => {
    if (r._id) roomLookup[r._id] = r;
  });

  const employeeLookup = {};
  employees.forEach(e => {
    if (e._id) employeeLookup[e._id] = e;
  });

  return tasks.map(t => toScheduleTask(t, roomLookup, employeeLookup));
}

/**
 * Prepares backend task payload for RoomsAndCleaning form.
 */
export function toBackendTaskPayload(form, { rooms = [], employees = [], existingTask = null } = {}) {
  // 1. Resolve room_id
  const targetRoomNo = String(form.roomNo || '').trim().toLowerCase();
  const matchedRoom = rooms.find(r => 
    (r._id && r._id === form.roomId) ||
    (r.room_number && String(r.room_number).trim().toLowerCase() === targetRoomNo)
  );

  let roomId = matchedRoom?._id;
  if (!roomId && existingTask) {
    roomId = existingTask.room_id?._id || existingTask.room_id || existingTask.roomId;
  }

  if (!roomId) {
    throw new Error(`Room "${form.roomNo}" not found. Please specify a valid room number.`);
  }

  // 2. Resolve assigned_to
  const targetStaff = String(form.assignedStaff || '').trim().toLowerCase();
  let assignedTo = undefined;
  if (targetStaff) {
    const matchedEmp = employees.find(e => {
      const fullName = `${e.first_name || ''} ${e.last_name || ''}`.trim().toLowerCase();
      const ref = String(e.employee_ref || '').trim().toLowerCase();
      return (e._id && e._id === form.employeeId) || fullName === targetStaff || ref === targetStaff;
    });
    if (matchedEmp?._id) {
      assignedTo = matchedEmp._id;
    } else if (existingTask?.assigned_to && !form.assignedStaffChanged) {
      assignedTo = existingTask.assigned_to._id || existingTask.assigned_to;
    }
  }

  // 3. Task type
  const taskType = TASK_TYPE_UI_TO_BACKEND[form.cleaningType] || 'CLEANING';

  // 4. Priority
  const priority = PRIORITY_UI_TO_BACKEND[form.priority] || 'MEDIUM';

  // 5. Status
  let status = STATUS_UI_TO_BACKEND[form.cleaningStatus] || 'PENDING';
  if (status === 'PENDING' && assignedTo) {
    status = 'ASSIGNED';
  }

  // 6. Proper Scheduling Timestamps (Issue B fix)
  let scheduledAt = undefined;
  if (form.scheduledDate) {
    const timePart = form.scheduledTime || '09:00';
    const parsedDate = new Date(`${form.scheduledDate}T${timePart}:00`);
    if (!isNaN(parsedDate.getTime())) {
      scheduledAt = parsedDate.toISOString();
    }
  }

  let startedAt = undefined;
  if (status === 'IN_PROGRESS') {
    startedAt = existingTask?.started_at || new Date().toISOString();
  }

  let completedAt = undefined;
  if (status === 'COMPLETED' || status === 'VERIFIED') {
    if (form.completionTime && form.scheduledDate) {
      const parsedCompleted = new Date(`${form.scheduledDate}T${form.completionTime}:00`);
      if (!isNaN(parsedCompleted.getTime())) {
        completedAt = parsedCompleted.toISOString();
      } else {
        completedAt = new Date().toISOString();
      }
    } else {
      completedAt = new Date().toISOString();
    }
  }

  // 7. Notes - preserve guest name if specified
  let notes = form.notes || '';
  if (form.guestName && form.guestName.trim()) {
    notes = `[Guest: ${form.guestName.trim()}] ${notes}`.trim();
  }

  const payload = {
    room_id: roomId,
    task_type: taskType,
    priority,
    status,
    notes
  };

  if (assignedTo) payload.assigned_to = assignedTo;
  if (scheduledAt) payload.scheduled_at = scheduledAt;
  if (startedAt) payload.started_at = startedAt;
  if (completedAt) payload.completed_at = completedAt;

  return payload;
}

/**
 * Prepares backend task payload for CleaningSchedule form.
 */
export function toScheduleBackendPayload(form, { rooms = [], employees = [], existingTask = null } = {}) {
  // 1. Resolve room_id
  const targetRoomNo = String(form.roomNo || '').trim().toLowerCase();
  const matchedRoom = rooms.find(r => 
    (r._id && r._id === form.roomId) ||
    (r.room_number && String(r.room_number).trim().toLowerCase() === targetRoomNo)
  );

  let roomId = matchedRoom?._id;
  if (!roomId && existingTask) {
    roomId = existingTask.room_id?._id || existingTask.room_id || existingTask.roomId;
  }

  if (!roomId) {
    throw new Error(`Room "${form.roomNo}" not found. Please specify a valid room number.`);
  }

  // 2. Resolve assigned_to
  const targetStaff = String(form.assignedStaff || '').trim().toLowerCase();
  let assignedTo = undefined;
  if (targetStaff && targetStaff !== 'unassigned') {
    const matchedEmp = employees.find(e => {
      const fullName = `${e.first_name || ''} ${e.last_name || ''}`.trim().toLowerCase();
      const ref = String(e.employee_ref || '').trim().toLowerCase();
      return (e._id && e._id === form.employeeId) || fullName === targetStaff || ref === targetStaff;
    });
    if (matchedEmp?._id) {
      assignedTo = matchedEmp._id;
    } else if (existingTask?.assigned_to) {
      assignedTo = existingTask.assigned_to._id || existingTask.assigned_to;
    }
  }

  // 3. Task type
  const taskType = TASK_TYPE_UI_TO_BACKEND[form.taskType || form.cleaningType] || 'CLEANING';

  // 4. Priority
  const priority = PRIORITY_UI_TO_BACKEND[form.priority] || 'MEDIUM';

  // 5. Status
  let status = STATUS_UI_TO_BACKEND[form.status] || 'PENDING';
  if (status === 'PENDING' && assignedTo) {
    status = 'ASSIGNED';
  }

  // 6. Scheduling Timestamps (startTime, endTime)
  const todayDate = new Date().toISOString().split('T')[0];
  let scheduledAt = undefined;
  if (form.startTime) {
    const parsedStart = new Date(`${todayDate}T${form.startTime}:00`);
    if (!isNaN(parsedStart.getTime())) {
      scheduledAt = parsedStart.toISOString();
    }
  } else if (existingTask?.scheduled_at) {
    scheduledAt = existingTask.scheduled_at;
  }

  let scheduledEndAt = undefined;
  if (form.endTime) {
    const parsedEnd = new Date(`${todayDate}T${form.endTime}:00`);
    if (!isNaN(parsedEnd.getTime())) {
      scheduledEndAt = parsedEnd.toISOString();
    }
  } else if (existingTask?.scheduled_end_at) {
    scheduledEndAt = existingTask.scheduled_end_at;
  }

  // Actual execution timestamps
  let startedAt = undefined;
  if (status === 'IN_PROGRESS') {
    startedAt = existingTask?.started_at || new Date().toISOString();
  }

  let completedAt = undefined;
  if (status === 'COMPLETED' || status === 'VERIFIED') {
    completedAt = existingTask?.completed_at || new Date().toISOString();
  }

  // 7. Notes - preserve Delayed tag if status was Delayed
  let notes = form.notes || '';
  if (form.status === 'Delayed') {
    notes = `[Delayed] ${notes}`.trim();
  }

  const payload = {
    room_id: roomId,
    task_type: taskType,
    priority,
    status,
    notes
  };

  if (assignedTo) payload.assigned_to = assignedTo;
  if (scheduledAt) payload.scheduled_at = scheduledAt;
  if (scheduledEndAt) payload.scheduled_end_at = scheduledEndAt;
  if (startedAt) payload.started_at = startedAt;
  if (completedAt) payload.completed_at = completedAt;

  return payload;
}

/**
 * Transforms backend inspections, tasks, rooms, and employees to the Inspection.jsx UI table records.
 */
export function toInspectionUIList(inspections = [], tasks = [], rooms = [], employees = []) {
  const roomMap = {};
  rooms.forEach(r => {
    if (r._id) roomMap[r._id] = r;
    if (r.room_number) roomMap[String(r.room_number)] = r;
  });

  const empMap = {};
  employees.forEach(e => {
    if (e._id) empMap[e._id] = e;
  });

  const rows = [];
  const processedRoomIds = new Set();

  // 1. Process existing inspections
  inspections.forEach(insp => {
    const taskObj = insp.task_id && typeof insp.task_id === 'object' ? insp.task_id : null;
    const taskRoomObj = taskObj?.room_id && typeof taskObj.room_id === 'object' ? taskObj.room_id : null;
    const roomId = insp.room_id?._id || insp.room_id || taskRoomObj?._id || taskObj?.room_id;
    const room = (roomId && roomMap[roomId]) || taskRoomObj || null;
    const roomNo = String(room?.room_number || insp.room_number || insp.roomNo || taskRoomObj?.room_number || '');

    if (roomId) processedRoomIds.add(String(roomId));
    if (roomNo) processedRoomIds.add(roomNo);

    const inspStatus = insp.status === 'PASSED' ? 'Approved' : (insp.status === 'FAILED' ? 'Failed' : 'Pending');
    const inspectorEmp = insp.inspector_id && typeof insp.inspector_id === 'object'
      ? insp.inspector_id
      : (insp.inspector_id && empMap[insp.inspector_id]);
    const inspectorName = inspectorEmp ? `${inspectorEmp.first_name || ''} ${inspectorEmp.last_name || ''}`.trim() : (insp.inspector_name || 'Supervisor');

    // Extract guest name and clean notes from task
    let guestName = '-';
    let cleaningType = 'Full Clean';
    let housekeeper = '-';
    let completedTime = '-';
    let priority = 'Normal';

    if (taskObj) {
      if (taskObj.notes && taskObj.notes.includes('[Guest:')) {
        const m = taskObj.notes.match(/\[Guest:\s*([^\]]+)\]/);
        if (m && m[1]) guestName = m[1].trim();
      }
      cleaningType = TASK_TYPE_BACKEND_TO_UI[taskObj.task_type] || 'Full Clean';
      const assignedEmp = taskObj.assigned_to && typeof taskObj.assigned_to === 'object'
        ? taskObj.assigned_to
        : (taskObj.assigned_to && empMap[taskObj.assigned_to]);
      if (assignedEmp) housekeeper = `${assignedEmp.first_name || ''} ${assignedEmp.last_name || ''}`.trim();
      if (taskObj.completed_at) {
        completedTime = formatToHHMM(taskObj.completed_at, '-');
      }
      priority = PRIORITY_BACKEND_TO_UI[taskObj.priority] || 'Normal';
    }

    const roomType = room?.room_type_id?.name || room?.room_type || 'Deluxe';

    rows.push({
      id: roomNo || String(insp._id),
      roomNo,
      roomId: roomId || null,
      taskId: taskObj?._id || insp.task_id || null,
      inspectionId: insp._id,
      type: roomType,
      guest: guestName,
      cleaningType,
      assignee: housekeeper,
      completedTime,
      priority,
      inspectionStatus: inspStatus,
      inspector: inspectorName,
      inspectorId: insp.inspector_id?._id || insp.inspector_id || null,
      inspectionTime: formatToHHMM(insp.inspected_at || insp.created_at, '12:00'),
      inspectionComments: insp.comments || '',
      status: inspStatus === 'Approved' ? 'Clean / Ready' : 'Inspection Required',
      rawInspection: insp,
      rawTask: taskObj
    });
  });

  // 2. Add tasks that are completed/ready for inspection but don't have an inspection record yet
  tasks.forEach(task => {
    const taskRoomObj = task.room_id && typeof task.room_id === 'object' ? task.room_id : null;
    const roomId = taskRoomObj?._id || task.room_id;
    const room = (roomId && roomMap[roomId]) || taskRoomObj || null;
    const roomNo = String(room?.room_number || task.room_number || '');

    if ((roomId && processedRoomIds.has(String(roomId))) || (roomNo && processedRoomIds.has(roomNo))) {
      return; // Already represented by inspection
    }

    // Only include tasks ready for inspection (COMPLETED) or tasks with type INSPECTION
    if (task.status === 'COMPLETED' || task.task_type === 'INSPECTION' || room?.housekeeping_status === 'CLEAN') {
      if (roomId) processedRoomIds.add(String(roomId));
      if (roomNo) processedRoomIds.add(roomNo);

      let guestName = '-';
      if (task.notes && task.notes.includes('[Guest:')) {
        const m = task.notes.match(/\[Guest:\s*([^\]]+)\]/);
        if (m && m[1]) guestName = m[1].trim();
      }

      const assignedEmp = task.assigned_to && typeof task.assigned_to === 'object'
        ? task.assigned_to
        : (task.assigned_to && empMap[task.assigned_to]);
      const housekeeper = assignedEmp ? `${assignedEmp.first_name || ''} ${assignedEmp.last_name || ''}`.trim() : '-';

      const roomType = room?.room_type_id?.name || room?.room_type || 'Deluxe';
      const cleaningType = TASK_TYPE_BACKEND_TO_UI[task.task_type] || 'Full Clean';
      const priority = PRIORITY_BACKEND_TO_UI[task.priority] || 'Normal';
      const completedTime = task.completed_at ? formatToHHMM(task.completed_at, '10:30') : '-';

      rows.push({
        id: roomNo || String(task._id),
        roomNo,
        roomId: roomId || null,
        taskId: task._id,
        inspectionId: null,
        type: roomType,
        guest: guestName,
        cleaningType,
        assignee: housekeeper,
        completedTime,
        priority,
        inspectionStatus: 'Pending',
        inspector: '-',
        inspectorId: null,
        inspectionTime: '-',
        inspectionComments: '',
        status: 'Inspection Required',
        rawInspection: null,
        rawTask: task
      });
    }
  });

  return rows;
}

/**
 * Transforms backend employees, tasks, and rooms to the StaffAssignment.jsx UI table records.
 */
export function toStaffAssignmentUIList(employees = [], tasks = [], rooms = []) {
  if (!Array.isArray(employees)) return [];

  const roomMap = {};
  rooms.forEach(r => {
    if (r._id) roomMap[r._id] = r;
  });

  return employees.map(emp => {
    const empId = emp._id;
    const empRef = emp.employee_ref || String(emp._id).slice(-6);
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || empRef;

    const assignedTasks = tasks.filter(t => {
      const taskEmpId = t.assigned_to?._id || t.assigned_to;
      return String(taskEmpId) === String(empId) && !t.is_deleted && t.status !== 'CANCELLED';
    });

    const pending = assignedTasks.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED').length;
    const cleaning = assignedTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const inspectionPending = assignedTasks.filter(t => t.status === 'COMPLETED').length;
    const completed = assignedTasks.filter(t => t.status === 'VERIFIED').length;

    let uiStatus = 'Active';
    if (emp.status === 'INACTIVE' || emp.status === 'TERMINATED') {
      uiStatus = 'Off Duty';
    } else if (emp.status === 'ON_LEAVE') {
      uiStatus = 'Off Duty';
    }

    return {
      id: empRef,
      _id: emp._id,
      name: fullName,
      department: emp.department?.name || emp.department || 'Housekeeping',
      role: emp.role || 'Housekeeper',
      status: uiStatus,
      assignedRooms: assignedTasks.length,
      pending,
      cleaning,
      inspectionPending,
      completed,
      tasks: assignedTasks,
      rawEmployee: emp
    };
  });
}

