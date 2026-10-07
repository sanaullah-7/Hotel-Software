import mongoose from 'mongoose';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/apiError.js';
import ApiResponse from '../../../utils/apiResponse.js';
import { getModel } from '../../../database/hotel/modelFactory.js';

const RESOURCES = Object.freeze({
  'registration-forms': 'RegistrationForm',
  'reservation-groups': 'ReservationGroup',
  'lost-found': 'LostFoundItem',
  'housekeeping-inspections': 'HousekeepingInspection',
  'housekeeping-checklists': 'HousekeepingChecklist',
  'inventory-items': 'InventoryItem',
  'inventory-movements': 'InventoryMovement',
  'inventory-incidents': 'InventoryIncident',
  'guest-charges': 'GuestCharge',
  'rate-plans': 'RatePlan',
  'rate-calendar': 'RateCalendar',
  discounts: 'Discount',
  taxes: 'Tax',
  fees: 'Fee',
  refunds: 'Refund',
  expenses: 'Expense',
  'parking-spaces': 'ParkingSpace',
  'parking-records': 'ParkingRecord',
  complaints: 'Complaint',
  alerts: 'OperationsAlert',
  attendance: 'AttendanceRecord',
  leaves: 'LeaveRequest',
  'payroll-runs': 'PayrollRun',
  'payroll-items': 'PayrollItem',
  'restaurant-categories': 'RestaurantCategory',
  'restaurant-menu': 'RestaurantMenuItem',
  'restaurant-tables': 'RestaurantTable',
  'restaurant-orders': 'RestaurantOrder',
  events: 'Event',
  beos: 'BEO',
  'event-resources': 'EventResource',
  notifications: 'Notification',
  files: 'FileRecord',
  'audit-logs': 'AuditLog',
});

const PROTECTED = new Set(['_id', 'hotelId', '__v', 'created_at', 'updated_at']);

const resolveResource = async (resource) => {
  const modelName = RESOURCES[resource];
  if (!modelName) throw new ApiError(404, 'Unknown hotel data resource');
  return getModel(modelName);
};

const cleanPayload = (input = {}) => Object.fromEntries(
  Object.entries(input).filter(([key]) => !PROTECTED.has(key) && !key.startsWith('$'))
);

const getPathValue = (value, path) => path.split('.').reduce((current, part) => current?.[part], value);

const validateReferences = async (Model, payload, hotelId) => {
  for (const [path, schemaType] of Object.entries(Model.schema.paths)) {
    const ref = schemaType.options?.ref || schemaType.caster?.options?.ref;
    if (!ref || ref === 'Hotel') continue;
    const raw = getPathValue(payload, path);
    const values = (Array.isArray(raw) ? raw : [raw]).filter(Boolean);
    if (!values.length) continue;
    if (values.some(value => !mongoose.Types.ObjectId.isValid(value))) {
      throw new ApiError(400, `Invalid ${path} reference`);
    }
    const RefModel = mongoose.models[ref];
    if (!RefModel) throw new ApiError(400, `Unsupported ${path} reference`);
    const count = await RefModel.countDocuments({ _id: { $in: values }, hotelId });
    if (count !== new Set(values.map(String)).size) {
      throw new ApiError(400, `${path} must reference records from this hotel`);
    }
  }
};

export const listResources = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, Object.keys(RESOURCES), 'Hotel data resources retrieved'));
});

export const listRecords = asyncHandler(async (req, res) => {
  const Model = await resolveResource(req.params.resource);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const filter = { hotelId: req.hotelContext };
  for (const key of ['status', 'category', 'type', 'is_active', 'employee_id', 'guest_id']) {
    if (req.query[key] !== undefined && Model.schema.path(key)) filter[key] = req.query[key];
  }
  const [records, total] = await Promise.all([
    Model.find(filter).sort({ created_at: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Model.countDocuments(filter),
  ]);
  res.json(new ApiResponse(200, records, 'Records retrieved', { page, limit, total, pages: Math.ceil(total / limit) }));
});

export const getRecord = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, 'Invalid record identifier');
  const Model = await resolveResource(req.params.resource);
  const record = await Model.findOne({ _id: req.params.id, hotelId: req.hotelContext }).lean();
  if (!record) throw new ApiError(404, 'Record not found');
  res.json(new ApiResponse(200, record, 'Record retrieved'));
});

export const createRecord = asyncHandler(async (req, res) => {
  const Model = await resolveResource(req.params.resource);
  const payload = cleanPayload(req.body);
  await validateReferences(Model, payload, req.hotelContext);
  const record = await Model.create({ ...payload, hotelId: req.hotelContext });
  res.status(201).json(new ApiResponse(201, record, 'Record created'));
});

export const updateRecord = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, 'Invalid record identifier');
  const Model = await resolveResource(req.params.resource);
  const payload = cleanPayload(req.body);
  await validateReferences(Model, payload, req.hotelContext);
  const record = await Model.findOneAndUpdate(
    { _id: req.params.id, hotelId: req.hotelContext },
    { $set: payload },
    { returnDocument: 'after', runValidators: true }
  );
  if (!record) throw new ApiError(404, 'Record not found');
  res.json(new ApiResponse(200, record, 'Record updated'));
});

export const deleteRecord = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, 'Invalid record identifier');
  const Model = await resolveResource(req.params.resource);
  const record = await Model.findOneAndDelete({ _id: req.params.id, hotelId: req.hotelContext });
  if (!record) throw new ApiError(404, 'Record not found');
  res.json(new ApiResponse(200, null, 'Record deleted'));
});

