import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../../../app.js';
import { connectPlatformDB } from '../../../../database/platform/platformConnection.js';
import { closeAllHotelConnections } from '../../../../database/connectionManager.js';
import { getModel } from '../../../../database/hotel/modelFactory.js';
import mongoose from 'mongoose';
import Account from '../../../../database/platform/models/account.model.js';
import Hotel from '../../../../database/platform/models/hotel.model.js';
import { ROLES } from '../../../../constants/roles.js';
import crypto from 'crypto';

const randomEmail = (prefix = 'rms') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('Phase 4: Room Management (Amenities, Room Types, Rooms)', () => {
  let adminTokenA, adminTokenB, userTokenA;
  let hotelA, hotelB;
  let amenityA_id, amenityB_id;
  let roomTypeA_id, roomTypeB_id;

  beforeAll(async () => {
    await connectPlatformDB();

    // Hotel A Setup
    const emailA = randomEmail('adminA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Admin A', email: emailA, phone: randomPhone(), password: 'password123', role: ROLES.HOTEL_USER
    });
    const loginA = await request(app).post('/api/v1/auth/login').send({ email: emailA, password: 'password123' });
    const onboardA = await request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${loginA.body.data.accessToken}`).send({
      property_name: 'Hotel A', address: 'Add A', city: 'City A'
    });
    hotelA = onboardA.body.data.hotelId;
    const loginAgainA = await request(app).post('/api/v1/auth/login').send({ email: emailA, password: 'password123' });
    adminTokenA = loginAgainA.body.data.accessToken;

    // Hotel B Setup
    const emailB = randomEmail('adminB');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Admin B', email: emailB, phone: randomPhone(), password: 'password123', role: ROLES.HOTEL_USER
    });
    const loginB = await request(app).post('/api/v1/auth/login').send({ email: emailB, password: 'password123' });
    const onboardB = await request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${loginB.body.data.accessToken}`).send({
      property_name: 'Hotel B', address: 'Add B', city: 'City B'
    });
    hotelB = onboardB.body.data.hotelId;
    const loginAgainB = await request(app).post('/api/v1/auth/login').send({ email: emailB, password: 'password123' });
    adminTokenB = loginAgainB.body.data.accessToken;

    // Standard User A
    const emailUserA = randomEmail('userA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'User A', email: emailUserA, phone: randomPhone(), password: 'password123', role: ROLES.HOTEL_USER
    });
    await Account.findOneAndUpdate({ email: emailUserA }, { hotelId: hotelA, role: ROLES.HOTEL_USER });
    const loginUserA = await request(app).post('/api/v1/auth/login').send({ email: emailUserA, password: 'password123' });
    userTokenA = loginUserA.body.data.accessToken;

    // Amenity A
    const resAmA = await request(app).post('/api/v1/hotel/amenities')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({ name: `Wi-Fi A_${crypto.randomBytes(2).toString('hex')}` });
    amenityA_id = resAmA.body.data._id;

    // Amenity B
    const resAmB = await request(app).post('/api/v1/hotel/amenities')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({ name: `Wi-Fi B_${crypto.randomBytes(2).toString('hex')}` });
    amenityB_id = resAmB.body.data._id;

    // RoomType A
    const resRtA = await request(app).post('/api/v1/hotel/room-types')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        code: `DLX_${crypto.randomBytes(2).toString('hex')}`.toUpperCase(), name: 'Deluxe A', base_occupancy: 2, max_occupancy: 4, base_price: 100,
        amenities: [{ amenity_id: amenityA_id }]
      });
    roomTypeA_id = resRtA.body.data._id;

    // RoomType B
    const resRtB = await request(app).post('/api/v1/hotel/room-types')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({
        code: `DLX_${crypto.randomBytes(2).toString('hex')}`.toUpperCase(), name: 'Deluxe B', base_occupancy: 2, max_occupancy: 4, base_price: 100,
        amenities: [{ amenity_id: amenityB_id }]
      });
    roomTypeB_id = resRtB.body.data._id;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await mongoose.connection.close();
  });

  describe('Amenities', () => {
    it('should create an amenity', async () => {
      const name = `Pool_${crypto.randomBytes(2).toString('hex')}`;
      const res = await request(app)
        .post('/api/v1/hotel/amenities')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          name,
          category: 'Property'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe(name);
    });

    it('should prevent duplicate amenity names in same hotel', async () => {
      const name = `Gym_${crypto.randomBytes(2).toString('hex')}`;
      await request(app).post('/api/v1/hotel/amenities')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ name });

      const res = await request(app).post('/api/v1/hotel/amenities')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ name });

      expect(res.status).toBe(409);
    });
  });

  describe('Room Types', () => {
    it('should create a room type', async () => {
      const code = `STD_${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      const res = await request(app)
        .post('/api/v1/hotel/room-types')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          code,
          name: 'Standard Room',
          base_occupancy: 2,
          max_occupancy: 4,
          base_price: 15000,
          amenities: [
            { amenity_id: amenityA_id, is_featured: true }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.data.code).toBe(code);
    });

    it('should prevent duplicate room type codes in same hotel', async () => {
      const code = `DUP_${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      await request(app).post('/api/v1/hotel/room-types')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          code, name: 'Deluxe', base_occupancy: 2, max_occupancy: 4, base_price: 100
        });

      const res = await request(app).post('/api/v1/hotel/room-types')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          code, name: 'Deluxe 2', base_occupancy: 2, max_occupancy: 4, base_price: 200
        });

      expect(res.status).toBe(409);
    });
    
    it('should prevent duplicate amenities in room type', async () => {
      const code = `DUAM_${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      const res = await request(app).post('/api/v1/hotel/room-types')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          code, name: 'Superior', base_occupancy: 2, max_occupancy: 2, base_price: 100,
          amenities: [
            { amenity_id: amenityA_id },
            { amenity_id: amenityA_id }
          ]
        });

      expect(res.status).not.toBe(201); 
    });

    it('should prevent cross-tenant amenity reference (Hotel A using Hotel B amenity)', async () => {
      const code = `XAM_${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      const res = await request(app).post('/api/v1/hotel/room-types')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          code, name: 'Cross Tenant RT', base_occupancy: 2, max_occupancy: 2, base_price: 100,
          amenities: [{ amenity_id: amenityB_id }]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Rooms', () => {
    it('should create a room', async () => {
      const roomNum = `${Math.floor(100 + Math.random() * 899)}`;
      const res = await request(app)
        .post('/api/v1/hotel/rooms')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          room_number: roomNum,
          room_type_id: roomTypeA_id,
          floor: '1',
          status: 'AVAILABLE'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.room_number).toBe(roomNum);
    });

    it('should prevent duplicate room numbers in same hotel', async () => {
      const roomNum = `${Math.floor(100 + Math.random() * 899)}`;
      await request(app).post('/api/v1/hotel/rooms')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ room_number: roomNum, room_type_id: roomTypeA_id, floor: '1' });

      const res = await request(app).post('/api/v1/hotel/rooms')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ room_number: roomNum, room_type_id: roomTypeA_id, floor: '1' });

      expect(res.status).toBe(409);
    });

    it('should allow same room number in different hotels (tenant isolation)', async () => {
      const roomNum = `${Math.floor(100 + Math.random() * 899)}`;
      await request(app).post('/api/v1/hotel/rooms')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ room_number: roomNum, room_type_id: roomTypeA_id, floor: '1' });

      const res = await request(app).post('/api/v1/hotel/rooms')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({ room_number: roomNum, room_type_id: roomTypeB_id, floor: '1' });

      expect(res.status).toBe(201);
    });

    it('should prevent cross-tenant room_type_id reference (Hotel A using Hotel B room type)', async () => {
      const roomNum = `${Math.floor(100 + Math.random() * 899)}`;
      const res = await request(app).post('/api/v1/hotel/rooms')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ room_number: roomNum, room_type_id: roomTypeB_id, floor: '1' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should allow standard users to update room status (e.g. housekeeping)', async () => {
      const roomNum = `${Math.floor(100 + Math.random() * 899)}`;
      const roomRes = await request(app).post('/api/v1/hotel/rooms')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ room_number: roomNum, room_type_id: roomTypeA_id, floor: '1', status: 'AVAILABLE', housekeeping_status: 'CLEAN' });

      const updateRes = await request(app).put(`/api/v1/hotel/rooms/${roomRes.body.data._id}`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ housekeeping_status: 'DIRTY' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.housekeeping_status).toBe('DIRTY');
    });
  });
});
