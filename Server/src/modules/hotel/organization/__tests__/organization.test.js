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

const randomEmail = (prefix = 'org') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('Phase 3: Organization Management (Departments & Employees)', () => {
  let adminTokenA, adminTokenB, userTokenA;
  let hotelA, hotelB;
  let deptA_id, deptB_id;

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

    // Create base department in Hotel A
    const deptARes = await request(app).post('/api/v1/hotel/departments')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({ code: 'HK', name: 'Housekeeping A' });
    deptA_id = deptARes.body.data._id;

    // Create base department in Hotel B
    const deptBRes = await request(app).post('/api/v1/hotel/departments')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({ code: 'HK', name: 'Housekeeping B' });
    deptB_id = deptBRes.body.data._id;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await mongoose.connection.close();
  });

  describe('Departments', () => {
    it('should create a department', async () => {
      const code = `FD_${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      const res = await request(app)
        .post('/api/v1/hotel/departments')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          code,
          name: 'Front Desk'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.data.code).toBe(code);
    });

    it('should prevent duplicate department codes in same hotel', async () => {
      const code = `DUP_${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      await request(app).post('/api/v1/hotel/departments')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ code, name: 'Housekeeping' });

      const res = await request(app).post('/api/v1/hotel/departments')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ code, name: 'Housekeeping 2' });

      expect(res.status).toBe(409);
    });

    it('should allow same department codes in different hotels (tenant isolation)', async () => {
      const code = `ISO_${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      await request(app).post('/api/v1/hotel/departments')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ code, name: 'Housekeeping A' });

      const resB = await request(app).post('/api/v1/hotel/departments')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({ code, name: 'Housekeeping B' });

      expect(resB.status).toBe(201);
    });

    it('should reject standard users from creating departments', async () => {
      const res = await request(app).post('/api/v1/hotel/departments')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ code: 'REJ', name: 'Front Desk' });

      expect(res.status).toBe(403);
    });
  });

  describe('Employees', () => {
    it('should create an employee', async () => {
      const empRef = `EMP-${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      const email = randomEmail('emp1');
      const res = await request(app)
        .post('/api/v1/hotel/employees')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_ref: empRef,
          first_name: 'John',
          last_name: 'Doe',
          email,
          phone: randomPhone(),
          department_id: deptA_id,
          job_title: 'Maid',
          status: 'ACTIVE'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.employee_ref).toBe(empRef);
    });

    it('should prevent duplicate employee_ref in same hotel', async () => {
      const empRef = `DUP-${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      await request(app).post('/api/v1/hotel/employees')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_ref: empRef, first_name: 'John', last_name: 'Doe',
          email: randomEmail('emp_dup1'), department_id: deptA_id, job_title: 'Maid'
        });

      const res = await request(app).post('/api/v1/hotel/employees')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_ref: empRef, first_name: 'Jane', last_name: 'Smith',
          email: randomEmail('emp_dup2'), department_id: deptA_id, job_title: 'Cleaner'
        });

      expect(res.status).toBe(409);
    });
    
    it('should validate invalid department_id references', async () => {
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      const res = await request(app).post('/api/v1/hotel/employees')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_ref: `FAIL-${crypto.randomBytes(2).toString('hex')}`, first_name: 'John', last_name: 'Doe',
          email: randomEmail('emp_fail'), department_id: fakeId, job_title: 'Maid'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('department does not exist');
    });

    it('should prevent cross-tenant department reference (Hotel A using Hotel B department)', async () => {
      const res = await request(app).post('/api/v1/hotel/employees')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_ref: `XREF-${crypto.randomBytes(2).toString('hex')}`, first_name: 'Cross', last_name: 'Tenant',
          email: randomEmail('emp_xref'), department_id: deptB_id, job_title: 'Spy'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
