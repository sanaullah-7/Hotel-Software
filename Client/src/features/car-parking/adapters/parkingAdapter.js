/**
 * Adapter for bidirectional mapping between backend Parking schema models and frontend view representations.
 */

const formatStatusToFrontend = (status) => {
  if (!status) return 'Available';
  const upper = String(status).toUpperCase();
  if (upper === 'AVAILABLE') return 'Available';
  if (upper === 'OCCUPIED') return 'Occupied';
  if (upper === 'BLOCKED') return 'Blocked';
  if (upper === 'MAINTENANCE') return 'Maintenance';
  return status;
};

const formatRecordStatusToFrontend = (status) => {
  if (!status) return 'Parked';
  const upper = String(status).toUpperCase();
  if (upper === 'PARKED') return 'Parked';
  if (upper === 'EXITED' || upper === 'CHECKED OUT') return 'Checked Out';
  return status;
};

export const toFrontendSpace = (backendSpace) => {
  if (!backendSpace) return null;
  const num = backendSpace.space_number || backendSpace.number || '';
  return {
    id: backendSpace._id || backendSpace.id || num,
    number: num,
    status: formatStatusToFrontend(backendSpace.status),
    location: backendSpace.location || 'Main Lot',
    isAccessible: Boolean(backendSpace.is_accessible),
  };
};

export const toFrontendSpaces = (spaces = []) => {
  return (Array.isArray(spaces) ? spaces : []).map(toFrontendSpace).filter(Boolean);
};

export const toFrontendRecord = (backendRecord) => {
  if (!backendRecord) return null;

  const spaceNumber =
    backendRecord.space_id?.space_number ||
    backendRecord.space_number ||
    (typeof backendRecord.space_id === 'string' ? backendRecord.space_id : '') ||
    backendRecord.parkingSpace ||
    '';

  const entryDate = backendRecord.entry_time
    ? new Date(backendRecord.entry_time).toISOString().split('T')[0]
    : backendRecord.entryDate || '';

  const entryTime = backendRecord.entry_time
    ? new Date(backendRecord.entry_time).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      })
    : backendRecord.entryTime || '';

  const exitDate = backendRecord.exit_time
    ? new Date(backendRecord.exit_time).toISOString().split('T')[0]
    : backendRecord.exitDate || null;

  const exitTime = backendRecord.exit_time
    ? new Date(backendRecord.exit_time).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      })
    : backendRecord.exitTime || null;

  return {
    id: backendRecord._id || backendRecord.id,
    recordRef: backendRecord.record_ref || '',
    guestName:
      backendRecord.guest_name ||
      (backendRecord.guest_id
        ? `${backendRecord.guest_id.first_name || ''} ${backendRecord.guest_id.last_name || ''}`.trim()
        : '') ||
      backendRecord.guestName ||
      '',
    roomNumber: backendRecord.room_number || backendRecord.roomNumber || '',
    carNumber: backendRecord.vehicle_plate || backendRecord.carNumber || '',
    carType: backendRecord.vehicle_type || backendRecord.carType || 'Sedan',
    parkingSpace: spaceNumber,
    spaceId: backendRecord.space_id?._id || backendRecord.space_id,
    entryDate,
    entryTime,
    exitDate,
    exitTime,
    chargeType: backendRecord.charge_type || backendRecord.chargeType || 'Free',
    chargeAmount: Number(backendRecord.charge_amount ?? backendRecord.chargeAmount ?? 0),
    paymentStatus: backendRecord.payment_status || backendRecord.paymentStatus || 'Pending',
    status: formatRecordStatusToFrontend(backendRecord.status),
    carImage: backendRecord.car_image || backendRecord.carImage || '',
  };
};

export const toFrontendRecords = (records = []) => {
  return (Array.isArray(records) ? records : []).map(toFrontendRecord).filter(Boolean);
};

export const toBackendRecordPayload = (frontendData) => {
  const payload = {
    vehicle_plate: (frontendData.carNumber || frontendData.vehicle_plate || '').trim().toUpperCase(),
    guest_name: (frontendData.guestName || frontendData.guest_name || '').trim(),
    room_number: (frontendData.roomNumber || frontendData.room_number || '').trim(),
    vehicle_type: frontendData.carType || frontendData.vehicle_type || 'Sedan',
    parking_space: (frontendData.parkingSpace || '').trim().toUpperCase(),
    charge_type: frontendData.chargeType || frontendData.charge_type || 'Free',
    charge_amount: Number(frontendData.chargeAmount ?? frontendData.charge_amount ?? 0),
    payment_status: frontendData.paymentStatus || frontendData.payment_status || 'Pending',
    car_image: frontendData.carImage || frontendData.car_image || '',
  };

  if (frontendData.entryDate || frontendData.entryTime) {
    const d = frontendData.entryDate || new Date().toISOString().split('T')[0];
    const t = frontendData.entryTime || '00:00';
    const parsed = new Date(`${d}T${t}`);
    if (!isNaN(parsed.getTime())) {
      payload.entry_time = parsed.toISOString();
    }
  }

  return payload;
};
