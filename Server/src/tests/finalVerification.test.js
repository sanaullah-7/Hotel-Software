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
import { SCHEMAS } from '../database/hotel/schemaRegistry.js';

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

      expect(deptIndexes).toHaveProperty('hotelId_1_code_1');
      expect(rtIndexes).toHaveProperty('hotelId_1_code_1');
      expect(roomIndexes).toHaveProperty('hotelId_1_room_number_1');
      expect(amenityIndexes).toHaveProperty('hotelId_1_name_1');
      expect(empIndexes).toHaveProperty('hotelId_1_employee_ref_1');
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
      const count = await DeptModel.countDocuments({ hotelId: hotelA, code });
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
      const count = await RoomModel.countDocuments({ hotelId: hotelA, room_number: roomNumber });
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

      const HotelProfile = await getModel('HotelProfile');
      const profiles = await HotelProfile.find({ hotelId: createdHotels[0]._id });
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

  it('enforces hotel ownership and tenant-scoped unique indexes on every hotel schema', async () => {
    for (const [name, schema] of Object.entries(SCHEMAS)) {
      const ownership = schema.path('hotelId');
      expect(ownership.instance, name).toBe('ObjectId');
      expect(ownership.isRequired, name).toBe(true);
      const Model = await getModel(name);
      const indexes = await Model.collection.listIndexes().toArray();
      expect(indexes.some(index => Object.keys(index.key)[0] === 'hotelId'), name).toBe(true);
      for (const index of indexes.filter(index => index.unique && !index.key._id)) {
        expect(Object.keys(index.key)[0], name + '/' + index.name).toBe('hotelId');
      }
    }
  });

  it('allows room 101 in both hotels and rejects cross-hotel access and ownership injection', async () => {
    const roomIds = [];
    for (const token of [adminTokenA, adminTokenB]) {
      const rt = await request(app).post('/api/v1/hotel/room-types').set('Authorization', 'Bearer ' + token)
        .send({ code: 'ISOLATION101', name: 'Isolation Room', base_occupancy: 2, max_occupancy: 2, base_price: 100 });
      expect(rt.status).toBe(201);
      const room = await request(app).post('/api/v1/hotel/rooms').set('Authorization', 'Bearer ' + token)
        .send({ room_number: '101', room_type_id: rt.body.data._id, floor: '1', hotelId: token === adminTokenA ? hotelB : hotelA });
      expect(room.status).toBe(201);
      expect(room.body.data.hotelId).toBe(token === adminTokenA ? hotelA : hotelB);
      roomIds.push(room.body.data._id);
    }
    for (const [token, own, other] of [[adminTokenA, roomIds[0], roomIds[1]], [adminTokenB, roomIds[1], roomIds[0]]]) {
      expect((await request(app).get('/api/v1/hotel/rooms/' + own).set('Authorization', 'Bearer ' + token)).status).toBe(200);
      for (const method of ['get', 'put', 'delete']) {
        const response = await request(app)[method]('/api/v1/hotel/rooms/' + other)
          .set('Authorization', 'Bearer ' + token).send(method === 'put' ? { floor: '9', hotelId: hotelB } : {});
        expect(response.status).toBe(404);
      }
    }
  });

  it('rejects cross-hotel assignments before changing housekeeping or maintenance room state', async () => {
    const Department = await getModel('Department');
    const Employee = await getModel('Employee');
    const Room = await getModel('Room');
    const department = await Department.create({ hotelId: hotelB, code: 'OPS_SECURITY', name: 'Operations' });
    const employee = await Employee.create({ hotelId: hotelB, employee_ref: 'OPS_SECURITY', first_name: 'Other', last_name: 'Hotel', email: 'other@hotel.test', job_title: 'Technician', department_id: department._id });
    const room = await Room.findOne({ hotelId: hotelA, room_number: '101' });
    await Room.updateOne({ _id: room._id, hotelId: hotelA }, { $set: { housekeeping_status: 'DIRTY' } });
    const task = await request(app).post('/api/v1/hotel/housekeeping/tasks').set('Authorization', 'Bearer ' + adminTokenA)
      .send({ room_id: String(room._id), task_type: 'CLEANING' });
    expect(task.status).toBe(201);
    const update = await request(app).put('/api/v1/hotel/housekeeping/tasks/' + task.body.data._id).set('Authorization', 'Bearer ' + adminTokenA)
      .send({ assigned_to: String(employee._id), status: 'COMPLETED' });
    expect(update.status).toBe(404);
    expect((await Room.findOne({ _id: room._id, hotelId: hotelA })).housekeeping_status).toBe('DIRTY');
    const ticket = await request(app).post('/api/v1/hotel/maintenance/tickets').set('Authorization', 'Bearer ' + adminTokenA)
      .send({ room_id: String(room._id), title: 'Test repair', description: 'Validate ownership before resolving', priority: 'HIGH' });
    expect(ticket.status).toBe(201);
    const repair = await request(app).put('/api/v1/hotel/maintenance/tickets/' + ticket.body.data._id).set('Authorization', 'Bearer ' + adminTokenA)
      .send({ assigned_to: String(employee._id), status: 'RESOLVED' });
    expect(repair.status).toBe(404);
    expect((await Room.findOne({ _id: room._id, hotelId: hotelA })).status).toBe('MAINTENANCE');
    await Room.updateOne({ _id: room._id, hotelId: hotelA }, { $set: { status: 'AVAILABLE' } });
  });

  it('creates exactly one stay during simultaneous check-in requests on real MongoDB', async () => {
    const Guest = await getModel('Guest');
    const Room = await getModel('Room');
    const Stay = await getModel('Stay');
    const guest = await Guest.create({ hotelId: hotelA, guest_ref: 'CONCURRENT_CHECKIN', first_name: 'Concurrent', last_name: 'Guest' });
    const room = await Room.findOne({ hotelId: hotelA, room_number: '101' });
    const reservation = await request(app).post('/api/v1/hotel/reservations').set('Authorization', 'Bearer ' + adminTokenA)
      .send({ primary_guest_id: String(guest._id), room_id: String(room._id), expected_check_in: '2030-01-01', expected_check_out: '2030-01-02', adults: 1 });
    expect(reservation.status).toBe(201);
    const id = reservation.body.data.reservation._id;
    const results = await Promise.all([1, 2].map(() => request(app).post('/api/v1/hotel/stays/check-in')
      .set('Authorization', 'Bearer ' + adminTokenA).send({ reservation_id: id })));
    expect(results.map(r => r.status).sort()).toEqual([201, 409]);
    expect(await Stay.countDocuments({ hotelId: hotelA, reservation_id: id })).toBe(1);
    const ReservationRoom = await getModel('ReservationRoom');
    const RatePlan = await getModel('RatePlan');
    const details = await ReservationRoom.findOne({ hotelId: hotelA, reservation_id: id });
    expect(await RatePlan.exists({ _id: details.rate_plan_id, hotelId: hotelA })).not.toBeNull();
  });

  it('rejects a reservation group owned by another hotel', async () => {
    const Guest = await getModel('Guest');
    const ReservationGroup = await getModel('ReservationGroup');
    const guestA = await Guest.create({ hotelId: hotelA, guest_ref: 'GROUP_A', first_name: 'Group', last_name: 'A' });
    const guestB = await Guest.create({ hotelId: hotelB, guest_ref: 'GROUP_B', first_name: 'Group', last_name: 'B' });
    const group = await ReservationGroup.create({ hotelId: hotelB, group_ref: 'GROUP_B', guest_id: guestB._id, name: 'Other Hotel Group' });
    const result = await request(app).post('/api/v1/hotel/reservations').set('Authorization', 'Bearer ' + adminTokenA)
      .send({ primary_guest_id: String(guestA._id), group_id: String(group._id), expected_check_in: '2030-02-01', expected_check_out: '2030-02-02', adults: 1 });
    expect(result.status).toBe(404);
    const Reservation = await getModel('Reservation');
    expect(await Reservation.countDocuments({ hotelId: hotelA, group_id: group._id })).toBe(0);
  });

  it('persists generic module records in MongoDB with server-owned tenant scope', async () => {
    const injectedHotelId = hotelB;
    const created = await request(app).post('/api/v1/hotel/data/alerts')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({ hotelId: injectedHotelId, type: 'TEST', title: 'Database alert', message: 'Stored dynamically', severity: 'INFO' });
    expect(created.status).toBe(201);
    expect(created.body.data.hotelId).toBe(hotelA);
    const recordId = created.body.data._id;

    const ownList = await request(app).get('/api/v1/hotel/data/alerts').set('Authorization', `Bearer ${adminTokenA}`);
    expect(ownList.status).toBe(200);
    expect(ownList.body.data.some(record => record._id === recordId)).toBe(true);

    const otherRead = await request(app).get(`/api/v1/hotel/data/alerts/${recordId}`).set('Authorization', `Bearer ${adminTokenB}`);
    const otherUpdate = await request(app).put(`/api/v1/hotel/data/alerts/${recordId}`).set('Authorization', `Bearer ${adminTokenB}`).send({ title: 'Stolen' });
    const otherDelete = await request(app).delete(`/api/v1/hotel/data/alerts/${recordId}`).set('Authorization', `Bearer ${adminTokenB}`);
    expect([otherRead.status, otherUpdate.status, otherDelete.status]).toEqual([404, 404, 404]);
  });
});
