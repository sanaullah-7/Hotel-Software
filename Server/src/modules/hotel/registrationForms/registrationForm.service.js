import crypto from 'crypto';
import { getModel } from '../../../database/hotel/modelFactory.js';
import ApiError from '../../../utils/apiError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

export const ensureDefaultRegistrationForms = async (tenantConn) => {
  const RegistrationForm = await getModel(tenantConn, 'RegistrationForm');
  const count = await RegistrationForm.countDocuments();
  if (count === 0) {
    const defaults = [
      {
        form_no: 'REG-2026-089',
        guest_name: 'Kamran Akmal',
        id_type: 'CNIC',
        id_number: '42101-1122334-1',
        room_number: '101',
        status: 'Signed & Verified',
        completed_at: new Date('2026-05-10'),
      },
      {
        form_no: 'REG-2026-088',
        guest_name: 'Cara Stevens',
        id_type: 'Passport',
        id_number: 'USA-9988221',
        room_number: '102',
        status: 'Signed & Verified',
        completed_at: new Date('2026-05-01'),
      },
      {
        form_no: 'REG-2026-087',
        guest_name: 'Airi Satou',
        id_type: 'Passport',
        id_number: 'JPN-4455112',
        room_number: '105',
        status: 'Pending Signature',
        completed_at: new Date('2026-05-02'),
      },
      {
        form_no: 'REG-2026-086',
        guest_name: 'Mahira Khan',
        id_type: 'CNIC',
        id_number: '42201-6655443-2',
        room_number: '201',
        status: 'Signed & Verified',
        completed_at: new Date('2026-05-09'),
      },
      {
        form_no: 'REG-2026-085',
        guest_name: 'Jens Brincker',
        id_type: 'Passport',
        id_number: 'GER-8833119',
        room_number: '302',
        status: 'Signed & Verified',
        completed_at: new Date('2026-05-03'),
      },
    ];
    await RegistrationForm.insertMany(defaults, { ordered: false });
  }
};

export const getRegistrationForms = async (tenantConn, query = {}) => {
  await ensureDefaultRegistrationForms(tenantConn);
  const RegistrationForm = await getModel(tenantConn, 'RegistrationForm');
  const filter = {};
  if (query.status && query.status !== 'All') {
    filter.status = new RegExp(query.status, 'i');
  }
  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { guest_name: new RegExp(s, 'i') },
      { form_no: new RegExp(s, 'i') },
      { id_number: new RegExp(s, 'i') },
      { room_number: new RegExp(s, 'i') },
    ];
  }
  return await RegistrationForm.find(filter).sort({ completed_at: -1, created_at: -1 });
};

export const createRegistrationForm = async (tenantConn, data) => {
  const RegistrationForm = await getModel(tenantConn, 'RegistrationForm');
  const Guest = await getModel(tenantConn, 'Guest');

  const guestName = (data.guest_name || data.guest || `${data.first_name || data.firstName || ''} ${data.last_name || data.lastName || ''}`).trim();
  if (!guestName) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Guest Name is required');
  }

  const formNo = data.form_no || data.formNo || `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Also auto-create or link Guest in hotel guest registry if not existing
  let primaryGuestId = data.primary_guest_id || null;
  if (!primaryGuestId && guestName) {
    const existingGuest = await Guest.findOne({
      $or: [
        ...(data.email ? [{ email: data.email }] : []),
        ...(data.phone ? [{ phone: data.phone }] : []),
        { full_name: guestName },
      ],
    });
    if (existingGuest) {
      primaryGuestId = existingGuest._id;
    } else {
      const parts = guestName.split(/\s+/);
      const newGuest = new Guest({
        guest_ref: `GST-${Date.now().toString().slice(-6)}${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        first_name: data.first_name || data.firstName || parts[0] || 'Guest',
        last_name: data.last_name || data.lastName || parts.slice(1).join(' ') || '',
        email: data.email || undefined,
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        national_id: data.id_number || data.idNumber || undefined,
        notes: data.special_requests || data.specialRequests || undefined,
        status: 'Active',
      });
      await newGuest.save().catch(() => {});
      primaryGuestId = newGuest._id;
    }
  }

  const newForm = new RegistrationForm({
    form_no: formNo,
    guest_name: guestName,
    first_name: data.first_name || data.firstName || '',
    last_name: data.last_name || data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    gender: data.gender || '',
    address: data.address || '',
    city: data.city || '',
    country: data.country || '',
    arrival_date: data.arrival_date || data.arrivalDate || null,
    departure_date: data.departure_date || data.departureDate || null,
    room_type: data.room_type || data.roomType || '',
    room_number: data.room_number || data.room || (data.room_type ? `${data.room_type} Suite` : 'Allocating'),
    number_of_guests: data.number_of_guests || data.numberOfGuests || 1,
    id_type: data.id_type || data.idType || 'National ID / Doc',
    id_number: data.id_number || data.idNumber || '',
    special_requests: data.special_requests || data.specialRequests || '',
    status: data.status || 'Signed & Verified',
    terms_accepted: data.terms_accepted !== undefined ? data.terms_accepted : true,
    stay_id: data.stay_id || null,
    primary_guest_id: primaryGuestId,
    completed_at: data.arrival_date || data.arrivalDate ? new Date(data.arrival_date || data.arrivalDate) : new Date(),
  });

  return await newForm.save();
};

export const getRegistrationFormById = async (tenantConn, id) => {
  const RegistrationForm = await getModel(tenantConn, 'RegistrationForm');
  const form = await RegistrationForm.findById(id);
  if (!form) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Registration Form not found');
  }
  return form;
};

export const deleteRegistrationForm = async (tenantConn, id) => {
  const RegistrationForm = await getModel(tenantConn, 'RegistrationForm');
  const form = await RegistrationForm.findByIdAndDelete(id);
  if (!form) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Registration Form not found');
  }
  return { message: 'Registration Form deleted successfully', id };
};
