/**
 * Bidirectional Room and RoomType Adapters
 * Translates between Backend MongoDB contracts and Frontend UI/Store models.
 */

export const BACKEND_ROOM_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
  CLEANING: 'CLEANING',
  OUT_OF_ORDER: 'OUT_OF_ORDER',
};

export const UI_STATUS_MAP = {
  AVAILABLE: 'Open',
  OCCUPIED: 'Booked',
  MAINTENANCE: 'Inactive',
  CLEANING: 'Inactive',
  OUT_OF_ORDER: 'Inactive',
};

export const BACKEND_STATUS_MAP = {
  Open: 'AVAILABLE',
  Available: 'AVAILABLE',
  Booked: 'OCCUPIED',
  Occupied: 'OCCUPIED',
  Inactive: 'MAINTENANCE',
  Maintenance: 'MAINTENANCE',
  Cleaning: 'CLEANING',
  'Out of Order': 'OUT_OF_ORDER',
};

export const BACKEND_HK_MAP = {
  Clean: 'CLEAN',
  Dirty: 'DIRTY',
  Inspected: 'INSPECTED',
};

export const UI_HK_MAP = {
  CLEAN: 'Clean',
  DIRTY: 'Dirty',
  INSPECTED: 'Inspected',
};

/**
 * Transforms a canonical backend Room object into frontend UI model
 */
export function toFrontendRoom(backendRoom) {
  if (!backendRoom) return null;

  const roomTypeObj = typeof backendRoom.room_type_id === 'object' && backendRoom.room_type_id !== null
    ? backendRoom.room_type_id
    : null;

  const roomTypeId = roomTypeObj ? roomTypeObj._id : (backendRoom.room_type_id || '');
  const roomTypeName = roomTypeObj?.name || roomTypeObj?.code || 'Standard Room';
  const rent = roomTypeObj?.base_price ?? 0;
  const capacity = roomTypeObj?.max_occupancy ?? roomTypeObj?.base_occupancy ?? 2;

  const rawStatus = (backendRoom.status || 'AVAILABLE').toUpperCase();
  const rawHkStatus = (backendRoom.housekeeping_status || 'CLEAN').toUpperCase();

  return {
    id: backendRoom._id,
    _id: backendRoom._id,
    roomNo: backendRoom.room_number || '',
    roomNumber: backendRoom.room_number || '',
    roomTypeId,
    room_type_id: roomTypeId,
    roomTypeObj,
    roomType: roomTypeName,
    floor: backendRoom.floor || '1',
    floorNumber: backendRoom.floor || '1',
    status: UI_STATUS_MAP[rawStatus] || 'Open',
    rawStatus,
    housekeepingStatus: UI_HK_MAP[rawHkStatus] || 'Clean',
    rawHousekeepingStatus: rawHkStatus,
    rent: Number(rent) || 0,
    capacity: Number(capacity) || 2,
    extra_amenities: backendRoom.extra_amenities || [],
    active_bookings: backendRoom.active_bookings || [],
    acNonAc: 'AC',
    meal: 'All',
    mobile: '',
    roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop',
    created_at: backendRoom.created_at,
    updated_at: backendRoom.updated_at,
  };
}

/**
 * Transforms a frontend room form object into backend API payload
 */
export function toBackendRoomPayload(frontendForm) {
  const roomNumber = String(frontendForm.roomNo || frontendForm.roomNumber || '').trim();
  const roomTypeId = frontendForm.roomTypeId || frontendForm.room_type_id;

  const uiStatus = frontendForm.status || frontendForm.rawStatus || 'Open';
  const backendStatus = BACKEND_STATUS_MAP[uiStatus] || (Object.values(BACKEND_ROOM_STATUS).includes(uiStatus) ? uiStatus : 'AVAILABLE');

  const uiHk = frontendForm.housekeepingStatus || frontendForm.rawHousekeepingStatus || 'Clean';
  const backendHk = BACKEND_HK_MAP[uiHk] || (['CLEAN', 'DIRTY', 'INSPECTED'].includes(uiHk) ? uiHk : 'CLEAN');

  const payload = {
    room_number: roomNumber,
    room_type_id: roomTypeId,
    floor: String(frontendForm.floor || frontendForm.floorNumber || '').trim(),
    status: backendStatus,
    housekeeping_status: backendHk,
  };

  if (Array.isArray(frontendForm.extra_amenities) && frontendForm.extra_amenities.length > 0) {
    payload.extra_amenities = frontendForm.extra_amenities;
  }

  return payload;
}

/**
 * Transforms a canonical backend RoomType object into frontend UI model
 */
export function toFrontendRoomType(backendType) {
  if (!backendType) return null;
  return {
    id: backendType._id,
    _id: backendType._id,
    code: backendType.code,
    shortCode: backendType.code,
    name: backendType.name,
    roomType: backendType.name,
    description: backendType.description || '',
    base_occupancy: backendType.base_occupancy ?? 1,
    max_occupancy: backendType.max_occupancy ?? 2,
    capacity: backendType.max_occupancy ?? backendType.base_occupancy ?? 2,
    base_price: backendType.base_price ?? 0,
    rent: backendType.base_price ?? 0,
    amenities: backendType.amenities || [],
    status: 'Active',
    created_at: backendType.created_at,
    updated_at: backendType.updated_at,
  };
}

/**
 * Transforms a frontend room type form object into backend API payload
 */
export function toBackendRoomTypePayload(frontendForm) {
  const code = String(frontendForm.code || frontendForm.shortCode || (frontendForm.name || frontendForm.roomType || 'RM').slice(0, 4)).trim().toUpperCase();
  const name = String(frontendForm.name || frontendForm.roomType || '').trim();
  const baseOccupancy = Number(frontendForm.base_occupancy) || 1;
  const maxOccupancy = Math.max(Number(frontendForm.max_occupancy || frontendForm.capacity) || 2, baseOccupancy);
  const basePrice = Number(frontendForm.base_price ?? frontendForm.rent ?? 0);

  const payload = {
    code,
    name,
    description: String(frontendForm.description || frontendForm.notes || '').trim(),
    base_occupancy: baseOccupancy,
    max_occupancy: maxOccupancy,
    base_price: basePrice,
  };

  if (Array.isArray(frontendForm.amenities)) {
    payload.amenities = frontendForm.amenities;
  }

  return payload;
}
