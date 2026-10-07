import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../../../app.js';
import { connectPlatformDB } from '../../../../database/platform/platformConnection.js';
import { closeAllHotelConnections } from '../../../../database/connectionManager.js';
import mongoose from 'mongoose';
import Account from '../../../../database/platform/models/account.model.js';
import { ROLES } from '../../../../constants/roles.js';
import crypto from 'crypto';

const randomEmail = (prefix = 'pay') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('Phase 8 Step 6: Employee Salary & Payroll Backend Integration & Integrity', () => {
  let adminTokenA, adminTokenB, userTokenA;
  let hotelA, hotelB;
  let deptA_id, deptB_id;
  let empA1_id, empA2_id, empB_id;

  beforeAll(async () => {
    await connectPlatformDB();

    // Hotel A Setup
    const emailA = randomEmail('adminA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Admin Hotel A', email: emailA, phone: randomPhone(), password: 'password123', role: ROLES.HOTEL_USER
    });
    const loginA = await request(app).post('/api/v1/auth/login').send({ email: emailA, password: 'password123' });
    const onboardA = await request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${loginA.body.data.accessToken}`).send({
      property_name: 'Hotel Alpha Payroll', address: '100 Payroll Ave', city: 'Metropolis'
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
      property_name: 'Hotel Beta Payroll', address: '200 Beta Ave', city: 'Metropolis'
    });
    hotelB = onboardB.body.data.hotelId;
    const loginAgainB = await request(app).post('/api/v1/auth/login').send({ email: emailB, password: 'password123' });
    adminTokenB = loginAgainB.body.data.accessToken;

    // Standard User in Hotel A (non-admin)
    const emailUserA = randomEmail('userA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Staff User A', email: emailUserA, phone: randomPhone(), password: 'password123', role: ROLES.HOTEL_USER
    });
    await Account.findOneAndUpdate({ email: emailUserA }, { hotelId: hotelA, role: ROLES.HOTEL_USER });
    const loginUserA = await request(app).post('/api/v1/auth/login').send({ email: emailUserA, password: 'password123' });
    userTokenA = loginUserA.body.data.accessToken;

    // Create Departments
    const deptARes = await request(app).post('/api/v1/hotel/departments')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({ code: 'HR_A', name: 'Human Resources Alpha' });
    deptA_id = deptARes.body.data._id;

    const deptBRes = await request(app).post('/api/v1/hotel/departments')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({ code: 'HR_B', name: 'Human Resources Beta' });
    deptB_id = deptBRes.body.data._id;

    // Create Employees in Hotel A with salaries
    const empA1Res = await request(app).post('/api/v1/hotel/employees')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        employee_ref: 'EMP-PAY-01',
        first_name: 'John',
        last_name: 'Doe',
        email: randomEmail('john'),
        phone: randomPhone(),
        job_title: 'Manager',
        department_id: deptA_id,
        salary: 5000,
      });
    empA1_id = empA1Res.body.data._id;

    const empA2Res = await request(app).post('/api/v1/hotel/employees')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        employee_ref: 'EMP-PAY-02',
        first_name: 'Jane',
        last_name: 'Smith',
        email: randomEmail('jane'),
        phone: randomPhone(),
        job_title: 'Front Desk',
        department_id: deptA_id,
        salary: 3200,
      });
    empA2_id = empA2Res.body.data._id;

    // Create Employee in Hotel B
    const empBRes = await request(app).post('/api/v1/hotel/employees')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({
        employee_ref: 'EMP-PAY-B1',
        first_name: 'Bob',
        last_name: 'Beta',
        email: randomEmail('bob'),
        phone: randomPhone(),
        job_title: 'Auditor',
        department_id: deptB_id,
        salary: 4000,
      });
    empB_id = empBRes.body.data._id;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await mongoose.disconnect();
  });

  describe('1. Authentication & RBAC', () => {
    it('should reject unauthenticated request to payroll runs with 401', async () => {
      const res = await request(app).get('/api/v1/hotel/payroll/runs');
      expect(res.status).toBe(401);
    });

    it('should reject non-admin from creating a payroll run with 403', async () => {
      const res = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          period_start: '2026-10-01',
          period_end: '2026-10-31',
        });
      expect(res.status).toBe(403);
    });

    it('should reject non-admin from updating an employee salary with 403', async () => {
      const res = await request(app).put(`/api/v1/hotel/payroll/employees/${empA1_id}/salary`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ salary: 6000 });
      expect(res.status).toBe(403);
    });

    it('should allow non-admin to view payroll runs and roster (read-only)', async () => {
      const res = await request(app).get('/api/v1/hotel/payroll/roster')
        .set('Authorization', `Bearer ${userTokenA}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('2. Tenant Isolation & Employee Integrity', () => {
    it('should reject nonexistent employee ID reference with 400 when adding item', async () => {
      // First create a run
      const runRes = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          run_ref: 'RUN-ISOLATION-01',
          period_start: '2026-10-01',
          period_end: '2026-10-31',
          auto_generate_items: false,
        });
      expect(runRes.status).toBe(201);
      const runId = runRes.body.data._id;

      const fakeEmpId = new mongoose.Types.ObjectId().toString();
      const itemRes = await request(app).post(`/api/v1/hotel/payroll/runs/${runId}/items`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: fakeEmpId,
          base_salary: 2000,
        });
      expect(itemRes.status).toBe(400);
      const msg1 = itemRes.body.error?.message || itemRes.body.message;
      expect(msg1).toContain('Referenced employee does not exist');
    });

    it('should prevent Hotel A from referencing Hotel B employee in payroll item (400)', async () => {
      const runRes = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          run_ref: 'RUN-ISOLATION-02',
          period_start: '2026-10-01',
          period_end: '2026-10-31',
          auto_generate_items: false,
        });
      const runId = runRes.body.data._id;

      const itemRes = await request(app).post(`/api/v1/hotel/payroll/runs/${runId}/items`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empB_id, // Hotel B employee!
          base_salary: 4000,
        });
      expect(itemRes.status).toBe(400);
      const msg2 = itemRes.body.error?.message || itemRes.body.message;
      expect(msg2).toContain('Referenced employee does not exist in this hotel');
    });

    it('should prevent Hotel A from accessing Hotel B payroll run (404)', async () => {
      // Create run in Hotel B
      const runBRes = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({
          run_ref: 'RUN-HOTELB-01',
          period_start: '2026-10-01',
          period_end: '2026-10-31',
        });
      expect(runBRes.status).toBe(201);
      const runBId = runBRes.body.data._id;

      // Hotel A attempts to access Hotel B run
      const res = await request(app).get(`/api/v1/hotel/payroll/runs/${runBId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(res.status).toBe(404);
    });

    it('should prevent Hotel A from modifying Hotel B payroll run (404)', async () => {
      const runBRes = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({
          run_ref: 'RUN-HOTELB-02',
          period_start: '2026-10-01',
          period_end: '2026-10-31',
        });
      const runBId = runBRes.body.data._id;

      const res = await request(app).put(`/api/v1/hotel/payroll/runs/${runBId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ notes: 'Hacked by A' });
      expect(res.status).toBe(404);
    });
  });

  describe('3. Historical Snapshot & Salary Integrity', () => {
    it('should snapshot employee salary at generation time and preserve it when employee salary changes', async () => {
      // 1. Employee A1 currently has salary 5000, A2 has salary 3200
      // 2. Generate a payroll run with auto_generate_items = true
      const runRes = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          run_ref: 'RUN-SNAPSHOT-2026-10',
          period_start: '2026-10-01',
          period_end: '2026-10-31',
          auto_generate_items: true,
        });
      expect(runRes.status).toBe(201);
      const runId = runRes.body.data._id;

      // Verify the items in this run
      const getRunRes = await request(app).get(`/api/v1/hotel/payroll/runs/${runId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(getRunRes.status).toBe(200);
      const items = getRunRes.body.data.items;
      expect(items.length).toBeGreaterThanOrEqual(2);

      const itemEmp1 = items.find((i) => i.employee_id._id === empA1_id || i.employee_id === empA1_id);
      expect(itemEmp1).toBeDefined();
      expect(itemEmp1.base_salary).toBe(5000);
      expect(itemEmp1.net_pay).toBe(5000);

      // 3. Now change Employee A1 salary reference to 7500!
      const updateEmpSalaryRes = await request(app).put(`/api/v1/hotel/payroll/employees/${empA1_id}/salary`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ salary: 7500 });
      expect(updateEmpSalaryRes.status).toBe(200);
      expect(updateEmpSalaryRes.body.data.salary).toBe(7500);

      // 4. Verify previously generated payroll item STILL retains the historical 5000 value!
      const verifyRunRes = await request(app).get(`/api/v1/hotel/payroll/runs/${runId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      const verifiedItems = verifyRunRes.body.data.items;
      const verifiedEmp1Item = verifiedItems.find((i) => i.employee_id._id === empA1_id || i.employee_id === empA1_id);

      expect(verifiedEmp1Item.base_salary).toBe(5000); // MUST NOT change to 7500!
      expect(verifiedEmp1Item.net_pay).toBe(5000);
    });
  });

  describe('4. Salary Calculation Engine & Totals', () => {
    it('should correctly calculate net_pay = base + bonus - deductions and update run total', async () => {
      const runRes = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          run_ref: 'RUN-CALC-01',
          period_start: '2026-11-01',
          period_end: '2026-11-30',
          auto_generate_items: false,
        });
      const runId = runRes.body.data._id;

      // Add item 1: base 4000, bonus 500, deductions 200 -> net 4300
      const item1Res = await request(app).post(`/api/v1/hotel/payroll/runs/${runId}/items`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA1_id,
          base_salary: 4000,
          bonuses: 500,
          deductions: 200,
        });
      expect(item1Res.status).toBe(201);
      expect(item1Res.body.data.net_pay).toBe(4300);

      // Add item 2: base 3000, bonus 200, deductions 100 -> net 3100
      const item2Res = await request(app).post(`/api/v1/hotel/payroll/runs/${runId}/items`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          employee_id: empA2_id,
          base_salary: 3000,
          bonuses: 200,
          deductions: 100,
        });
      expect(item2Res.status).toBe(201);
      expect(item2Res.body.data.net_pay).toBe(3100);

      // Verify run total_amount is 4300 + 3100 = 7400
      const runDetails = await request(app).get(`/api/v1/hotel/payroll/runs/${runId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(runDetails.body.data.run.total_amount).toBe(7400);

      // Update item 1: change bonus to 1000 -> net should become 4800, total should become 7900
      const updateItemRes = await request(app).put(`/api/v1/hotel/payroll/items/${item1Res.body.data._id}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ bonuses: 1000 });
      expect(updateItemRes.status).toBe(200);
      expect(updateItemRes.body.data.net_pay).toBe(4800);

      const runDetailsAfter = await request(app).get(`/api/v1/hotel/payroll/runs/${runId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(runDetailsAfter.body.data.run.total_amount).toBe(7900);
    });
  });

  describe('5. Duplicate Protection & Date Validation', () => {
    it('should reject duplicate run_ref with 409', async () => {
      const res = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          run_ref: 'RUN-CALC-01', // Already created in previous test!
          period_start: '2026-11-01',
          period_end: '2026-11-30',
        });
      expect(res.status).toBe(409);
    });

    it('should reject end_date before start_date with 400', async () => {
      const res = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          period_start: '2026-12-31',
          period_end: '2026-12-01',
        });
      expect(res.status).toBe(400);
      const msg = res.body.error?.message || res.body.message;
      expect(msg).toContain('End date cannot be before start date');
    });

    it('should reject duplicate employee item within the same run with 409', async () => {
      const runRes = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          run_ref: 'RUN-DUP-CHECK',
          period_start: '2026-12-01',
          period_end: '2026-12-31',
          auto_generate_items: false,
        });
      const runId = runRes.body.data._id;

      // First add
      await request(app).post(`/api/v1/hotel/payroll/runs/${runId}/items`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ employee_id: empA1_id, base_salary: 5000 });

      // Duplicate add
      const dupRes = await request(app).post(`/api/v1/hotel/payroll/runs/${runId}/items`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ employee_id: empA1_id, base_salary: 5000 });
      expect(dupRes.status).toBe(409);
      const dupMsg = dupRes.body.error?.message || dupRes.body.message;
      expect(dupMsg).toContain('already has a payroll item in this run');
    });
  });

  describe('6. Lifecycle State Transitions & Immutability', () => {
    it('should enforce proper lifecycle flow and prevent modifications after completion', async () => {
      const runRes = await request(app).post('/api/v1/hotel/payroll/runs')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          run_ref: 'RUN-LIFECYCLE-01',
          period_start: '2027-01-01',
          period_end: '2027-01-31',
          auto_generate_items: true,
        });
      const runId = runRes.body.data._id;
      expect(runRes.body.data.status).toBe('DRAFT');

      // 1. Move DRAFT -> PROCESSING
      const procRes = await request(app).put(`/api/v1/hotel/payroll/runs/${runId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ status: 'PROCESSING' });
      expect(procRes.status).toBe(200);
      expect(procRes.body.data.status).toBe('PROCESSING');

      // 2. Move PROCESSING -> APPROVED
      const appRes = await request(app).put(`/api/v1/hotel/payroll/runs/${runId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ status: 'APPROVED' });
      expect(appRes.status).toBe(200);
      expect(appRes.body.data.status).toBe('APPROVED');

      // Reverting APPROVED to DRAFT should fail
      const revertRes = await request(app).put(`/api/v1/hotel/payroll/runs/${runId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ status: 'DRAFT' });
      expect(revertRes.status).toBe(400);

      // 3. Move APPROVED -> COMPLETED
      const compRes = await request(app).put(`/api/v1/hotel/payroll/runs/${runId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ status: 'COMPLETED' });
      expect(compRes.status).toBe(200);
      expect(compRes.body.data.status).toBe('COMPLETED');

      // 4. Modifying completed run should be rejected (400)
      const modRunRes = await request(app).put(`/api/v1/hotel/payroll/runs/${runId}`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ notes: 'Try to modify completed run' });
      expect(modRunRes.status).toBe(400);
      const modMsg = modRunRes.body.error?.message || modRunRes.body.message;
      expect(modMsg).toContain('Cannot modify a completed payroll run');

      // 5. Adding new item to completed run should be rejected (400)
      const addItemRes = await request(app).post(`/api/v1/hotel/payroll/runs/${runId}/items`)
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ employee_id: empA1_id, base_salary: 1000 });
      expect(addItemRes.status).toBe(400);
      const addMsg = addItemRes.body.error?.message || addItemRes.body.message;
      expect(addMsg).toContain('Cannot add items to a completed payroll run');

      // 6. Deleting completed run should be rejected (400)
      const delRunRes = await request(app).delete(`/api/v1/hotel/payroll/runs/${runId}`)
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(delRunRes.status).toBe(400);
      const delMsg = delRunRes.body.error?.message || delRunRes.body.message;
      expect(delMsg).toContain('Only DRAFT payroll runs can be deleted');
    });
  });

  describe('7. Employee Salary Roster API', () => {
    it('should retrieve authoritative employee salary roster with correct structure', async () => {
      const res = await request(app).get('/api/v1/hotel/payroll/roster')
        .set('Authorization', `Bearer ${adminTokenA}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);

      const rosterItem = res.body.data.find((e) => e.employee_id === empA1_id);
      expect(rosterItem).toBeDefined();
      expect(rosterItem.name).toBe('John Doe');
      expect(rosterItem.empId).toBe('EMP-PAY-01');
      expect(rosterItem.role).toBe('Manager');
      expect(rosterItem.salary).toBe(7500); // Updated salary from test 3
      expect(rosterItem.department).toBe('Human Resources Alpha');
      expect(rosterItem).toHaveProperty('paymentStatus');
      expect(rosterItem).toHaveProperty('avatar');
    });
  });
});
