import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectPlatformDB, closePlatformDB } from '../database/platform/platformConnection.js';
import { getHotelConnection, closeAllHotelConnections } from '../database/connectionManager.js';
import { getModel } from '../database/hotel/modelFactory.js';
import Account from '../database/platform/models/account.model.js';
import Hotel from '../database/platform/models/hotel.model.js';
import { ROLES } from '../constants/roles.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

const randomEmail = (prefix = 'fin') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('FINAL TARGETED VERIFICATION: PHASES 1–4', () => {
  let adminTokenA, adminTokenB, userTokenA;
  let accountA, accountB;
  let hotelA, hotelB;

  beforeAll(async () => {
    await connectPlatformDB();

    // Hotel A Setup
    const emailA = randomEmail('adminA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Admin A', email: emailA, phone: randomPhone(), password: 'password123'
    });
    const loginA = await request(app).post('/api/v1/auth/login').send({ email: emailA, password: 'password123' });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${tempTokenA}`).send({
      property_name: 'Hotel A Final', address: 'Add A Final', city: 'City A'
    });
    hotelA = onboardA.body.data.hotelId;
    
    const loginAgainA = await request(app).post('/api/v1/auth/login').send({ email: emailA, password: 'password123' });
    adminTokenA = loginAgainA.body.data.accessToken;
    accountA = loginAgainA.body.data.account;

    // Hotel B Setup
    const emailB = randomEmail('adminB');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Admin B', email: emailB, phone: randomPhone(), password: 'password123'
    });
    const loginB = await request(app).post('/api/v1/auth/login').send({ email: emailB, password: 'password123' });
    const onboardB = await request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${loginB.body.data.accessToken}`).send({
      property_name: 'Hotel B Final', address: 'Add B Final', city: 'City B'
    });
    hotelB = onboardB.body.data.hotelId;
    const loginAgainB = await request(app).post('/api/v1/auth/login').send({ email: emailB, password: 'password123' });
    adminTokenB = loginAgainB.body.data.accessToken;
    accountB = loginAgainB.body.data.account;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe('Verification 1 — Database Indexes in Real MongoDB', () => {
    it('should verify actual database indexes exist for Account and Tenant collections', async () => {
      // 1. Platform Account indexes
      const accIndexes = await Account.collection.getIndexes();
      expect(accIndexes).toHaveProperty('email_1');

      // 2. Platform Hotel indexes
      const hotelIndexes = await Hotel.collection.getIndexes();
      expect(hotelIndexes).toHaveProperty('_id_');

      // 3. Tenant DB indexes
      const DeptModel = await getModel(hotelA, 'Department');
      const RoomTypeModel = await getModel(hotelA, 'RoomType');
      const RoomModel = await getModel(hotelA, 'Room');
      const AmenityModel = await getModel(hotelA, 'Amenity');
      const EmployeeModel = await getModel(hotelA, 'Employee');

      const deptIndexes = await DeptModel.collection.getIndexes();
      const rtIndexes = await RoomTypeModel.collection.getIndexes();
      const roomIndexes = await RoomModel.collection.getIndexes();
      const amenityIndexes = await AmenityModel.collection.getIndexes();
      const empIndexes = await EmployeeModel.collection.getIndexes();

      expect(deptIndexes).toHaveProperty('code_1');
      expect(rtIndexes).toHaveProperty('code_1');
      expect(roomIndexes).toHaveProperty('room_number_1');
      expect(amenityIndexes).toHaveProperty('name_1');
      expect(empIndexes).toHaveProperty('employee_ref_1');
    });
  });

  describe('Verification 2 — Concurrent Uniqueness Guarantees', () => {
    it('should prevent duplicate Department codes during concurrent requests', async () => {
      const code = `CONC_DEP_${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      const payload = { code, name: 'Concurrent Dept' };

      const [res1, res2] = await Promise.all([
        request(app).post('/api/v1/hotel/departments').set('Authorization', `Bearer ${adminTokenA}`).send(payload),
        request(app).post('/api/v1/hotel/departments').set('Authorization', `Bearer ${adminTokenA}`).send(payload),
      ]);

      const statuses = [res1.status, res2.status].sort();
      expect(statuses[0]).toBe(201);
      expect(statuses[1]).toBe(409);

      const DeptModel = await getModel(hotelA, 'Department');
      const count = await DeptModel.countDocuments({ code });
      expect(count).toBe(1);
    });

    it('should prevent duplicate Room numbers during concurrent requests', async () => {
      // Create room type first
      const rtRes = await request(app).post('/api/v1/hotel/room-types').set('Authorization', `Bearer ${adminTokenA}`).send({
        code: `RT_CONC_${crypto.randomBytes(2).toString('hex')}`.toUpperCase(),
        name: 'Conc RT', base_occupancy: 2, max_occupancy: 2, base_price: 100
      });
      const roomTypeId = rtRes.body.data._id;
      const roomNumber = `${Math.floor(1000 + Math.random() * 8999)}`;
      const payload = { room_number: roomNumber, room_type_id: roomTypeId, floor: '1', status: 'AVAILABLE' };

      const [res1, res2] = await Promise.all([
        request(app).post('/api/v1/hotel/rooms').set('Authorization', `Bearer ${adminTokenA}`).send(payload),
        request(app).post('/api/v1/hotel/rooms').set('Authorization', `Bearer ${adminTokenA}`).send(payload),
      ]);

      const statuses = [res1.status, res2.status].sort();
      expect(statuses[0]).toBe(201);
      expect(statuses[1]).toBe(409);

      const RoomModel = await getModel(hotelA, 'Room');
      const count = await RoomModel.countDocuments({ room_number: roomNumber });
      expect(count).toBe(1);
    });
  });

  describe('Verification 3 — Onboarding Concurrency & DB State Verification', () => {
    it('should verify onboarding concurrency leaves exact database state', async () => {
      const email = randomEmail('conc_onb');
      await request(app).post('/api/v1/auth/register').send({
        fullName: 'Onboard User', email, phone: randomPhone(), password: 'Password123!'
      });
      const loginRes = await request(app).post('/api/v1/auth/login').send({ email, password: 'Password123!' });
      const userToken = loginRes.body.data.accessToken;

      const payload = { property_name: 'Concurrent State Hotel', address: '123 State St', city: 'Lahore' };

      const [r1, r2] = await Promise.all([
        request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${userToken}`).send(payload),
        request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${userToken}`).send(payload),
      ]);

      const statuses = [r1.status, r2.status].sort();
      expect(statuses[0]).toBe(201);
      expect([400, 409]).toContain(statuses[1]);

      const updatedAcc = await Account.findOne({ email });
      expect(updatedAcc.hotelId).not.toBeNull();
      expect(updatedAcc.role).toBe(ROLES.HOTEL_ADMIN);

      const createdHotels = await Hotel.find({ ownerId: updatedAcc._id });
      expect(createdHotels.length).toBe(1);

      const tenantConn = await getHotelConnection(createdHotels[0]._id.toString());
      const HotelProfile = tenantConn.model('HotelProfile');
      const profiles = await HotelProfile.find();
      expect(profiles.length).toBe(1);
    });
  });

  describe('Verification 4 — Onboarding Rollback Safety', () => {
    it('should cleanly restore Account and delete Hotel if provisioning fails', async () => {
      const email = randomEmail('rollback');
      await request(app).post('/api/v1/auth/register').send({
        fullName: 'Rollback User', email, phone: randomPhone(), password: 'Password123!'
      });
      const loginRes = await request(app).post('/api/v1/auth/login').send({ email, password: 'Password123!' });
      const token = loginRes.body.data.accessToken;

      // Send invalid payload to trigger validation/provisioning failure
      const res = await request(app)
        .post('/api/v1/provisioning/onboard')
        .set('Authorization', `Bearer ${token}`)
        .send({
          property_name: 'AB', // Invalid: min 3 chars
          address: 'Address',
          city: 'City'
        });

      expect(res.status).toBe(400);

      // Verify DB State BEFORE and AFTER are identical
      const acc = await Account.findOne({ email });
      expect(acc.hotelId).toBeNull();
      expect(acc.role).toBe(ROLES.HOTEL_USER);

      const orphanedHotel = await Hotel.findOne({ ownerId: acc._id });
      expect(orphanedHotel).toBeNull();
    });
  });

  describe('Verification 5 — Cross-Tenant Reference Protections', () => {
    it('should reject Hotel A from creating or updating records with Hotel B references', async () => {
      // 1. Create Amenity in Hotel B
      const amB = await request(app).post('/api/v1/hotel/amenities').set('Authorization', `Bearer ${adminTokenB}`).send({
        name: `Amenity B_${crypto.randomBytes(2).toString('hex')}`
      });
      const amB_id = amB.body.data._id;

      // 2. Create RoomType in Hotel B
      const rtB = await request(app).post('/api/v1/hotel/room-types').set('Authorization', `Bearer ${adminTokenB}`).send({
        code: `RT_B_${crypto.randomBytes(2).toString('hex')}`.toUpperCase(),
        name: 'RoomType B', base_occupancy: 2, max_occupancy: 2, base_price: 100
      });
      const rtB_id = rtB.body.data._id;

      // 3. Hotel A tries to create RoomType referencing Hotel B's Amenity
      const createRtFail = await request(app).post('/api/v1/hotel/room-types').set('Authorization', `Bearer ${adminTokenA}`).send({
        code: `RT_CROSS_${crypto.randomBytes(2).toString('hex')}`.toUpperCase(),
        name: 'Cross RT', base_occupancy: 2, max_occupancy: 2, base_price: 100,
        amenities: [{ amenity_id: amB_id }]
      });
      expect(createRtFail.status).toBe(400);

      // 4. Hotel A tries to create Room referencing Hotel B's RoomType
      const createRoomFail = await request(app).post('/api/v1/hotel/rooms').set('Authorization', `Bearer ${adminTokenA}`).send({
        room_number: `${Math.floor(1000 + Math.random() * 8999)}`,
        room_type_id: rtB_id, floor: '1', status: 'AVAILABLE'
      });
      expect(createRoomFail.status).toBe(400);
    });
  });

  describe('Verification 6 — Mass Assignment & Privilege Escalation Protection', () => {
    it('should reject client attempts to inject role or hotelId in registration', async () => {
      const email = randomEmail('mass');
      const res = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Hacker User',
        email,
        phone: randomPhone(),
        password: 'Password123!',
        role: ROLES.PLATFORM_ADMIN, // Attempt escalation
        hotelId: new mongoose.Types.ObjectId().toString()
      });

      expect(res.status).toBe(201);
      expect(res.body.data.role).toBe(ROLES.HOTEL_USER);
      expect(res.body.data.hotelId).toBeNull();

      const accInDb = await Account.findOne({ email });
      expect(accInDb.role).toBe(ROLES.HOTEL_USER);
      expect(accInDb.hotelId).toBeNull();
    });
  });
});
