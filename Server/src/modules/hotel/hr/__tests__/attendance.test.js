import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../../../app.js';
import { connectPlatformDB } from '../../../../database/platform/platformConnection.js';
import { closeAllHotelConnections } from '../../../../database/connectionManager.js';
import mongoose from 'mongoose';
import Account from '../../../../database/platform/models/account.model.js';
import { ROLES } from '../../../../constants/roles.js';
import crypto from 'crypto';

const randomEmail = (prefix = 'att') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('Phase 8 Step 5: Attendance Backend Integration & Integrity', () => {
  let adminTokenA, adminTokenB, userTokenA;
  let hotelA, hotelB;
  let deptA_id, deptB_id;
  let empA_id, empA_sec_id, empB_id;

  beforeAll(async () => {
    await connectPlatformDB();

    // Hotel A Setup
    const emailA = randomEmail('adminA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Admin Hotel A', email: emailA, phone: randomPhone(), password: 'password123', role: ROLES.HOTEL_USER
    });
    const loginA = await request(app).post('/api/v1/auth/login').send({ email: emailA, password: 'password123' });
    const onboardA = await request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${loginA.body.data.accessToken}`).send({
      property_name: 'Hotel Alpha', address: '123 Alpha St', city: 'Metropolis'
    });
    hotelA = onboardA.body.data.hotelId;
    const loginAgainA = await request(app).post('/api/v1/auth/login').send({ email: emailA, password: 'password123' });
    adminTokenA = loginAgainA.body.data.accessToken;

    // Hotel B Setup
    const emailB = randomEmail('adminB');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Admin Hotel B', email: emailB, phone: randomPhone(), password: 'password123', role: ROLES.HOTEL_USER
    });
    const loginB = await request(app).post('/api/v1/auth/login').send({ email: emailB, password: 'password123' });
    const onboardB = await request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${loginB.body.data.accessToken}`).send({
      property_name: 'Hotel Beta', address: '456 Beta St', city: 'Metropolis'
    });
    hotelB = onboardB.body.data.hotelId;
    const loginAgainB = await request(app).post('/api/v1/auth/login').send({ email: emailB, password: 'password123' });
    adminTokenB = loginAgainB.body.data.accessToken;

    // Standard User in Hotel A
    const emailUserA = randomEmail('userA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Staff User A', email: emailUserA, phone: randomPhone(), password: 'password123', role: ROLES.HOTEL_USER
    });
    await Account.findOneAndUpdate({ email: emailUserA }, { hotelId: hotelA, role: ROLES.HOTEL_USER });
    const loginUserA = await request(app).post('/api/v1/auth/login').send({ email: emailUserA, password: 'password123' });
    userTokenA = loginUserA.body.data.accessToken;

    // Create Departments in A & B
    const deptARes = await request(app).post('/api/v1/hotel/departments')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({ code: 'FD_A', name: 'Front Desk Alpha' });
    deptA_id = deptARes.body.data._id;

    const deptBRes = await request(app).post('/api/v1/hotel/departments')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({ code: 'FD_B', name: 'Front Desk Beta' });
    deptB_id = deptBRes.body.data._id;

    // Create Employees in A & B
    const empARes = await request(app).post('/api/v1/hotel/employees')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        employee_ref: 'EMP-001',
        first_name: 'Arthur',
        last_name: 'Dent',
        email: randomEmail('arthur'),
        phone: randomPhone(),
        job_title: 'Concierge Lead',
        department_id: deptA_id
      });
    empA_id = empARes.body.data._id;

    const empA2Res = await request(app).post('/api/v1/hotel/employees')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        employee_ref: 'EMP-002',
        first_name: 'Tricia',
        last_name: 'McMillan',
        email: randomEmail('tricia'),
        phone: randomPhone(),
        job_title: 'Front Desk Agent',
        department_id: deptA_id
      });
    empA_sec_id = empA2Res.body.data._id;

    const empBRes = await request(app).post('/api/v1/hotel/employees')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({
        employee_ref: 'EMP-B01',
        first_name: 'Ford',
        last_name: 'Prefect',
        email: randomEmail('ford'),
        phone: randomPhone(),
        job_title: 'Auditor',
        department_id: deptB_id
      });
    empB_id = empBRes.body.data._id;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await mongoose.disconnect();
  });

  describe('Authentication & Access Control', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/hotel/attendance');
      expect(res.status).toBe(401);
    });

    it('should allow authorized HOTEL_ADMIN to query attendance', async () => {
      const res = await request(app).get('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should allow authorized HOTEL_USER to query attendance', async () => {
      const res = await request(app).get('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${userTokenA}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Tenant Isolation & Employee Reference Integrity', () => {
    it('should reject nonexistent employee ID reference with 400', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: nonExistentId,
          date: '2026-10-07',
          status: 'PRESENT'
        });
      expect(res.status).toBe(400);
      const msg = res.body.message || res.body.error?.message;
      expect(msg).toMatch(/Referenced employee does not exist/i);
    });

    it('should prevent Hotel A from recording attendance for Hotel B employee (400)', async () => {
      const res = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empB_id, // Hotel B employee!
          date: '2026-10-07',
          status: 'PRESENT'
        });
      expect(res.status).toBe(400);
      const msg = res.body.message || res.body.error?.message;
      expect(msg).toMatch(/Referenced employee does not exist/i);
    });

    it('should prevent Hotel A from accessing Hotel B attendance record by ID (404)', async () => {
      // Hotel B creates attendance
      const createRes = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({
          employee_id: empB_id,
          date: '2026-10-07',
          status: 'PRESENT'
        });
      expect(createRes.status).toBe(201);
      const bAttendanceId = createRes.body.data._id;

      // Hotel A attempts read
      const res = await request(app).get(`/api/v1/hotel/attendance/${bAttendanceId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(res.status).toBe(404);
      const msg = res.body.message || res.body.error?.message;
      expect(msg).toMatch(/Attendance record not found/i);
    });

    it('should prevent Hotel A from modifying Hotel B attendance record (404)', async () => {
      const createRes = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({
          employee_id: empB_id,
          date: '2026-10-08',
          status: 'PRESENT'
        });
      const bAttendanceId = createRes.body.data._id;

      const res = await request(app).put(`/api/v1/hotel/attendance/${bAttendanceId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ status: 'ABSENT' });
      expect(res.status).toBe(404);
    });
  });

  describe('Duplicate Record Prevention (One Record per Employee per Day)', () => {
    it('should successfully record attendance for an employee on a date', async () => {
      const res = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          date: '2026-10-07',
          shift: 'Day Shift',
          status: 'PRESENT',
          clock_in_time: '2026-10-07T08:30:00.000Z',
          clock_out_time: '2026-10-07T17:30:00.000Z',
          break_time: '01:00'
        });
      expect(res.status).toBe(201);
      expect(res.body.data.employee_id._id).toBe(empA_id);
      expect(res.body.data.status).toBe('PRESENT');
      expect(res.body.data.total_hours).toBe('08:00');
    });

    it('should reject duplicate attendance for same employee on same date with 409', async () => {
      const res = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          date: '2026-10-07', // Same date as previous test!
          status: 'ABSENT'
        });
      expect(res.status).toBe(409);
      const msg = res.body.message || res.body.error?.message;
      expect(msg).toMatch(/Attendance already recorded for this employee on this date/i);
    });

    it('should allow different employee to have attendance on the same date', async () => {
      const res = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_sec_id,
          date: '2026-10-07',
          status: 'PRESENT'
        });
      expect(res.status).toBe(201);
      expect(res.body.data.employee_id._id).toBe(empA_sec_id);
    });
  });

  describe('Validation & Time Consistency', () => {
    it('should reject missing required fields with 400', async () => {
      const res = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          date: '2026-10-10'
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid status with 400', async () => {
      const res = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          date: '2026-10-10',
          status: 'UNKNOWN_STATUS'
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject clock_out_time earlier than clock_in_time with 400', async () => {
      const res = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          date: '2026-10-10',
          status: 'PRESENT',
          clock_in_time: '2026-10-10T18:00:00.000Z',
          clock_out_time: '2026-10-10T09:00:00.000Z'
        });
      expect(res.status).toBe(400);
      const msg = res.body.message || res.body.error?.message;
      expect(msg).toMatch(/Clock out time cannot be earlier than clock in time/i);
    });
  });

  describe('CRUD Operations & Filtering Capabilities', () => {
    let testAttendanceId;

    it('should create attendance with valid fields', async () => {
      const res = await request(app).post('/api/v1/hotel/attendance')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          date: '2026-10-11',
          shift: 'Night Shift',
          status: 'PRESENT',
          clock_in_time: '2026-10-11T20:00:00.000Z',
          clock_out_time: '2026-10-12T04:00:00.000Z',
          break_time: '01:00',
          notes: 'Worked night audit shift'
        });
      expect(res.status).toBe(201);
      expect(res.body.data.shift).toBe('Night Shift');
      expect(res.body.data.notes).toBe('Worked night audit shift');
      testAttendanceId = res.body.data._id;
    });

    it('should retrieve single attendance record by ID', async () => {
      const res = await request(app).get(`/api/v1/hotel/attendance/${testAttendanceId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(testAttendanceId);
      expect(res.body.data.employee_id.first_name).toBe('Arthur');
    });

    it('should update attendance status and notes', async () => {
      const res = await request(app).put(`/api/v1/hotel/attendance/${testAttendanceId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          status: 'HALF_DAY',
          notes: 'Left early due to medical emergency'
        });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('HALF_DAY');
      expect(res.body.data.notes).toBe('Left early due to medical emergency');
    });

    it('should filter attendance by date for Today Attendance screen', async () => {
      const res = await request(app).get('/api/v1/hotel/attendance?date=2026-10-07')
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2); // empA_id and empA_sec_id from earlier tests
    });

    it('should filter attendance by date range for Attendance Sheet', async () => {
      const res = await request(app).get('/api/v1/hotel/attendance?start_date=2026-10-01&end_date=2026-10-31')
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter attendance by employee_id', async () => {
      const res = await request(app).get(`/api/v1/hotel/attendance?employee_id=${empA_id}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.every(r => r.employee_id._id === empA_id)).toBe(true);
    });

    it('should search attendance by employee name', async () => {
      const res = await request(app).get('/api/v1/hotel/attendance?search=Arthur')
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.some(r => r.employee_id.first_name === 'Arthur')).toBe(true);
    });

    it('should delete attendance record', async () => {
      const res = await request(app).delete(`/api/v1/hotel/attendance/${testAttendanceId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(res.status).toBe(200);

      const verifyRes = await request(app).get(`/api/v1/hotel/attendance/${testAttendanceId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(verifyRes.status).toBe(404);
    });
  });
});
