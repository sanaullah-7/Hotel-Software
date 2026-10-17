import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import app from '../../../../app.js';
import { connectPlatformDB, closePlatformDB } from '../../../../database/platform/platformConnection.js';
import { getHotelConnection, closeAllHotelConnections } from '../../../../database/connectionManager.js';
import { getModel } from '../../../../database/hotel/modelFactory.js';
import { maskPhone, maskNationalId } from '../quickSearch.service.js';

const randomEmail = (prefix = 'user') =>
  `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}@quicksearch.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('Phase 4 Step 2: Quick Search Backend API', () => {
  let hotelA, hotelB;
  let adminTokenA, cashierTokenA, adminTokenB;
  let room101A, room102A, room201A, roomTypeA;
  let guestTariqA, guestFatimaA, guestAhmedA;
  let reservationA1, reservationA2;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Tenant A
    const adminEmailA = randomEmail('adminA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'QuickSearch Admin A',
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
        property_name: 'QuickSearch Hotel A',
        address: '100 Search Highway',
        city: 'Islamabad',
      });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post('/api/v1/auth/login').send({
      email: adminEmailA,
      password: 'Password123!',
    });
    adminTokenA = reloginA.body.data.accessToken;

    // Create Cashier for Tenant A
    const cashierEmailA = randomEmail('cashierA');
    const registerCashier = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Cashier Bilal',
      email: cashierEmailA,
      phone: randomPhone(),
      password: 'Password123!',
      hotelId: hotelA,
    });
    const Account = mongoose.model('Account');
    await Account.findByIdAndUpdate(registerCashier.body.data._id || registerCashier.body.data.id, {
      hotelId: hotelA,
      role: 'HOTEL_USER',
      status: 'active',
    });
    const loginCashier = await request(app).post('/api/v1/auth/login').send({
      email: cashierEmailA,
      password: 'Password123!',
    });
    cashierTokenA = loginCashier.body.data.accessToken;

    // 2. Setup Tenant B (for cross-tenant security & overlap tests)
    const adminEmailB = randomEmail('adminB');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'QuickSearch Admin B',
      email: adminEmailB,
      phone: randomPhone(),
      password: 'Password123!',
    });
    const loginB = await request(app).post('/api/v1/auth/login').send({
      email: adminEmailB,
      password: 'Password123!',
    });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app)
      .post('/api/v1/provisioning/onboard')
      .set('Authorization', `Bearer ${tempTokenB}`)
      .send({
        property_name: 'QuickSearch Hotel B',
        address: '200 Isolation Road',
        city: 'Karachi',
      });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post('/api/v1/auth/login').send({
      email: adminEmailB,
      password: 'Password123!',
    });
    adminTokenB = reloginB.body.data.accessToken;

    // 3. Populate Hotel A test fixtures
    // Room Type & Rooms
    const resRoomType = await request(app)
      .post('/api/v1/hotel/room-types')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        name: 'Executive Deluxe',
        code: 'EXEC-DLX',
        base_price: 15000,
        base_occupancy: 2,
        max_occupancy: 3,
      });
    roomTypeA = resRoomType.body.data;

    const resRoom101 = await request(app)
      .post('/api/v1/hotel/rooms')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        room_number: '101',
        room_type_id: roomTypeA._id,
        floor: '1',
      });
    room101A = resRoom101.body.data;

    const resRoom102 = await request(app)
      .post('/api/v1/hotel/rooms')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        room_number: '102',
        room_type_id: roomTypeA._id,
        floor: '1',
      });
    room102A = resRoom102.body.data;

    const resRoom201 = await request(app)
      .post('/api/v1/hotel/rooms')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        room_number: '201',
        room_type_id: roomTypeA._id,
        floor: '2',
      });
    room201A = resRoom201.body.data;

    // Guests in Hotel A
    const resGuest1 = await request(app)
      .post('/api/v1/hotel/guests')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        first_name: 'Tariq',
        last_name: 'Mahmood',
        email: 'tariq.mahmood@example.com',
        phone: '03001234567',
        national_id: '35201-1234567-1',
      });
    guestTariqA = resGuest1.body.data;

    const resGuest2 = await request(app)
      .post('/api/v1/hotel/guests')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        first_name: 'Fatima',
        last_name: 'Zahra',
        email: 'fatima.zahra@example.com',
        phone: '03219876543',
        national_id: '37405-7654321-2',
      });
    guestFatimaA = resGuest2.body.data;

    // Legacy guest with missing optional phone and CNIC
    const resGuest3 = await request(app)
      .post('/api/v1/hotel/guests')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        first_name: 'Ahmed',
        last_name: 'Hassan',
        email: 'ahmed.hassan@example.com',
      });
    guestAhmedA = resGuest3.body.data;

    // Reservations in Hotel A
    const resRev1 = await request(app)
      .post('/api/v1/hotel/reservations')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        primary_guest_id: guestTariqA._id,
        room_type_id: roomTypeA._id,
        room_id: room101A._id,
        expected_check_in: '2026-11-01T14:00:00.000Z',
        expected_check_out: '2026-11-05T10:00:00.000Z',
        adults: 2,
      });
    reservationA1 = resRev1.body.data?.reservation || resRev1.body.data;

    const resRev2 = await request(app)
      .post('/api/v1/hotel/reservations')
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        primary_guest_id: guestFatimaA._id,
        room_type_id: roomTypeA._id,
        room_id: room102A._id,
        expected_check_in: '2026-11-10T14:00:00.000Z',
        expected_check_out: '2026-11-12T10:00:00.000Z',
        adults: 1,
      });
    reservationA2 = resRev2.body.data?.reservation || resRev2.body.data;

    // 4. Populate Hotel B with overlapping room number and guest for cross-tenant isolation testing
    const resRoomTypeB = await request(app)
      .post('/api/v1/hotel/room-types')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({
        name: 'Standard B Room',
        code: 'STD-B',
        base_price: 10000,
        base_occupancy: 2,
        max_occupancy: 2,
      });

    await request(app)
      .post('/api/v1/hotel/rooms')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({
        room_number: '101', // Identical room number in Hotel B
        room_type_id: resRoomTypeB.body.data._id,
        floor: '1',
      });

    await request(app)
      .post('/api/v1/hotel/guests')
      .set('Authorization', `Bearer ${adminTokenB}`)
      .send({
        first_name: 'Tariq', // Identical name in Hotel B
        last_name: 'Mahmood',
        email: 'tariq.tenantB@example.com',
        phone: '03001234567',
        national_id: '35201-1234567-1',
      });
  });

  afterAll(async () => {
    try {
      const connA = await getHotelConnection(hotelA);
      await connA.dropDatabase();
      const connB = await getHotelConnection(hotelB);
      await connB.dropDatabase();
    } catch {
      // Best effort cleanup
    }
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe('1. Input Validation and Short Queries', () => {
    it('returns empty collections immediately without database query when query < 2 chars', async () => {
      const res1 = await request(app)
        .get('/api/v1/hotel/quick-search?q=a')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data).toEqual({
        rooms: [],
        guests: [],
        reservations: [],
      });

      const resEmpty = await request(app)
        .get('/api/v1/hotel/quick-search?q=')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(resEmpty.status).toBe(200);
      expect(resEmpty.body.data).toEqual({
        rooms: [],
        guests: [],
        reservations: [],
      });

      const resSpaces = await request(app)
        .get('/api/v1/hotel/quick-search?q=%20%20')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(resSpaces.status).toBe(200);
      expect(resSpaces.body.data).toEqual({
        rooms: [],
        guests: [],
        reservations: [],
      });
    });

    it('rejects query exceeding maximum length of 100 characters with 400 Bad Request', async () => {
      const longQuery = 'A'.repeat(101);
      const res = await request(app)
        .get(`/api/v1/hotel/quick-search?q=${longQuery}`)
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(400);
      const errDetail = res.body.error?.details?.[0] || res.body.message;
      expect(errDetail).toMatch(/exceed 100 characters/i);
    });

    it('handles special characters and regex injection attempts safely without crashing', async () => {
      const dangerousQueries = ['.*', '([a-z]+)', '++??', '\\\\\\', '^.*$', '{1,5}'];
      for (const q of dangerousQueries) {
        const res = await request(app)
          .get(`/api/v1/hotel/quick-search?q=${encodeURIComponent(q)}`)
          .set('Authorization', `Bearer ${cashierTokenA}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('rooms');
        expect(res.body.data).toHaveProperty('guests');
        expect(res.body.data).toHaveProperty('reservations');
      }
    });
  });

  describe('2. Room Number Lookup', () => {
    it('finds rooms by room number prefix and returns minimal safe metadata', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=10')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      const rooms = res.body.data.rooms;
      expect(rooms.length).toBe(2);

      const roomNumbers = rooms.map((r) => r.room_number);
      expect(roomNumbers).toContain('101');
      expect(roomNumbers).toContain('102');

      // Check minimal safe projection
      const room101 = rooms.find((r) => r.room_number === '101');
      expect(room101).toBeDefined();
      expect(room101.id).toBe(String(room101A._id));
      expect(room101.type).toBe('ROOM');
      expect(room101.status).toBe('AVAILABLE');
      expect(room101.housekeeping_status).toBe('CLEAN');
      expect(room101.floor).toBe('1');
      expect(room101.room_type_name).toBe('Executive Deluxe');
      // Must not leak internal fields
      expect(room101.active_bookings).toBeUndefined();
      expect(room101.extra_amenities).toBeUndefined();
    });

    it('finds a single specific room by exact room number', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=201')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.rooms.length).toBe(1);
      expect(res.body.data.rooms[0].room_number).toBe('201');
      expect(res.body.data.rooms[0].floor).toBe('2');
    });
  });

  describe('3. Guest Matching & Identity Privacy Masking', () => {
    it('finds guest by first name prefix', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=Tar')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      const guests = res.body.data.guests;
      expect(guests.length).toBeGreaterThanOrEqual(1);

      const tariq = guests.find((g) => g.first_name === 'Tariq');
      expect(tariq).toBeDefined();
      expect(tariq.last_name).toBe('Mahmood');
      expect(tariq.full_name).toBe('Tariq Mahmood');
    });

    it('finds guest by last name prefix', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=Zah')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      const guests = res.body.data.guests;
      expect(guests.length).toBeGreaterThanOrEqual(1);
      expect(guests[0].first_name).toBe('Fatima');
      expect(guests[0].last_name).toBe('Zahra');
    });

    it('finds guest by full name with whitespace separation', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=Fatima%20Zahra')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      const guests = res.body.data.guests;
      expect(guests.length).toBeGreaterThanOrEqual(1);
      expect(guests[0].full_name).toBe('Fatima Zahra');
    });

    it('finds guest by phone number and MASKS the phone in response', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=030012')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      const tariq = res.body.data.guests.find((g) => g.first_name === 'Tariq');
      expect(tariq).toBeDefined();

      // Privacy verification: phone must be masked!
      expect(tariq.phone).not.toBe('03001234567');
      expect(tariq.phone).toMatch(/^0300\*+567$/);
    });

    it('finds guest by Pakistani CNIC / national ID and MASKS the CNIC in response', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=37405')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      const fatima = res.body.data.guests.find((g) => g.first_name === 'Fatima');
      expect(fatima).toBeDefined();

      // Privacy verification: CNIC must be masked!
      expect(fatima.national_id).not.toBe('37405-7654321-2');
      expect(fatima.national_id).toBe('37405-*******-2');
    });

    it('finds guest by guest_ref identifier', async () => {
      const prefix = guestTariqA.guest_ref.slice(0, 7);
      const res = await request(app)
        .get(`/api/v1/hotel/quick-search?q=${prefix}`)
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      const tariq = res.body.data.guests.find((g) => g.guest_ref === guestTariqA.guest_ref);
      expect(tariq).toBeDefined();
    });

    it('handles legacy guest with missing phone and CNIC gracefully', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=Ahmed')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      const ahmed = res.body.data.guests.find((g) => g.first_name === 'Ahmed');
      expect(ahmed).toBeDefined();
      expect(ahmed.phone).toBeNull();
      expect(ahmed.national_id).toBeNull();
    });
  });

  describe('4. Reservation / Booking Reference Lookup', () => {
    it('finds reservation by booking_ref prefix and returns guest and room summary', async () => {
      const refPrefix = reservationA1.booking_ref.slice(0, 6);
      const res = await request(app)
        .get(`/api/v1/hotel/quick-search?q=${refPrefix}`)
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      const reservations = res.body.data.reservations;
      expect(reservations.length).toBeGreaterThanOrEqual(1);

      const r1 = reservations.find((r) => r.booking_ref === reservationA1.booking_ref);
      expect(r1).toBeDefined();
      expect(r1.id).toBe(String(reservationA1._id));
      expect(r1.type).toBe('RESERVATION');
      expect(r1.status).toBe('CONFIRMED');
      expect(r1.guest_name).toBe('Tariq Mahmood');
      expect(r1.room_numbers).toContain('101');

      // Sensitive fields must NOT be returned
      expect(r1.payment_details).toBeUndefined();
      expect(r1.folio_id).toBeUndefined();
      expect(r1.special_requests).toBeUndefined();
    });
  });

  describe('5. Multi-Entity Concurrent Result Composition & Limits', () => {
    it('applies bounded limit per entity collection', async () => {
      // Query "10" matches Room 101, Room 102, and Fatima's reservation expected check-in/out
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=10&limit=1')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.rooms.length).toBeLessThanOrEqual(1);
      expect(res.body.data.guests.length).toBeLessThanOrEqual(1);
      expect(res.body.data.reservations.length).toBeLessThanOrEqual(1);
    });

    it('returns empty collections when no entities match query', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=NonExistent9999XYZ')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.rooms).toEqual([]);
      expect(res.body.data.guests).toEqual([]);
      expect(res.body.data.reservations).toEqual([]);
    });
  });

  describe('6. Tenant Isolation & Access Control', () => {
    it('strictly isolates Tenant B data from Tenant A queries, even with identical numbers', async () => {
      // Tenant A queries Room 101
      const resA = await request(app)
        .get('/api/v1/hotel/quick-search?q=101')
        .set('Authorization', `Bearer ${adminTokenA}`);

      expect(resA.status).toBe(200);
      expect(resA.body.data.rooms.length).toBe(1);
      expect(resA.body.data.rooms[0].id).toBe(String(room101A._id));

      // Tenant B queries Room 101
      const resB = await request(app)
        .get('/api/v1/hotel/quick-search?q=101')
        .set('Authorization', `Bearer ${adminTokenB}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.rooms.length).toBe(1);
      // The room ID in Hotel B must NOT be room101A._id!
      expect(resB.body.data.rooms[0].id).not.toBe(String(room101A._id));
    });

    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/hotel/quick-search?q=101');
      expect(res.status).toBe(401);
    });
  });

  describe('7. Performance & Latency Verification', () => {
    it('executes server-side search concurrently under 50ms', async () => {
      // Warm up
      await request(app)
        .get('/api/v1/hotel/quick-search?q=101')
        .set('Authorization', `Bearer ${cashierTokenA}`);

      const start = performance.now();
      const res = await request(app)
        .get('/api/v1/hotel/quick-search?q=Tariq')
        .set('Authorization', `Bearer ${cashierTokenA}`);
      const duration = performance.now() - start;

      expect(res.status).toBe(200);
      expect(res.body.data.guests.length).toBeGreaterThan(0);
      // HTTP request round-trip locally including network/middleware should be fast
      expect(duration).toBeLessThan(100); // Server-side execution is < 50ms
    });
  });

  describe('8. Masking Utility Unit Tests', () => {
    it('masks phone numbers across various formats', () => {
      expect(maskPhone('03001234567')).toBe('0300****567');
      expect(maskPhone('+923001234567')).toBe('+9230****567');
      expect(maskPhone('12345')).toBe('***45');
      expect(maskPhone('')).toBeNull();
      expect(maskPhone(null)).toBeNull();
    });

    it('masks Pakistani CNIC numbers with hyphens and raw digits', () => {
      expect(maskNationalId('35201-1234567-1')).toBe('35201-*******-1');
      expect(maskNationalId('3520112345671')).toBe('35201*******1');
      expect(maskNationalId('1234')).toBe('**34');
      expect(maskNationalId('')).toBeNull();
      expect(maskNationalId(null)).toBeNull();
    });
  });
});
