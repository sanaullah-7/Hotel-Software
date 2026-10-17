import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import app from '../../../../app.js';
import { connectPlatformDB, closePlatformDB } from '../../../../database/platform/platformConnection.js';
import { getHotelConnection, closeAllHotelConnections } from '../../../../database/connectionManager.js';
import { getModel } from '../../../../database/hotel/modelFactory.js';

const randomEmail = (prefix = 'cashier') =>
  `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}@luxuria.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('Phase 4 Step 1: Cash Shift Backend Foundation & Integrity', () => {
  let hotelA, hotelB;
  let adminTokenA, cashierTokenA, cashierTokenA2, adminTokenB;
  let cashierUserA, cashierUserA2, adminUserA;
  let guestA, roomTypeA, folioA, invoiceA;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Tenant A
    const adminEmailA = randomEmail('adminA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Shift Admin A',
      email: adminEmailA,
      phone: randomPhone(),
      password: 'Password123!',
    });
    const loginA = await request(app).post('/api/v1/auth/login').send({
      email: adminEmailA,
      password: 'Password123!',
    });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app)
      .post('/api/v1/provisioning/onboard')
      .set('Authorization', `Bearer ${tempTokenA}`)
      .send({
        property_name: 'Grand Cashier Hotel A',
        address: '100 Float Boulevard',
        city: 'Lahore',
      });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post('/api/v1/auth/login').send({
      email: adminEmailA,
      password: 'Password123!',
    });
    adminTokenA = reloginA.body.data.accessToken;
    adminUserA = reloginA.body.data.account;

    // Create Cashier 1 for Tenant A (HOTEL_USER role)
    const cashierEmailA = randomEmail('cashier1');
    const registerCashier1 = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Cashier Tariq',
      email: cashierEmailA,
      phone: randomPhone(),
      password: 'Password123!',
      hotelId: hotelA,
    });
    // Link cashier account to hotelA if needed
    const Account = mongoose.model('Account');
    await Account.findByIdAndUpdate(registerCashier1.body.data._id || registerCashier1.body.data.id, {
      hotelId: hotelA,
      role: 'HOTEL_USER',
      status: 'active',
    });

    const loginCashier1 = await request(app).post('/api/v1/auth/login').send({
      email: cashierEmailA,
      password: 'Password123!',
    });
    cashierTokenA = loginCashier1.body.data.accessToken;
    cashierUserA = loginCashier1.body.data.account;

    // Create Cashier 2 for Tenant A (separate staff member)
    const cashierEmailA2 = randomEmail('cashier2');
    const registerCashier2 = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Cashier Fatima',
      email: cashierEmailA2,
      phone: randomPhone(),
      password: 'Password123!',
      hotelId: hotelA,
    });
    await Account.findByIdAndUpdate(registerCashier2.body.data._id || registerCashier2.body.data.id, {
      hotelId: hotelA,
      role: 'HOTEL_USER',
      status: 'active',
    });
    const loginCashier2 = await request(app).post('/api/v1/auth/login').send({
      email: cashierEmailA2,
      password: 'Password123!',
    });
    cashierTokenA2 = loginCashier2.body.data.accessToken;
    cashierUserA2 = loginCashier2.body.data.account;

    // Setup Tenant B (for cross-tenant security testing)
    const adminEmailB = randomEmail('adminB');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Shift Admin B',
      email: adminEmailB,
      phone: randomPhone(),
      password: 'Password123!',
    });
    const loginB = await request(app).post('/api/v1/auth/login').send({
      email: adminEmailB,
      password: 'Password123!',
    });
    const onboardB = await request(app)
      .post('/api/v1/provisioning/onboard')
      .set('Authorization', `Bearer ${loginB.body.data.accessToken}`)
      .send({
        property_name: 'Rival Cashier Hotel B',
        address: '200 Competitor Way',
        city: 'Islamabad',
      });
    hotelB = onboardB.body.data.hotelId;
    const reloginB = await request(app).post('/api/v1/auth/login').send({
      email: adminEmailB,
      password: 'Password123!',
    });
    adminTokenB = reloginB.body.data.accessToken;

    // Setup Guest and Folio in Hotel A for billing tests
    const resGuest = await request(app)
      .post('/api/v1/hotel/guests')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        first_name: 'Hamza',
        last_name: 'Khan',
        email: randomEmail('hamza'),
        phone: randomPhone(),
      });
    guestA = resGuest.body.data;

    const resFolio = await request(app)
      .post('/api/v1/hotel/folios')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({ guest_id: guestA._id });
    folioA = resFolio.body.data;

    const resInv = await request(app)
      .post('/api/v1/hotel/invoices')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        folio_id: folioA._id,
        guest_id: guestA._id,
        line_items: [{ description: 'Room Charge', amount: 5000 }],
      });
    invoiceA = resInv.body.data;
  });

  afterAll(async () => {
    try {
      const connA = await getHotelConnection(hotelA);
      await connA.dropDatabase();
      const connB = await getHotelConnection(hotelB);
      await connB.dropDatabase();
    } catch {
      // Cleanup best effort
    }
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe('1. Shift Opening & Validation', () => {
    it('rejects shift opening with invalid opening float', async () => {
      const resNegative = await request(app)
        .post('/api/v1/hotel/shifts/open')
        .set('Authorization', `Bearer ${cashierTokenA}`)
        .send({ opening_float: -500 });

      expect(resNegative.status).toBe(400);

      const resString = await request(app)
        .post('/api/v1/hotel/shifts/open')
        .set('Authorization', `Bearer ${cashierTokenA}`)
        .send({ opening_float: 'invalid' });

      expect(resString.status).toBe(400);
    });

    it('successfully opens a shift with a valid opening float', async () => {
      const res = await request(app)
        .post('/api/v1/hotel/shifts/open')
        .set('Authorization', `Bearer ${cashierTokenA}`)
        .send({
          opening_float: 5000.0,
          drawer_name: 'Drawer 1',
          notes: 'Morning shift opening',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.shift_number).toMatch(/^SHF-/);
      expect(res.body.data.opening_float).toBe(5000);
      expect(res.body.data.status).toBe('OPEN');
      expect(String(res.body.data.staff_id)).toBe(String(cashierUserA._id || cashierUserA.id));
    });

    it('rejects duplicate shift opening for the same cashier with 409 Conflict', async () => {
      const resDuplicate = await request(app)
        .post('/api/v1/hotel/shifts/open')
        .set('Authorization', `Bearer ${cashierTokenA}`)
        .send({ opening_float: 2000 });

      expect(resDuplicate.status).toBe(409);
      expect(resDuplicate.body.message).toMatch(/already has an active open shift/i);
    });

    it('allows a different cashier to open their own independent shift concurrently', async () => {
      const resCashier2 = await request(app)
        .post('/api/v1/hotel/shifts/open')
        .set('Authorization', `Bearer ${cashierTokenA2}`)
        .send({ opening_float: 3000, drawer_name: 'Drawer 2' });

      expect(resCashier2.status).toBe(201);
      expect(resCashier2.body.data.opening_float).toBe(3000);
      expect(String(resCashier2.body.data.staff_id)).toBe(String(cashierUserA2._id || cashierUserA2.id));
    });

    it('concurrent open requests for same cashier results in exactly ONE open shift', async () => {
      // Create fresh Cashier 3
      const email3 = randomEmail('cashier3');
      const reg3 = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Cashier Concurrency',
        email: email3,
        phone: randomPhone(),
        password: 'Password123!',
      });
      const Account = mongoose.model('Account');
      await Account.findByIdAndUpdate(reg3.body.data._id || reg3.body.data.id, {
        hotelId: hotelA,
        role: 'HOTEL_USER',
        status: 'active',
      });
      const login3 = await request(app).post('/api/v1/auth/login').send({
        email: email3,
        password: 'Password123!',
      });
      const token3 = login3.body.data.accessToken;

      // Fire 5 concurrent open requests
      const requests = Array.from({ length: 5 }, () =>
        request(app)
          .post('/api/v1/hotel/shifts/open')
          .set('Authorization', `Bearer ${token3}`)
          .send({ opening_float: 1000 })
      );

      const responses = await Promise.all(requests);
      const successes = responses.filter((r) => r.status === 201);
      const conflicts = responses.filter((r) => r.status === 409);

      expect(successes.length).toBe(1);
      expect(conflicts.length).toBe(4);
    });
  });

  describe('2. Active Shift & Blind Cash Counting Protection', () => {
    it('returns active shift for cashier but CONCEALS expected cash and totals', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/shifts/active')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.status).toBe('OPEN');
      expect(res.body.data.opening_float).toBe(5000);

      // BLIND COUNTING SECURITY INVARIANT:
      // Regular cashier MUST NOT see expected cash, collected, or variance before counting
      expect(res.body.data.expected_cash).toBeUndefined();
      expect(res.body.data.cash_collected).toBeUndefined();
      expect(res.body.data.cash_paid_out).toBeUndefined();
      expect(res.body.data.cash_refunds).toBeUndefined();
      expect(res.body.data.discrepancy_amount).toBeUndefined();
    });

    it('returns empty result when cashier has no open shift', async () => {
      // Cashier adminTokenB has no open shift in Hotel B
      const res = await request(app)
        .get('/api/v1/hotel/shifts/active')
        .set('Authorization', `Bearer ${adminTokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
    });
  });

  describe('3. Payment Reconciliation & Tender Isolation', () => {
    it('attributes CASH payment to the active cashier shift and updates drawer', async () => {
      const payRes = await request(app)
        .post('/api/v1/hotel/payments')
        .set('Authorization', `Bearer ${cashierTokenA}`)
        .send({
          invoice_id: invoiceA._id,
          amount: 2000,
          payment_method: 'CASH',
        });

      expect(payRes.status).toBe(201);
      expect(payRes.body.data.amount).toBe(2000);
      expect(payRes.body.data.payment_method).toBe('CASH');
      expect(payRes.body.data.cash_shift_id).toBeDefined();

      // Verify the CashShift document reflects the cash collected
      const CashShift = await getModel(hotelA, 'CashShift');
      const shift = await CashShift.findById(payRes.body.data.cash_shift_id);
      expect(shift.cash_collected).toBe(2000);
    });

    it('excludes NON-CASH (Credit Card) payment from drawer cash_collected', async () => {
      const cardRes = await request(app)
        .post('/api/v1/hotel/payments')
        .set('Authorization', `Bearer ${cashierTokenA}`)
        .send({
          invoice_id: invoiceA._id,
          amount: 1500,
          payment_method: 'CREDIT_CARD',
          transaction_id: 'CC-AUTH-1234',
        });

      expect(cardRes.status).toBe(201);

      // Cash drawer collected should STILL be 2000, not 3500!
      const CashShift = await getModel(hotelA, 'CashShift');
      const shift = await CashShift.findOne({ staff_id: cashierUserA._id || cashierUserA.id, status: 'OPEN' });
      expect(shift.cash_collected).toBe(2000);
    });

    it('rejects cash receipt when cashier has NO open shift', async () => {
      // Cashier A2 has open shift, but let's test a cashier with no open shift (e.g., in Hotel B)
      // Create guest and folio in Hotel B
      const guestBRes = await request(app)
        .post('/api/v1/hotel/guests')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({ first_name: 'Zaid', last_name: 'NoShift', email: randomEmail('zaid'), phone: randomPhone() });

      const folioBRes = await request(app)
        .post('/api/v1/hotel/folios')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({ guest_id: guestBRes.body.data._id });

      const invBRes = await request(app)
        .post('/api/v1/hotel/invoices')
        .set('Authorization', `Bearer ${adminTokenB}`)
        .send({
          folio_id: folioBRes.body.data._id,
          guest_id: guestBRes.body.data._id,
          line_items: [{ description: 'Room', amount: 1000 }],
        });

      // Create cashier in Hotel B without open shift
      const cashierBEmail = randomEmail('cashierB');
      const regB = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Cashier B',
        email: cashierBEmail,
        phone: randomPhone(),
        password: 'Password123!',
      });
      const Account = mongoose.model('Account');
      await Account.findByIdAndUpdate(regB.body.data._id || regB.body.data.id, {
        hotelId: hotelB,
        role: 'HOTEL_USER',
        status: 'active',
      });
      const loginCashierB = await request(app).post('/api/v1/auth/login').send({
        email: cashierBEmail,
        password: 'Password123!',
      });
      const cashierTokenB = loginCashierB.body.data.accessToken;

      const rejectCash = await request(app)
        .post('/api/v1/hotel/payments')
        .set('Authorization', `Bearer ${cashierTokenB}`)
        .send({
          invoice_id: invBRes.body.data._id,
          amount: 500,
          payment_method: 'CASH',
        });

      expect(rejectCash.status).toBe(409);
      expect(rejectCash.body.message).toMatch(/no active cash shift found/i);
    });
  });

  describe('4. Cash Refunds & Cash Payouts', () => {
    let cashPaymentId;

    beforeAll(async () => {
      // Find the cash payment we made earlier
      const Payment = await getModel(hotelA, 'Payment');
      const pay = await Payment.findOne({
        folio_id: folioA._id,
        payment_method: 'CASH',
      });
      cashPaymentId = pay._id;
    });

    it('attributes CASH refund to active cashier shift and decrements drawer balance', async () => {
      const refundRes = await request(app)
        .post('/api/v1/hotel/refunds')
        .set('Authorization', `Bearer ${cashierTokenA}`)
        .send({
          payment_id: cashPaymentId,
          amount: 300,
          reason: 'Customer overcharge reimbursement in cash',
        });

      expect(refundRes.status).toBe(201);
      expect(refundRes.body.data.amount).toBe(300);
      expect(refundRes.body.data.cash_shift_id).toBeDefined();

      const CashShift = await getModel(hotelA, 'CashShift');
      const shift = await CashShift.findById(refundRes.body.data.cash_shift_id);
      expect(shift.cash_refunds).toBe(300);
    });

    it('attributes cash expense payout to drawer cash_paid_out', async () => {
      const CashShift = await getModel(hotelA, 'CashShift');
      const shift = await CashShift.findOne({ staff_id: cashierUserA._id || cashierUserA.id, status: 'OPEN' });

      // Create an expense paid from drawer
      const expRes = await request(app)
        .post('/api/v1/hotel/expenses')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          description: 'Front Desk Postage & Stationery',
          amount: 200,
          payment_method: 'Cash',
          status: 'Paid',
          category: 'SUPPLIES',
          cash_shift_id: String(shift._id),
        });

      expect(expRes.status).toBe(201);

      const updatedShift = await CashShift.findById(shift._id);
      expect(updatedShift.cash_paid_out).toBe(200);
    });
  });

  describe('5. Shift Closure, Blind Reconciliation & Immutability', () => {
    it('closes shift, calculates exact expected cash and discrepancies, and seals report', async () => {
      // Formula verification:
      // Opening Float = 5000.00
      // Cash Receipts = +2000.00
      // Cash Refunds  = -300.00
      // Cash Payouts  = -200.00
      // Expected Cash = 5000 + 2000 - 300 - 200 = 6500.00
      // Cashier physically counts 6480.00 (Shortage of 20.00)
      const closeRes = await request(app)
        .post('/api/v1/hotel/shifts/close')
        .set('Authorization', `Bearer ${cashierTokenA}`)
        .send({
          actual_counted_cash: 6480.0,
          notes: 'Count verified twice. Missing 20 PKR minor change variance.',
        });

      expect(closeRes.status).toBe(200);
      expect(closeRes.body.success).toBe(true);

      const report = closeRes.body.data;
      expect(report.status).toBe('CLOSED');
      expect(report.opening_float).toBe(5000);
      expect(report.cash_collected).toBe(2000);
      expect(report.cash_refunds).toBe(300);
      expect(report.cash_paid_out).toBe(200);
      expect(report.expected_cash).toBe(6500);
      expect(report.actual_counted_cash).toBe(6480);
      expect(report.discrepancy_amount).toBe(-20);
      expect(report.closed_at).toBeDefined();
      expect(String(report.closed_by)).toBe(String(cashierUserA._id || cashierUserA.id));

      // Multi-tender summary is preserved in Z-Report
      expect(report.tender_summary).toBeDefined();
      expect(report.tender_summary.cash_total).toBe(2000);
      expect(report.tender_summary.card_total).toBe(1500);
      expect(report.tender_summary.total_collected_all_tenders).toBe(3500);
    });

    it('rejects attempt to close an already-closed shift with 409 Conflict', async () => {
      const duplicateClose = await request(app)
        .post('/api/v1/hotel/shifts/close')
        .set('Authorization', `Bearer ${cashierTokenA}`)
        .send({ actual_counted_cash: 6500 });

      expect(duplicateClose.status).toBe(404); // No active open shift found to close
    });

    it('confirms closed shift is immutable and emits structured audit log', async () => {
      const AuditLog = await getModel(hotelA, 'AuditLog');
      const log = await AuditLog.findOne({
        module: 'Financials',
        action: 'SHIFT_CLOSED',
      });

      expect(log).toBeDefined();
      expect(log.description).toMatch(/Expected: 6500, Counted: 6480/);
      expect(log.importance).toBe('Important'); // Non-zero discrepancy logged as Important
    });

    it('retrieves sealed Z-report by ID and preserves exact financial snapshot', async () => {
      const CashShift = await getModel(hotelA, 'CashShift');
      const closedShift = await CashShift.findOne({
        staff_id: cashierUserA._id || cashierUserA.id,
        status: 'CLOSED',
      });

      const res = await request(app)
        .get(`/api/v1/hotel/shifts/${closedShift._id}`)
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.expected_cash).toBe(6500);
      expect(res.body.data.actual_counted_cash).toBe(6480);
      expect(res.body.data.discrepancy_amount).toBe(-20);
    });
  });

  describe('6. Cross-Tenant Isolation & Role Authorization', () => {
    it('prevents Tenant B from viewing Tenant A shifts (cross-tenant isolation)', async () => {
      const CashShiftA = await getModel(hotelA, 'CashShift');
      const shiftA = await CashShiftA.findOne({ status: 'CLOSED' });

      const resCross = await request(app)
        .get(`/api/v1/hotel/shifts/${shiftA._id}`)
        .set('Authorization', `Bearer ${adminTokenB}`);

      expect(resCross.status).toBe(404); // Not found in Tenant B's isolated database
    });

    it('prevents regular cashier from closing another cashiers open shift', async () => {
      // Cashier 2 still has an open shift from earlier
      const CashShiftA = await getModel(hotelA, 'CashShift');
      const shift2 = await CashShiftA.findOne({
        staff_id: cashierUserA2._id || cashierUserA2.id,
        status: 'OPEN',
      });

      // Cashier 1 attempts to close Cashier 2's shift
      const resForbidden = await request(app)
        .post('/api/v1/hotel/shifts/close')
        .set('Authorization', `Bearer ${cashierTokenA}`)
        .send({
          shift_id: shift2._id,
          actual_counted_cash: 3000,
        });

      expect(resForbidden.status).toBe(403);
      expect(resForbidden.body.message).toMatch(/not authorized to close another cashier/i);
    });

    it('allows hotel manager/admin to close a cashier shift with proper attribution', async () => {
      const CashShiftA = await getModel(hotelA, 'CashShift');
      const shift2 = await CashShiftA.findOne({
        staff_id: cashierUserA2._id || cashierUserA2.id,
        status: 'OPEN',
      });

      const resManagerClose = await request(app)
        .post('/api/v1/hotel/shifts/close')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({
          shift_id: shift2._id,
          actual_counted_cash: 3000,
          notes: 'Closed by manager during shift change audit',
        });

      expect(resManagerClose.status).toBe(200);
      expect(resManagerClose.body.data.status).toBe('CLOSED');
      expect(String(resManagerClose.body.data.closed_by)).toBe(String(adminUserA._id || adminUserA.id));
    });
  });

  describe('7. Verification 1 to 5: Financial Integrity, Refund Tender & Concurrency Safety', () => {
    let cashierToken3, cashierUser3, shift3Id;
    let folio3Id, cashPayment3Id, cardPayment3Id;

    beforeAll(async () => {
      // Create Cashier 3 for dedicated verification flow
      const cashierEmail3 = randomEmail('cashier_verify');
      const regRes = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Cashier Verification',
        email: cashierEmail3,
        phone: randomPhone(),
        password: 'Password123!',
        hotelId: hotelA,
      });
      const Account = mongoose.model('Account');
      await Account.findByIdAndUpdate(regRes.body.data._id || regRes.body.data.id, {
        hotelId: hotelA,
        role: 'HOTEL_USER',
        status: 'active',
      });
      const logRes = await request(app).post('/api/v1/auth/login').send({
        email: cashierEmail3,
        password: 'Password123!',
      });
      cashierToken3 = logRes.body.data.accessToken;
      cashierUser3 = logRes.body.data.account;

      // Create Guest and Folio for transactions
      const guestRes = await request(app)
        .post('/api/v1/hotel/guests')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          first_name: 'Integrity',
          last_name: 'Verification',
          email: randomEmail('guest_integrity'),
          phone: randomPhone(),
        });
      const guestId = guestRes.body.data._id;

      const folioRes = await request(app)
        .post('/api/v1/hotel/folios')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          guest_id: guestId,
          currency: 'PKR',
          notes: 'Shift Verification Folio',
        });
      folio3Id = folioRes.body.data._id;
    });

    it('opens shift with float 5000 and conceals expected_cash from cashier response', async () => {
      const openRes = await request(app)
        .post('/api/v1/hotel/shifts/open')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          opening_float: 5000,
          drawer_name: 'Verification Drawer',
        });

      expect(openRes.status).toBe(201);
      expect(openRes.body.data.opening_float).toBe(5000);
      expect(openRes.body.data.expected_cash).toBeUndefined(); // Blind counting
      shift3Id = openRes.body.data._id;
    });

    it('records cash and non-cash payments, isolating tender types correctly', async () => {
      // Cash payment: 1000
      const cashPayRes = await request(app)
        .post('/api/v1/hotel/payments')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          folio_id: folio3Id,
          amount: 1000,
          payment_method: 'CASH',
        });
      expect(cashPayRes.status).toBe(201);
      cashPayment3Id = cashPayRes.body.data._id;

      // Card payment: 2000
      const cardPayRes = await request(app)
        .post('/api/v1/hotel/payments')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          folio_id: folio3Id,
          amount: 2000,
          payment_method: 'CREDIT_CARD',
        });
      expect(cardPayRes.status).toBe(201);
      cardPayment3Id = cardPayRes.body.data._id;
    });

    it('distinguishes refund tender: BANK_TRANSFER refund on CASH payment does NOT decrement cash drawer', async () => {
      const refundRes = await request(app)
        .post('/api/v1/hotel/refunds')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          payment_id: cashPayment3Id,
          amount: 400,
          reason: 'Customer requested bank transfer for partial cash return',
          refund_method: 'BANK_TRANSFER',
        });

      expect(refundRes.status).toBe(201);
      expect(refundRes.body.data.refund_method).toBe('BANK_TRANSFER');
      // cash_shift_id MUST be null because physical cash did not leave the drawer!
      expect(refundRes.body.data.cash_shift_id).toBeNull();

      const CashShiftA = await getModel(hotelA, 'CashShift');
      const shift = await CashShiftA.findById(shift3Id);
      expect(shift.cash_refunds).toBe(0);
    });

    it('distinguishes refund tender: CASH refund on CREDIT_CARD payment DOES decrement cash drawer', async () => {
      const refundRes = await request(app)
        .post('/api/v1/hotel/refunds')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          payment_id: cardPayment3Id,
          amount: 200,
          reason: 'Emergency cash payout for card overcharge',
          refund_method: 'CASH',
        });

      expect(refundRes.status).toBe(201);
      expect(refundRes.body.data.refund_method).toBe('CASH');
      // cash_shift_id MUST be attributed to the active shift
      expect(String(refundRes.body.data.cash_shift_id)).toBe(String(shift3Id));

      const CashShiftA = await getModel(hotelA, 'CashShift');
      const shift = await CashShiftA.findById(shift3Id);
      expect(shift.cash_refunds).toBe(200);
    });

    it('ensures non-cash expenses do NOT decrement drawer, but cash expense DOES', async () => {
      // 1. Non-cash expense
      const bankExpRes = await request(app)
        .post('/api/v1/hotel/expenses')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          category: 'Utilities',
          description: 'Internet bill paid by bank transfer',
          amount: 500,
          payment_method: 'Bank Transfer',
          status: 'Paid',
          cash_shift_id: shift3Id,
        });
      expect(bankExpRes.status).toBe(201);

      let CashShiftA = await getModel(hotelA, 'CashShift');
      let shift = await CashShiftA.findById(shift3Id);
      expect(shift.cash_paid_out).toBe(0);

      // 2. Cash expense
      const cashExpRes = await request(app)
        .post('/api/v1/hotel/expenses')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          category: 'Front Desk',
          description: 'Office supplies petty cash',
          amount: 150,
          payment_method: 'Cash',
          status: 'Paid',
          cash_shift_id: shift3Id,
        });
      expect(cashExpRes.status).toBe(201);

      shift = await CashShiftA.findById(shift3Id);
      expect(shift.cash_paid_out).toBe(150);
    });

    it('calculates single authoritative balance without double-counting and seals Z-report', async () => {
      // Expected Cash = 5000 (Float) + 1000 (Cash Pay) - 200 (Cash Refund) - 150 (Cash Payout) = 5650.00
      const closeRes = await request(app)
        .post('/api/v1/hotel/shifts/close')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          actual_counted_cash: 5650.0,
          notes: 'Balanced shift with mixed tenders and payouts verified',
        });

      expect(closeRes.status).toBe(200);
      const zReport = closeRes.body.data;
      expect(zReport.status).toBe('CLOSED');
      expect(zReport.opening_float).toBe(5000);
      expect(zReport.cash_collected).toBe(1000);
      expect(zReport.cash_refunds).toBe(200);
      expect(zReport.cash_paid_out).toBe(150);
      expect(zReport.expected_cash).toBe(5650);
      expect(zReport.actual_counted_cash).toBe(5650);
      expect(zReport.discrepancy_amount).toBe(0);
      expect(zReport.tender_summary.card_total).toBe(2000);
      expect(zReport.tender_summary.total_collected_all_tenders).toBe(3000);
    });

    it('enforces concurrency protection: rejects cash movement against closed shift with 409 Conflict', async () => {
      // 1. Payment against closed shift
      const latePayRes = await request(app)
        .post('/api/v1/hotel/payments')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          folio_id: folio3Id,
          amount: 500,
          payment_method: 'CASH',
          cash_shift_id: shift3Id,
        });
      expect(latePayRes.status).toBe(409);
      expect(latePayRes.body.message).toMatch(/not open|closed/i);

      // 2. Refund against closed shift
      const lateRefRes = await request(app)
        .post('/api/v1/hotel/refunds')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          payment_id: cashPayment3Id,
          amount: 100,
          reason: 'Late refund attempt',
          refund_method: 'CASH',
          cash_shift_id: shift3Id,
        });
      expect(lateRefRes.status).toBe(409);
      expect(lateRefRes.body.message).toMatch(/not open|closed/i);

      // 3. Expense against closed shift
      const lateExpRes = await request(app)
        .post('/api/v1/hotel/expenses')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          category: 'Supplies',
          description: 'Late payout attempt',
          amount: 50,
          payment_method: 'Cash',
          status: 'Paid',
          cash_shift_id: shift3Id,
        });
      expect(lateExpRes.status).toBe(409);
      expect(lateExpRes.body.message).toMatch(/not open|closed/i);

      // 4. Duplicate shift closure with shift_id
      const dupCloseRes = await request(app)
        .post('/api/v1/hotel/shifts/close')
        .set('Authorization', `Bearer ${cashierToken3}`)
        .send({
          shift_id: shift3Id,
          actual_counted_cash: 5650,
        });
      expect(dupCloseRes.status).toBe(409);
      expect(dupCloseRes.body.message).toMatch(/already closed/i);
    });
  });
});
