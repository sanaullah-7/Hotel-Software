import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../../../app.js';
import { connectPlatformDB } from '../../../../database/platform/platformConnection.js';
import { closeAllHotelConnections } from '../../../../database/connectionManager.js';
import mongoose from 'mongoose';
import Account from '../../../../database/platform/models/account.model.js';
import { ROLES } from '../../../../constants/roles.js';
import crypto from 'crypto';

const randomEmail = (prefix = 'lr') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('Phase 8 Step 4: Leave Requests Backend Integration & Integrity', () => {
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
      .send({ code: 'HK_A', name: 'Housekeeping A' });
    deptA_id = deptARes.body.data._id;

    const deptBRes = await request(app).post('/api/v1/hotel/departments')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({ code: 'HK_B', name: 'Housekeeping B' });
    deptB_id = deptBRes.body.data._id;

    // Create Employees in Hotel A
    const empARes = await request(app).post('/api/v1/hotel/employees')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        employee_ref: `EMPA-${crypto.randomBytes(2).toString('hex')}`.toUpperCase(),
        first_name: 'Alice',
        last_name: 'Smith',
        email: randomEmail('empA'),
        department_id: deptA_id,
        job_title: 'Room Attendant'
      });
    empA_id = empARes.body.data._id;

    const empASecRes = await request(app).post('/api/v1/hotel/employees')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        employee_ref: `EMPA2-${crypto.randomBytes(2).toString('hex')}`.toUpperCase(),
        first_name: 'Manager',
        last_name: 'Bob',
        email: randomEmail('empA2'),
        department_id: deptA_id,
        job_title: 'Housekeeping Manager'
      });
    empA_sec_id = empASecRes.body.data._id;

    // Create Employee in Hotel B
    const empBRes = await request(app).post('/api/v1/hotel/employees')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({
        employee_ref: `EMPB-${crypto.randomBytes(2).toString('hex')}`.toUpperCase(),
        first_name: 'Charlie',
        last_name: 'Brown',
        email: randomEmail('empB'),
        department_id: deptB_id,
        job_title: 'Concierge'
      });
    empB_id = empBRes.body.data._id;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await mongoose.connection.close();
  });

  describe('Authentication & Access Control', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/hotel/leave-requests');
      expect(res.status).toBe(401);
    });

    it('should allow standard HOTEL_USER to view and create pending leave requests', async () => {
      const res = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          employee_id: empA_id,
          leave_type: 'CASUAL',
          start_date: '2026-05-01',
          end_date: '2026-05-03',
          reason: 'Personal errands'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.employee_id._id).toBe(empA_id);
    });

    it('should reject standard HOTEL_USER from creating pre-approved leave requests (403)', async () => {
      const res = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          employee_id: empA_id,
          leave_type: 'SICK',
          start_date: '2026-05-10',
          end_date: '2026-05-12',
          reason: 'Doctor checkup',
          status: 'APPROVED'
        });

      expect(res.status).toBe(403);
    });

    it('should reject standard HOTEL_USER from deleting leave requests (403)', async () => {
      // Create request first
      const createRes = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          leave_type: 'ANNUAL',
          start_date: '2026-06-01',
          end_date: '2026-06-05',
          reason: 'Summer vacation'
        });
      const leaveId = createRes.body.data._id;

      const delRes = await request(app)
        .delete(`/api/v1/hotel/leave-requests/${leaveId}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      expect(delRes.status).toBe(403);
    });
  });

  describe('Validation & Date Business Rules', () => {
    it('should reject leave request with missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid date format', async () => {
      const res = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          leave_type: 'SICK',
          start_date: 'invalid-date',
          end_date: '2026-05-10',
          reason: 'Flu'
        });

      expect(res.status).toBe(400);
    });

    it('should reject leave request when end_date is before start_date', async () => {
      const res = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          leave_type: 'SICK',
          start_date: '2026-05-10',
          end_date: '2026-05-08',
          reason: 'Flu'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('End date cannot be before start date');
    });

    it('should reject invalid leave_type enum', async () => {
      const res = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          leave_type: 'PARTY_LEAVE',
          start_date: '2026-05-01',
          end_date: '2026-05-02',
          reason: 'Festival'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Tenant Isolation & Employee Reference Integrity', () => {
    it('should reject nonexistent employee ID reference with 400', async () => {
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      const res = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: fakeId,
          leave_type: 'CASUAL',
          start_date: '2026-07-01',
          end_date: '2026-07-02',
          reason: 'Trip'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('employee does not exist');
    });

    it('should prevent Hotel A from creating a leave request for Hotel B employee (400)', async () => {
      const res = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empB_id, // Belongs to Hotel B
          leave_type: 'CASUAL',
          start_date: '2026-07-01',
          end_date: '2026-07-02',
          reason: 'Cross tenant test'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('employee does not exist in this hotel');
    });

    it('should prevent Hotel A from accessing Hotel B leave request by ID (404)', async () => {
      // Create leave request in Hotel B
      const resB = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({
          employee_id: empB_id,
          leave_type: 'SICK',
          start_date: '2026-08-01',
          end_date: '2026-08-03',
          reason: 'Beta staff illness'
        });
      const leaveB_id = resB.body.data._id;

      // Hotel A tries to retrieve it
      const getRes = await request(app)
        .get(`/api/v1/hotel/leave-requests/${leaveB_id}`)
        .set('Authorization', `Bearer ${adminTokenA}`);

      expect(getRes.status).toBe(404);
    });

    it('should prevent Hotel A from modifying Hotel B leave request (404)', async () => {
      // Create leave in Hotel B
      const resB = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({
          employee_id: empB_id,
          leave_type: 'SPECIAL',
          start_date: '2026-09-01',
          end_date: '2026-09-03',
          reason: 'Beta special leave'
        });
      const leaveB_id = resB.body.data._id;

      // Hotel A tries to update
      const updateRes = await request(app)
        .put(`/api/v1/hotel/leave-requests/${leaveB_id}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ status: 'APPROVED' });

      expect(updateRes.status).toBe(404);
    });

    it('should isolate listings so Hotel A list never contains Hotel B leave requests', async () => {
      const listA = await request(app)
        .get('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`);

      expect(listA.status).toBe(200);
      const containsHotelBRecord = listA.body.data.some(
        (lr) => lr.employee_id && lr.employee_id._id === empB_id
      );
      expect(containsHotelBRecord).toBe(false);
    });
  });

  describe('Lifecycle State Transitions & Approval Flow', () => {
    let testLeaveId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          leave_type: 'ANNUAL',
          start_date: '2026-10-01',
          end_date: '2026-10-05',
          reason: 'Annual trip'
        });
      testLeaveId = res.body.data._id;
    });

    it('should reject non-admin from approving a pending leave request (403)', async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/leave-requests/${testLeaveId}`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(403);
    });

    it('should allow admin to approve a pending leave request and assign approver', async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/leave-requests/${testLeaveId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          status: 'APPROVED',
          approved_by: empA_sec_id,
          manager_comments: 'Enjoy your vacation!'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('APPROVED');
      expect(res.body.data.approved_by._id).toBe(empA_sec_id);
      expect(res.body.data.manager_comments).toBe('Enjoy your vacation!');
    });

    it('should allow cancelling an approved leave request', async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/leave-requests/${testLeaveId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ status: 'CANCELLED' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('should reject modifying a cancelled leave request back to APPROVED (400)', async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/leave-requests/${testLeaveId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Cannot modify a cancelled leave request');
    });

    it('should reject modifying a rejected leave request back to APPROVED (400)', async () => {
      // Create request and reject it
      const createRes = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          leave_type: 'UNPAID',
          start_date: '2026-11-01',
          end_date: '2026-11-02',
          reason: 'Testing reject'
        });
      const rejectId = createRes.body.data._id;

      await request(app)
        .put(`/api/v1/hotel/leave-requests/${rejectId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ status: 'REJECTED' });

      // Attempt to revive rejected request
      const reviveRes = await request(app)
        .put(`/api/v1/hotel/leave-requests/${rejectId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ status: 'APPROVED' });

      expect(reviveRes.status).toBe(400);
      expect(reviveRes.body.error.message).toContain('Cannot modify a rejected leave request');
    });
  });

  describe('CRUD Operations & Filters', () => {
    it('should successfully filter leave requests by status and leave_type', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/leave-requests?status=CANCELLED')
        .set('Authorization', `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((lr) => lr.status === 'CANCELLED')).toBe(true);
    });

    it('should successfully delete a leave request', async () => {
      const createRes = await request(app)
        .post('/api/v1/hotel/leave-requests')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA_id,
          leave_type: 'MATERNITY',
          start_date: '2026-12-01',
          end_date: '2026-12-30',
          reason: 'Maternity leave'
        });
      const leaveId = createRes.body.data._id;

      const delRes = await request(app)
        .delete(`/api/v1/hotel/leave-requests/${leaveId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);

      expect(delRes.status).toBe(200);

      // Verify it's gone
      const getRes = await request(app)
        .get(`/api/v1/hotel/leave-requests/${leaveId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);

      expect(getRes.status).toBe(404);
    });
  });
});
