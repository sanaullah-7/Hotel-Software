import { describe, it, expect } from 'vitest';
import {
  toFrontendComplaint,
  toFrontendComplaintList,
  toBackendComplaintPayload,
  toFrontendCategory,
  toBackendCategory,
  toFrontendSeverity,
  toBackendSeverity,
  toFrontendStatus,
  toBackendStatus,
  formatDateToYMD,
  CANONICAL_BACKEND_CATEGORIES,
  BACKEND_TO_UI_CATEGORY_MAP,
  UI_TO_BACKEND_CATEGORY_MAP,
  BACKEND_TO_UI_SEVERITY_MAP,
  UI_TO_BACKEND_SEVERITY_MAP,
  BACKEND_TO_UI_STATUS_MAP,
  UI_TO_BACKEND_STATUS_MAP,
} from '../features/front-office/adapters/complaintAdapter.js';

describe('Guest Complaint Data Adapter Unit Tests', () => {
  const mockMongoComplaintId = '65b1c2d3e4f5678901234567';
  const mockMongoGuestId = '65a1b2c3d4e5f67890123456';
  const mockMongoRoomId = '65d1e2f3a4b5678901234589';
  const mockMongoReservationId = '65c1d2e3f4a5678901234578';
  const mockMongoEmployeeId = '65e1f2a3b4c5678901234599';

  describe('1. Pure Helper Formatters', () => {
    it('formats ISO strings, Date instances, and timestamp numbers to YYYY-MM-DD', () => {
      expect(formatDateToYMD('2026-10-06T14:30:00.000Z')).toBe('2026-10-06');
      expect(formatDateToYMD('2026-12-25')).toBe('2026-12-25');
      expect(formatDateToYMD(new Date('2026-05-15T00:00:00.000Z'))).toBe('2026-05-15');
    });

    it('returns empty string for null, undefined, empty, or invalid dates', () => {
      expect(formatDateToYMD(null)).toBe('');
      expect(formatDateToYMD(undefined)).toBe('');
      expect(formatDateToYMD('')).toBe('');
      expect(formatDateToYMD('invalid-date')).toBe('');
    });
  });

  describe('2. Canonical Category Mappings (All 8 Categories)', () => {
    it('maps all 8 backend categories to frontend display strings', () => {
      expect(toFrontendCategory('GENERAL')).toBe('General');
      expect(toFrontendCategory('PLUMBING')).toBe('Plumbing');
      expect(toFrontendCategory('ELECTRICAL')).toBe('Electrical');
      expect(toFrontendCategory('HOUSEKEEPING')).toBe('Housekeeping');
      expect(toFrontendCategory('NOISE')).toBe('Noise');
      expect(toFrontendCategory('AIR_CONDITIONING')).toBe('Air Conditioning');
      expect(toFrontendCategory('ROOM_SERVICE')).toBe('Room Service');
      expect(toFrontendCategory('AMENITIES')).toBe('Amenities Request');
    });

    it('maps frontend category strings to canonical backend enums', () => {
      expect(toBackendCategory('General')).toBe('GENERAL');
      expect(toBackendCategory('General / Front Desk')).toBe('GENERAL');
      expect(toBackendCategory('Plumbing')).toBe('PLUMBING');
      expect(toBackendCategory('Electrical')).toBe('ELECTRICAL');
      expect(toBackendCategory('Housekeeping')).toBe('HOUSEKEEPING');
      expect(toBackendCategory('Noise')).toBe('NOISE');
      expect(toBackendCategory('Air Conditioning')).toBe('AIR_CONDITIONING');
      expect(toBackendCategory('AC')).toBe('AIR_CONDITIONING');
      expect(toBackendCategory('Room Service')).toBe('ROOM_SERVICE');
      expect(toBackendCategory('Amenities Request')).toBe('AMENITIES');
      expect(toBackendCategory('Amenities')).toBe('AMENITIES');
      expect(toBackendCategory('Unknown')).toBe('GENERAL');
    });
  });

  describe('3. Severity / Priority Mappings (All 4 Severities)', () => {
    it('maps backend severity enums to UI labels', () => {
      expect(toFrontendSeverity('LOW')).toBe('Low');
      expect(toFrontendSeverity('MEDIUM')).toBe('Medium');
      expect(toFrontendSeverity('HIGH')).toBe('High');
      expect(toFrontendSeverity('CRITICAL')).toBe('Critical');
    });

    it('maps frontend severity/priority strings to canonical backend enums', () => {
      expect(toBackendSeverity('Low')).toBe('LOW');
      expect(toBackendSeverity('Medium')).toBe('MEDIUM');
      expect(toBackendSeverity('High')).toBe('HIGH');
      expect(toBackendSeverity('Critical')).toBe('CRITICAL');
      expect(toBackendSeverity('Urgent')).toBe('CRITICAL');
      expect(toBackendSeverity('Unknown')).toBe('MEDIUM');
    });
  });

  describe('4. Status Mappings & Lifecycle', () => {
    it('maps backend status enums to UI labels', () => {
      expect(toFrontendStatus('OPEN')).toBe('Open');
      expect(toFrontendStatus('INVESTIGATING')).toBe('In Progress');
      expect(toFrontendStatus('RESOLVED')).toBe('Resolved');
      expect(toFrontendStatus('CLOSED')).toBe('Closed');
    });

    it('maps frontend status labels to canonical backend enums', () => {
      expect(toBackendStatus('Open')).toBe('OPEN');
      expect(toBackendStatus('In Progress')).toBe('INVESTIGATING');
      expect(toBackendStatus('Investigating')).toBe('INVESTIGATING');
      expect(toBackendStatus('Resolved')).toBe('RESOLVED');
      expect(toBackendStatus('Closed')).toBe('CLOSED');
      expect(toBackendStatus('Unknown')).toBe('OPEN');
    });
  });

  describe('5. toFrontendComplaint (Full Document Transformation)', () => {
    it('transforms a populated backend complaint document into the frontend view model', () => {
      const backendComplaint = {
        _id: mockMongoComplaintId,
        complaint_ref: 'CMP-20261006-A1B2',
        category: 'PLUMBING',
        description: 'Leaking bathroom pipe under sink',
        severity: 'HIGH',
        status: 'INVESTIGATING',
        resolution_notes: 'Plumber dispatched',
        compensation_offered: 'Complimentary drink',
        resolved_at: null,
        created_at: '2026-10-06T10:00:00.000Z',
        updated_at: '2026-10-06T11:00:00.000Z',
        guest_id: {
          _id: mockMongoGuestId,
          guest_ref: 'GST-12345',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0100',
        },
        room_id: {
          _id: mockMongoRoomId,
          room_number: '204',
          floor: '2',
          status: 'OCCUPIED',
        },
        reservation_id: {
          _id: mockMongoReservationId,
          booking_ref: 'RES-998877',
          status: 'IN_HOUSE',
        },
        assigned_to: {
          _id: mockMongoEmployeeId,
          employee_ref: 'EMP-001',
          first_name: 'Robert',
          last_name: 'Technician',
          job_title: 'Head of Maintenance',
        },
      };

      const result = toFrontendComplaint(backendComplaint);

      // IDs & references
      expect(result.id).toBe(mockMongoComplaintId);
      expect(result._id).toBe(mockMongoComplaintId);
      expect(result.complaintRef).toBe('CMP-20261006-A1B2');
      expect(result.complaint_ref).toBe('CMP-20261006-A1B2');

      // Guest details
      expect(result.guestId).toBe(mockMongoGuestId);
      expect(result.guestName).toBe('John Doe');
      expect(result.guestEmail).toBe('john.doe@example.com');
      expect(result.guestPhone).toBe('+1-555-0100');
      expect(result.guestRef).toBe('GST-12345');

      // Room details
      expect(result.roomId).toBe(mockMongoRoomId);
      expect(result.roomNo).toBe('204');
      expect(result.roomFloor).toBe('2');

      // Reservation details
      expect(result.reservationId).toBe(mockMongoReservationId);
      expect(result.bookingRef).toBe('RES-998877');

      // Staff details
      expect(result.assignedTo).toBe(mockMongoEmployeeId);
      expect(result.assignedEmployeeName).toBe('Robert Technician');
      expect(result.assignedEmployeeJobTitle).toBe('Head of Maintenance');

      // Classification & Content
      expect(result.category).toBe('Plumbing');
      expect(result.type).toBe('Plumbing');
      expect(result.severity).toBe('High');
      expect(result.priority).toBe('High');
      expect(result.status).toBe('In Progress');
      expect(result.description).toBe('Leaking bathroom pipe under sink');
      expect(result.resolution_notes).toBe('Plumber dispatched');
      expect(result.compensation_offered).toBe('Complimentary drink');
      expect(result.date).toBe('2026-10-06');
    });

    it('safely handles missing or unpopulated relationships', () => {
      const bareComplaint = {
        _id: mockMongoComplaintId,
        complaint_ref: 'CMP-20261006-9999',
        category: 'NOISE',
        description: 'Loud party in hallway',
        severity: 'LOW',
        status: 'OPEN',
        guest_id: mockMongoGuestId,
        room_id: null,
        reservation_id: null,
        assigned_to: null,
        created_at: '2026-10-06T08:00:00.000Z',
      };

      const result = toFrontendComplaint(bareComplaint);

      expect(result.id).toBe(mockMongoComplaintId);
      expect(result.guestId).toBe(mockMongoGuestId);
      expect(result.guestName).toBe('Guest');
      expect(result.roomNo).toBe('—');
      expect(result.roomId).toBe('');
      expect(result.reservationId).toBe('');
      expect(result.assignedTo).toBe('');
      expect(result.status).toBe('Open');
      expect(result.category).toBe('Noise');
    });

    it('returns null when input is null, undefined, or not an object', () => {
      expect(toFrontendComplaint(null)).toBeNull();
      expect(toFrontendComplaint(undefined)).toBeNull();
      expect(toFrontendComplaint('not an object')).toBeNull();
    });
  });

  describe('6. toFrontendComplaintList (List Transformation)', () => {
    it('transforms array of complaints and unwraps response envelopes', () => {
      const rawList = [
        { _id: '1', category: 'GENERAL', description: 'Desc 1', status: 'OPEN' },
        { _id: '2', category: 'ELECTRICAL', description: 'Desc 2', status: 'RESOLVED' },
      ];

      const fromArray = toFrontendComplaintList(rawList);
      expect(fromArray.length).toBe(2);
      expect(fromArray[0].category).toBe('General');
      expect(fromArray[1].category).toBe('Electrical');

      const fromEnvelope = toFrontendComplaintList({ complaints: rawList });
      expect(fromEnvelope.length).toBe(2);

      const fromDataEnvelope = toFrontendComplaintList({ data: rawList });
      expect(fromDataEnvelope.length).toBe(2);

      expect(toFrontendComplaintList(null)).toEqual([]);
      expect(toFrontendComplaintList(undefined)).toEqual([]);
    });
  });

  describe('7. toBackendComplaintPayload (Mutation Sanitizer & Enforcer)', () => {
    it('builds a clean create payload while rejecting immutable/server-controlled fields', () => {
      const frontendForm = {
        _id: 'attempted_fake_id',
        id: 'attempted_fake_id',
        complaint_ref: 'CMP-FAKE-REF',
        created_at: '2026-01-01',
        resolved_at: '2026-01-01',
        guestId: mockMongoGuestId,
        roomId: mockMongoRoomId,
        reservationId: mockMongoReservationId,
        assignedTo: mockMongoEmployeeId,
        type: 'Air Conditioning',
        priority: 'High',
        status: 'Open',
        description: 'AC is leaking water',
        resolutionNotes: 'Technician on way',
        compensationOffered: '$20 voucher',
      };

      const payload = toBackendComplaintPayload(frontendForm);

      // Required and valid fields
      expect(payload.guest_id).toBe(mockMongoGuestId);
      expect(payload.room_id).toBe(mockMongoRoomId);
      expect(payload.reservation_id).toBe(mockMongoReservationId);
      expect(payload.assigned_to).toBe(mockMongoEmployeeId);
      expect(payload.category).toBe('AIR_CONDITIONING');
      expect(payload.severity).toBe('HIGH');
      expect(payload.status).toBe('OPEN');
      expect(payload.description).toBe('AC is leaking water');
      expect(payload.resolution_notes).toBe('Technician on way');
      expect(payload.compensation_offered).toBe('$20 voucher');

      // Immutable/server-controlled fields must NOT exist
      expect(payload._id).toBeUndefined();
      expect(payload.id).toBeUndefined();
      expect(payload.complaint_ref).toBeUndefined();
      expect(payload.created_at).toBeUndefined();
      expect(payload.resolved_at).toBeUndefined();
    });

    it('builds an update payload that strips guest_id and allows partial updates', () => {
      const updateForm = {
        guest_id: mockMongoGuestId, // Must be stripped in update mode
        status: 'Resolved',
        resolution_notes: 'Fixed pipe',
        priority: 'Low',
      };

      const payload = toBackendComplaintPayload(updateForm, { isUpdate: true });

      expect(payload.guest_id).toBeUndefined();
      expect(payload.status).toBe('RESOLVED');
      expect(payload.resolution_notes).toBe('Fixed pipe');
      expect(payload.severity).toBe('LOW');
    });

    it('handles empty optional relationship IDs by setting them to null', () => {
      const formWithEmptyRelations = {
        guest_id: mockMongoGuestId,
        room_id: '',
        reservation_id: null,
        assigned_to: '',
        category: 'Housekeeping',
        description: 'Clean room please',
      };

      const payload = toBackendComplaintPayload(formWithEmptyRelations);

      expect(payload.guest_id).toBe(mockMongoGuestId);
      expect(payload.room_id).toBeNull();
      expect(payload.reservation_id).toBeNull();
      expect(payload.assigned_to).toBeNull();
      expect(payload.category).toBe('HOUSEKEEPING');
    });
  });
});
