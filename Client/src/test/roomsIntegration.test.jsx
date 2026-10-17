import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  toFrontendRoom, 
  toBackendRoomPayload, 
  toFrontendRoomType, 
  toBackendRoomTypePayload,
  UI_STATUS_MAP,
  BACKEND_STATUS_MAP 
} from '../features/rooms/adapters/roomAdapter';
import { 
  getRooms, 
  syncRoomsFromBackend, 
  getRoomByRoomNo, 
  normalizeRoomType, 
  toStandardRoomType 
} from '../features/rooms/state/roomStore';
import roomService from '../services/roomService';
import api from '../api/client';

describe('Phase 2B: Rooms Backend Integration & Adapter Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Room Adapter Transformations', () => {
    it('correctly adapts backend populated room to frontend UI schema', () => {
      const backendRoom = {
        _id: '6ac37e971b583261b8266316',
        room_number: '101',
        room_type_id: {
          _id: '6ac37e971b583261b8266315',
          code: 'DLX',
          name: 'Deluxe Suite',
          base_occupancy: 2,
          max_occupancy: 4,
          base_price: 15000,
        },
        floor: '2',
        status: 'AVAILABLE',
        housekeeping_status: 'CLEAN',
        extra_amenities: [],
        active_bookings: [],
      };

      const adapted = toFrontendRoom(backendRoom);

      expect(adapted.id).toBe('6ac37e971b583261b8266316');
      expect(adapted.roomNo).toBe('101');
      expect(adapted.roomType).toBe('Deluxe Suite');
      expect(adapted.roomTypeId).toBe('6ac37e971b583261b8266315');
      expect(adapted.rent).toBe(15000);
      expect(adapted.capacity).toBe(4);
      expect(adapted.status).toBe('Open');
      expect(adapted.rawStatus).toBe('AVAILABLE');
      expect(adapted.housekeepingStatus).toBe('Clean');
      expect(adapted.floor).toBe('2');
      expect(adapted.mobile).toBe('');
    });

    it('correctly adapts backend room phone number to frontend mobile', () => {
      const backendRoom = {
        _id: '6ac37e971b583261b8266317',
        room_number: '105',
        phone: '1234567890',
        floor: '1',
      };
      const adapted = toFrontendRoom(backendRoom);
      expect(adapted.mobile).toBe('1234567890');
    });

    it('correctly adapts frontend form into backend API payload', () => {
      const frontendForm = {
        roomNo: '202',
        roomTypeId: '6ac37e971b583261b8266315',
        floor: '2',
        status: 'Booked',
        housekeepingStatus: 'Dirty',
      };

      const payload = toBackendRoomPayload(frontendForm);

      expect(payload).toEqual({
        room_number: '202',
        room_type_id: '6ac37e971b583261b8266315',
        floor: '2',
        status: 'OCCUPIED',
        housekeeping_status: 'DIRTY',
      });
    });

    it('includes phone in payload when mobile or contactMobile is provided', () => {
      const payloadFromContactMobile = toBackendRoomPayload({
        roomNo: '203',
        roomTypeId: '6ac37e971b583261b8266315',
        contactMobile: '03001234567',
      });
      expect(payloadFromContactMobile.phone).toBe('03001234567');

      const payloadFromMobile = toBackendRoomPayload({
        roomNo: '204',
        roomTypeId: '6ac37e971b583261b8266315',
        mobile: '03119876543',
      });
      expect(payloadFromMobile.phone).toBe('03119876543');
    });

    it('correctly adapts Room Types between backend and frontend', () => {
      const backendType = {
        _id: '6ac37e971b583261b8266315',
        code: 'EXE',
        name: 'Executive Suite',
        description: 'Top floor luxury',
        base_occupancy: 2,
        max_occupancy: 5,
        base_price: 25000,
      };

      const adapted = toFrontendRoomType(backendType);
      expect(adapted.code).toBe('EXE');
      expect(adapted.name).toBe('Executive Suite');
      expect(adapted.rent).toBe(25000);
      expect(adapted.capacity).toBe(5);

      const payload = toBackendRoomTypePayload({
        code: 'exe',
        name: 'Executive Suite',
        description: 'Top floor luxury',
        base_occupancy: 2,
        capacity: 5,
        rent: 25000,
      });

      expect(payload.code).toBe('EXE');
      expect(payload.name).toBe('Executive Suite');
      expect(payload.base_price).toBe(25000);
      expect(payload.max_occupancy).toBe(5);
    });
  });

  describe('2. Transitional roomStore Compatibility Bridge', () => {
    it('syncs backend rooms into roomStore compatibility cache', () => {
      const backendRooms = [
        {
          _id: '6ac37e971b583261b8266316',
          room_number: '101',
          room_type_id: { _id: 't1', name: 'Deluxe Room', base_price: 12000, max_occupancy: 3 },
          floor: '1',
          status: 'AVAILABLE',
          housekeeping_status: 'CLEAN',
        },
        {
          _id: '6ac37e971b583261b8266317',
          room_number: '102',
          room_type_id: { _id: 't2', name: 'Executive Suite', base_price: 20000, max_occupancy: 4 },
          floor: '1',
          status: 'OCCUPIED',
          housekeeping_status: 'CLEAN',
        },
      ].map(toFrontendRoom);

      syncRoomsFromBackend(backendRooms);

      const cached = getRooms();
      expect(cached.some(r => r.roomNo === '101')).toBe(true);
      expect(cached.some(r => r.roomNo === '102')).toBe(true);
      const room101 = cached.find(r => r.roomNo === '101');
      expect(room101.roomType).toBe('Deluxe Room');
      expect(room101.rent).toBe(12000);

      const room102 = getRoomByRoomNo('102');
      expect(room102).not.toBeNull();
      expect(room102.status).toBe('Booked');
    });

    it('preserves room type normalization functions for downstream modules', () => {
      expect(normalizeRoomType('Deluxe Room')).toBe('deluxe');
      expect(toStandardRoomType('delux')).toBe('Deluxe Room');
      expect(toStandardRoomType('suite')).toBe('Suite');
    });
  });

  describe('3. roomService API Wiring', () => {
    it('calls GET /hotel/rooms with parameters', async () => {
      const spy = vi.spyOn(api, 'get').mockResolvedValue({
        status: 200,
        data: [{ _id: 'r1', room_number: '101' }],
      });

      const res = await roomService.getRooms({ status: 'AVAILABLE' });
      expect(spy).toHaveBeenCalledWith('/hotel/rooms', { status: 'AVAILABLE' });
      expect(res.data.length).toBe(1);
    });

    it('calls POST /hotel/rooms to create a room', async () => {
      const spy = vi.spyOn(api, 'post').mockResolvedValue({
        status: 201,
        data: { _id: 'r1', room_number: '105', status: 'AVAILABLE' },
      });

      const payload = { room_number: '105', room_type_id: 't1' };
      const res = await roomService.createRoom(payload);
      expect(spy).toHaveBeenCalledWith('/hotel/rooms', payload);
      expect(res.data.room_number).toBe('105');
    });

    it('calls DELETE /hotel/rooms/:id to delete a room', async () => {
      const spy = vi.spyOn(api, 'delete').mockResolvedValue({
        status: 200,
        data: null,
      });

      await roomService.deleteRoom('r1');
      expect(spy).toHaveBeenCalledWith('/hotel/rooms/r1');
    });
  });
});
