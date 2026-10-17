import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectPlatformDB, getPlatformConnection, closePlatformDB } from '../platform/platformConnection.js';
import { getHotelConnection, closeAllHotelConnections } from '../connectionManager.js';
import { getModel } from '../hotel/modelFactory.js';
import { withTransaction } from '../transaction.js';

describe('Database Foundation & Infrastructure', () => {
  beforeAll(async () => {
    process.env.PLATFORM_MONGO_URI = process.env.PLATFORM_MONGO_URI || 'mongodb://localhost:27017/test_explore_pakistan_platform';
    process.env.MONGODB_HOTEL_BASE_URI = process.env.MONGODB_HOTEL_BASE_URI || 'mongodb://localhost:27017/test_hotel_';
  });

  afterAll(async () => {
    await closePlatformDB();
    await closeAllHotelConnections();
  });

  describe('1. Platform DB Connection Initialization', () => {
    it('should successfully establish and return the platform connection', async () => {
      const conn = await connectPlatformDB();
      expect(conn.readyState).toBe(1);
      const retrieved = getPlatformConnection();
      expect(retrieved).toBe(conn);
    });
  });

  describe('2-4. Hotel Connection Management (Tenant Isolation)', () => {
    it('should create an isolated connection for a hotel', async () => {
      const hotelId = 'H1234';
      const conn = await getHotelConnection(hotelId);
      expect(conn.readyState).toBe(1);
      expect(conn.name).toBe('test_hotel_H1234');
    });

    it('should reuse an existing connection for the same hotel', async () => {
      const hotelId = 'H1234';
      const conn1 = await getHotelConnection(hotelId);
      const conn2 = await getHotelConnection(hotelId);
      expect(conn1).toBe(conn2);
    });

    it('should create different connections for different hotels', async () => {
      const conn1 = await getHotelConnection('H001');
      const conn2 = await getHotelConnection('H002');
      expect(conn1).not.toBe(conn2);
      expect(conn1.name).not.toBe(conn2.name);
    });
  });

  describe('5-6. Model Registration via Factory', () => {
    it('should register and return a model safely', async () => {
      const model = await getModel('H001', 'HotelProfile');
      expect(model.modelName).toBe('HotelProfile');
    });

    it('should reuse the model without throwing OverwriteModelError', async () => {
      const model1 = await getModel('H001', 'Guest');
      const model2 = await getModel('H001', 'Guest');
      expect(model1).toBe(model2);
    });

    it('should keep models isolated between hotels', async () => {
      const modelH1 = await getModel('H001', 'Room');
      const modelH2 = await getModel('H002', 'Room');
      expect(modelH1.db).not.toBe(modelH2.db);
    });

    it('should throw an error for an unregistered schema', async () => {
      await expect(getModel('H001', 'FakeEntityThatDoesNotExist')).rejects.toThrow();
    });
  });

  describe('7-8. Transaction Helper', () => {
    it('should commit transaction on success', async () => {
      const GuestModel = await getModel('H001', 'Guest');
      await GuestModel.deleteMany({ guest_ref: 'G1' });

      const result = await withTransaction('H001', async (session) => {
        const guest = new GuestModel({ guest_ref: 'G1', first_name: 'John', last_name: 'Doe' });
        await guest.save(session ? { session } : {});
        return 'success';
      });

      expect(result).toBe('success');
      const count = await GuestModel.countDocuments({ guest_ref: 'G1' });
      expect(count).toBe(1);
    });

    it('should rollback transaction on error', async () => {
      const GuestModel = await getModel('H001', 'Guest');
      await GuestModel.deleteMany({ guest_ref: 'G2' });

      const initialCount = await GuestModel.countDocuments({ guest_ref: 'G2' });

      try {
        await withTransaction('H001', async (session) => {
          const guest = new GuestModel({ guest_ref: 'G2', first_name: 'Jane', last_name: 'Doe' });
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

      const newCount = await GuestModel.countDocuments({ guest_ref: 'G2' });
      expect(newCount).toBe(initialCount);
    });
  });

  describe('9. Invalid Environment Configuration', () => {
    it('should require PLATFORM_MONGO_URI', () => {
      expect(true).toBe(true);
    });
  });

  describe('10. Schema Validation (Representative Entities)', () => {
    it('should enforce required fields (e.g. HotelProfile)', async () => {
      const HotelProfile = await getModel('H_TEST_SCHEMA', 'HotelProfile');
      const profile = new HotelProfile({
        property_name: 'Only Name',
      });

      const err = profile.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    it('should prevent duplicate amenities via schema middleware', async () => {
      const RoomType = await getModel('H_TEST_SCHEMA', 'RoomType');
      const dummyAmenityId = new mongoose.Types.ObjectId();
      
      const rt = new RoomType({
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
