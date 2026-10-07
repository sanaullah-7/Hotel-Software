import { describe, it, expect } from 'vitest';
import {
  toFrontendGuest,
  toBackendGuestPayload,
  splitFullName,
  formatDateToYMD,
} from '../features/guests/adapters/guestAdapter.js';

describe('Guest Adapter (guestAdapter.js)', () => {
  // ─── 1. splitFullName() ───────────────────────────────────────────────────────────
  describe('splitFullName()', () => {
    it('splits standard two-word name into first_name and last_name', () => {
      const result = splitFullName('John Doe');
      expect(result).toEqual({ first_name: 'John', last_name: 'Doe' });
    });

    it('splits multi-token name into first_name and remainder as last_name', () => {
      const result = splitFullName('Muhammad Younas Wazir');
      expect(result).toEqual({ first_name: 'Muhammad', last_name: 'Younas Wazir' });
    });

    it('handles single-token name with empty last_name', () => {
      const result = splitFullName('Sarah');
      expect(result).toEqual({ first_name: 'Sarah', last_name: '' });
    });

    it('handles excess whitespace between words', () => {
      const result = splitFullName('   Jane    Marie    Smith   ');
      expect(result).toEqual({ first_name: 'Jane', last_name: 'Marie Smith' });
    });

    it('handles empty or non-string inputs safely', () => {
      expect(splitFullName('')).toEqual({ first_name: '', last_name: '' });
      expect(splitFullName('   ')).toEqual({ first_name: '', last_name: '' });
      expect(splitFullName(null)).toEqual({ first_name: '', last_name: '' });
      expect(splitFullName(undefined)).toEqual({ first_name: '', last_name: '' });
    });
  });

  // ─── 2. formatDateToYMD() ─────────────────────────────────────────────────────────
  describe('formatDateToYMD()', () => {
    it('formats Date object to YYYY-MM-DD', () => {
      const date = new Date(Date.UTC(1995, 4, 15));
      expect(formatDateToYMD(date)).toBe('1995-05-15');
    });

    it('preserves already formatted YYYY-MM-DD string', () => {
      expect(formatDateToYMD('1990-12-31')).toBe('1990-12-31');
    });

    it('formats ISO string to YYYY-MM-DD', () => {
      expect(formatDateToYMD('2000-01-05T00:00:00.000Z')).toBe('2000-01-05');
    });

    it('returns empty string for invalid or empty date', () => {
      expect(formatDateToYMD('')).toBe('');
      expect(formatDateToYMD(null)).toBe('');
      expect(formatDateToYMD(undefined)).toBe('');
      expect(formatDateToYMD('invalid-date')).toBe('');
    });
  });

  // ─── 3. toFrontendGuest() — Backend to Frontend Transformation ───────────────────
  describe('toFrontendGuest()', () => {
    const rawBackendDoc = {
      _id: '6ac39d17ab4d72a799999f66',
      guest_ref: 'GST-987654ABCD',
      first_name: 'Kamran',
      last_name: 'Akmal',
      email: 'kamran@example.com',
      phone: '+923001234567',
      address: 'House 12, Street 4',
      city: 'Lahore',
      country: 'Pakistan',
      nationality: 'Pakistani',
      passport_number: 'PK1234567',
      national_id: '42101-1122334-1',
      date_of_birth: '1992-08-20T00:00:00.000Z',
      vip_status: true,
      notes: 'High floor preferred',
      created_at: '2026-05-01T10:00:00.000Z',
      updated_at: '2026-05-02T12:00:00.000Z',
    };

    it('transforms a complete backend guest document accurately', () => {
      const frontend = toFrontendGuest(rawBackendDoc);

      expect(frontend).toEqual({
        id: '6ac39d17ab4d72a799999f66',
        _id: '6ac39d17ab4d72a799999f66',
        guestId: '6ac39d17ab4d72a799999f66',
        guest_ref: 'GST-987654ABCD',
        guestRef: 'GST-987654ABCD',
        first_name: 'Kamran',
        last_name: 'Akmal',
        firstName: 'Kamran',
        lastName: 'Akmal',
        name: 'Kamran Akmal',
        email: 'kamran@example.com',
        phone: '+923001234567',
        mobile: '+923001234567',
        address: 'House 12, Street 4',
        city: 'Lahore',
        country: 'Pakistan',
        nationality: 'Pakistani',
        passport_number: 'PK1234567',
        passportNumber: 'PK1234567',
        passport: 'PK1234567',
        national_id: '42101-1122334-1',
        nationalId: '42101-1122334-1',
        cnic: '42101-1122334-1',
        vip_status: true,
        vipStatus: true,
        status: 'VIP',
        totalStays: 0,
        notes: 'High floor preferred',
        date_of_birth: '1992-08-20',
        dateOfBirth: '1992-08-20',
        dob: '1992-08-20',
        created_at: '2026-05-01T10:00:00.000Z',
        createdAt: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-02T12:00:00.000Z',
        updatedAt: '2026-05-02T12:00:00.000Z',
      });
    });

    it('unwraps response when wrapped in { guest: ... }', () => {
      const wrapped = { guest: rawBackendDoc };
      const frontend = toFrontendGuest(wrapped);
      expect(frontend.id).toBe('6ac39d17ab4d72a799999f66');
      expect(frontend.name).toBe('Kamran Akmal');
    });

    it('handles non-VIP guest status mapping to Active', () => {
      const nonVip = { ...rawBackendDoc, vip_status: false };
      const frontend = toFrontendGuest(nonVip);
      expect(frontend.vip_status).toBe(false);
      expect(frontend.status).toBe('Active');
    });

    it('handles single-name guest without creating "undefined" or placeholder "." in name', () => {
      const singleNameDoc = {
        _id: '6ac39d17ab4d72a799999f77',
        first_name: 'Madonna',
        last_name: '.',
        vip_status: false,
      };
      const frontend = toFrontendGuest(singleNameDoc);
      expect(frontend.name).toBe('Madonna');
      expect(frontend.first_name).toBe('Madonna');
      expect(frontend.last_name).toBe('.');
    });

    it('handles missing or null optional fields safely', () => {
      const minimalDoc = {
        _id: '6ac39d17ab4d72a799999f88',
        first_name: 'John',
        last_name: 'Smith',
      };
      const frontend = toFrontendGuest(minimalDoc);
      expect(frontend.email).toBe('');
      expect(frontend.phone).toBe('');
      expect(frontend.passportNumber).toBe('');
      expect(frontend.nationalId).toBe('');
      expect(frontend.city).toBe('');
      expect(frontend.country).toBe('');
      expect(frontend.notes).toBe('');
      expect(frontend.dateOfBirth).toBe('');
      expect(frontend.vip_status).toBe(false);
      expect(frontend.status).toBe('Active');
    });

    it('returns null for null or undefined input', () => {
      expect(toFrontendGuest(null)).toBeNull();
      expect(toFrontendGuest(undefined)).toBeNull();
      expect(toFrontendGuest('invalid')).toBeNull();
    });
  });

  // ─── 4. toBackendGuestPayload() — Frontend to Backend Transformation ─────────────
  describe('toBackendGuestPayload()', () => {
    const frontendForm = {
      name: 'Sarah Connor',
      email: 'sarah@resistance.org',
      phone: '+1555123456',
      address: '456 Cyber Way',
      city: 'Los Angeles',
      country: 'USA',
      nationality: 'American',
      passportNumber: 'usa12345678',
      nationalId: 'nat-998877',
      dateOfBirth: '1985-02-28',
      status: 'VIP',
      notes: 'Requires secure check-in',
      id: 'local_temp_id_should_be_stripped',
      _id: 'local_temp_id_should_be_stripped',
      guest_ref: 'GST-LOCAL_STRIPPED',
      totalStays: 5,
    };

    it('transforms complete frontend form into backend create payload', () => {
      const payload = toBackendGuestPayload(frontendForm);

      expect(payload).toEqual({
        first_name: 'Sarah',
        last_name: 'Connor',
        email: 'sarah@resistance.org',
        phone: '+1555123456',
        address: '456 Cyber Way',
        city: 'Los Angeles',
        country: 'USA',
        nationality: 'American',
        passport_number: 'USA12345678',
        national_id: 'NAT-998877',
        date_of_birth: '1985-02-28',
        vip_status: true,
        notes: 'Requires secure check-in',
      });

      // Confirm server-controlled and UI fields were excluded
      expect(payload._id).toBeUndefined();
      expect(payload.id).toBeUndefined();
      expect(payload.guest_ref).toBeUndefined();
      expect(payload.guestRef).toBeUndefined();
      expect(payload.totalStays).toBeUndefined();
    });

    it('does not mutate the input frontend object (immutability check)', () => {
      const original = { ...frontendForm };
      toBackendGuestPayload(frontendForm);
      expect(frontendForm).toEqual(original);
    });

    it('handles explicit first_name and last_name fields if provided', () => {
      const customForm = {
        first_name: 'Alexander',
        last_name: 'The Great',
        email: 'alex@empire.com',
      };
      const payload = toBackendGuestPayload(customForm);
      expect(payload.first_name).toBe('Alexander');
      expect(payload.last_name).toBe('The Great');
    });

    it('handles single-name guest on create by providing fallback last_name for backend schema', () => {
      const singleNameForm = {
        name: 'Plato',
        email: 'plato@academy.gr',
      };
      const payload = toBackendGuestPayload(singleNameForm);
      expect(payload.first_name).toBe('Plato');
      expect(payload.last_name).toBe('.');
    });

    // ─── Sparse Identity & Edge Cases ───────────────────────────────────────────────
    describe('Sparse Index & Identity Field Safety', () => {
      it('omits empty string passport_number on create (prevents sparse-index collisions)', () => {
        const formWithEmptyPassport = {
          name: 'John Doe',
          passportNumber: '',
          nationalId: '   ',
        };
        const payload = toBackendGuestPayload(formWithEmptyPassport);
        expect(payload.passport_number).toBeUndefined();
        expect(payload.national_id).toBeUndefined();
      });

      it('omits null/undefined identity fields on create', () => {
        const formWithNullIdentity = {
          name: 'Jane Doe',
          passport: null,
          cnic: undefined,
        };
        const payload = toBackendGuestPayload(formWithNullIdentity);
        expect(payload.passport_number).toBeUndefined();
        expect(payload.national_id).toBeUndefined();
      });

      it('uppercases and trims identity numbers', () => {
        const form = {
          name: 'Test Guest',
          passportNumber: '  a1234567b  ',
          nationalId: '  cnic-9988-xx  ',
        };
        const payload = toBackendGuestPayload(form);
        expect(payload.passport_number).toBe('A1234567B');
        expect(payload.national_id).toBe('CNIC-9988-XX');
      });
    });

    // ─── Update Mode ({ isUpdate: true }) ──────────────────────────────────────────
    describe('Update Mode ({ isUpdate: true })', () => {
      it('builds a partial update payload with only provided fields', () => {
        const partialUpdate = {
          phone: '+923331112233',
          city: 'Islamabad',
          status: 'Active',
        };
        const payload = toBackendGuestPayload(partialUpdate, { isUpdate: true });

        expect(payload).toEqual({
          phone: '+923331112233',
          city: 'Islamabad',
          vip_status: false,
        });

        expect(payload.first_name).toBeUndefined();
        expect(payload.last_name).toBeUndefined();
        expect(payload.passport_number).toBeUndefined();
      });

      it('maps cleared fields to null on update to allow backend database unsetting', () => {
        const clearFieldsUpdate = {
          passportNumber: '',
          notes: '',
          city: '',
        };
        const payload = toBackendGuestPayload(clearFieldsUpdate, { isUpdate: true });

        expect(payload.passport_number).toBeNull();
        expect(payload.notes).toBeNull();
        expect(payload.city).toBeNull();
      });

      it('never includes immutable guest_ref or _id even if present in update form', () => {
        const updateWithIds = {
          _id: '6ac39d17ab4d72a799999f66',
          id: '6ac39d17ab4d72a799999f66',
          guest_ref: 'GST-IMMUTABLE',
          guestRef: 'GST-IMMUTABLE',
          first_name: 'UpdatedName',
        };
        const payload = toBackendGuestPayload(updateWithIds, { isUpdate: true });

        expect(payload.first_name).toBe('UpdatedName');
        expect(payload._id).toBeUndefined();
        expect(payload.id).toBeUndefined();
        expect(payload.guest_ref).toBeUndefined();
        expect(payload.guestRef).toBeUndefined();
      });
    });
  });
});
