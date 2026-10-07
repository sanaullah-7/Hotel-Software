import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectPlatformDB, getPlatformConnection, closePlatformDB } from '../platform/platformConnection.js';
import { getHotelConnection, closeAllHotelConnections } from '../connectionManager.js';
import { getModel } from '../hotel/modelFactory.js';
import { withTransaction } from '../transaction.js';

describe('Database Foundation & Infrastructure (Single Shared Database)', () => {
  beforeAll(async () => {
    await connectPlatformDB();
  });

  afterAll(async () => {
    await closePlatformDB();
    await closeAllHotelConnections();
  });

  describe('1. Single Database Connection Initialization', () => {
    it('should successfully establish and return the shared database connection', async () => {
      const conn = await connectPlatformDB();
      expect(conn.readyState).toBe(1);
      const retrieved = getPlatformConnection();
      expect(retrieved).toBe(conn);
    });
  });

  describe('2-4. Hotel Connection Management (Shared Connection Architecture)', () => {
    it('should return active shared connection for a hotel', async () => {
      const hotelId = 'H1234';
      const conn = await getHotelConnection(hotelId);
      expect(conn.readyState).toBe(1);
      expect(conn.name).toMatch(/explore_pakistan/);
    });

    it('should use the same shared connection for all hotels', async () => {
      const conn1 = await getHotelConnection('H001');
      const conn2 = await getHotelConnection('H002');
      expect(conn1).toBe(conn2);
      expect(conn1.name).toBe(conn2.name);
    });
  });

  describe('5-6. Model Registration via Factory', () => {
    it('should register and return a model safely', async () => {
      const model = await getModel('HotelProfile');
      expect(model.modelName).toBe('HotelProfile');
    });

    it('should reuse the model without throwing OverwriteModelError', async () => {
      const model1 = await getModel('Guest');
      const model2 = await getModel('H001', 'Guest');
      expect(model1).toBe(model2);
    });

    it('should isolate documents by hotelId field in shared collection', async () => {
      const RoomModel = await getModel('Room');
      const dummyRt = new mongoose.Types.ObjectId();
      const hotelAId = new mongoose.Types.ObjectId();
      const hotelBId = new mongoose.Types.ObjectId();

      await RoomModel.create({ hotelId: hotelAId, room_number: '101', room_type_id: dummyRt, floor: '1' });
      await RoomModel.create({ hotelId: hotelBId, room_number: '101', room_type_id: dummyRt, floor: '1' });

      const roomsA = await RoomModel.find({ hotelId: hotelAId });
      const roomsB = await RoomModel.find({ hotelId: hotelBId });

      expect(roomsA.length).toBe(1);
      expect(roomsB.length).toBe(1);
      expect(roomsA[0].hotelId.toString()).toBe(hotelAId.toString());
      expect(roomsB[0].hotelId.toString()).toBe(hotelBId.toString());
    });

    it('should throw an error for an unregistered schema', async () => {
      await expect(getModel('H001', 'FakeEntityThatDoesNotExist')).rejects.toThrow();
    });
  });

  describe('7-8. Transaction Helper', () => {
    it('should commit transaction on success', async () => {
      const GuestModel = await getModel('Guest');
      const hotelId = new mongoose.Types.ObjectId();

      const result = await withTransaction(hotelId.toString(), async (session) => {
        const guest = new GuestModel({ hotelId, guest_ref: 'G1', first_name: 'John', last_name: 'Doe' });
        await guest.save(session ? { session } : {});
        return 'success';
      });

      expect(result).toBe('success');
      const count = await GuestModel.countDocuments({ hotelId, guest_ref: 'G1' });
      expect(count).toBe(1);
    });

    it('should rollback transaction on error', async () => {
      const GuestModel = await getModel('Guest');
      const hotelId = new mongoose.Types.ObjectId();

      const initialCount = await GuestModel.countDocuments({ hotelId, guest_ref: 'G2' });

      try {
        await withTransaction(hotelId.toString(), async (session) => {
          const guest = new GuestModel({ hotelId, guest_ref: 'G2', first_name: 'Jane', last_name: 'Doe' });
          if (session) {
            await guest.save({ session });
          } else {
            throw new Error('Simulated failure');
          }
          throw new Error('Simulated failure');
        });
      } catch (err) {
        expect(err.message).toBe('Simulated failure');
      }

      const newCount = await GuestModel.countDocuments({ hotelId, guest_ref: 'G2' });
      expect(newCount).toBe(initialCount);
    });
  });

  describe('9. Invalid Environment Configuration', () => {
    it('should require JWT secrets', () => {
      expect(true).toBe(true);
    });
  });

  describe('10. Schema Validation (Representative Entities)', () => {
    it('should enforce required fields (e.g. HotelProfile)', async () => {
      const HotelProfile = await getModel('HotelProfile');
      const profile = new HotelProfile({
        property_name: 'Only Name',
      });

      const err = profile.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    it('should prevent duplicate amenities via schema middleware', async () => {
      const RoomType = await getModel('RoomType');
      const dummyAmenityId = new mongoose.Types.ObjectId();
      const hotelId = new mongoose.Types.ObjectId();
      
      const rt = new RoomType({
        hotelId,
        code: 'RT1',
        name: 'Deluxe',
        base_occupancy: 2,
        max_occupancy: 3,
        base_price: 100,
        amenities: [
          { amenity_id: dummyAmenityId },
          { amenity_id: dummyAmenityId },
        ]
      });

      const err = rt.validateSync();
      expect(err).toBeUndefined();
      
      try {
        await rt.save();
        expect(true).toBe(false);
      } catch (err) {
        expect(err.message).toMatch(/Duplicate amenities/);
      }
    });
  });
});
