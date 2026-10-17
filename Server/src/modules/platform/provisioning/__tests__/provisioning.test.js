import mongoose from 'mongoose';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../../../app.js';
import { connectPlatformDB, closePlatformDB } from '../../../../database/platform/platformConnection.js';
import Account from '../../../../database/platform/models/account.model.js';
import Hotel from '../../../../database/platform/models/hotel.model.js';
import { getHotelConnection, closeAllHotelConnections } from '../../../../database/connectionManager.js';
import { ROLES } from '../../../../constants/roles.js';
import crypto from 'crypto';

const randomEmail = (prefix = 'prov') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@provisioning.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

let server;
let adminAccount;
let adminToken;
let secondAccount;
let secondToken;

beforeAll(async () => {
  await connectPlatformDB();
  server = app.listen(0);

  const email1 = randomEmail('admin');
  await request(app)
    .post('/api/v1/auth/register')
    .send({
      fullName: 'Provision Admin',
      email: email1,
      phone: randomPhone(),
      password: 'Password123!',
      role: ROLES.HOTEL_USER
    });
  
  const loginRes1 = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: email1, password: 'Password123!' });
  adminToken = loginRes1.body.data.accessToken;
  adminAccount = loginRes1.body.data.account;

  const email2 = randomEmail('second');
  await request(app).post('/api/v1/auth/register').send({
    fullName: 'Second User',
    email: email2,
    phone: randomPhone(),
    password: 'Password123!',
    role: ROLES.HOTEL_USER
  });
  const loginRes2 = await request(app).post('/api/v1/auth/login').send({
    email: email2, password: 'Password123!'
  });
  secondToken = loginRes2.body.data.accessToken;
  secondAccount = loginRes2.body.data.account;
});

afterAll(async () => {
  if (server) server.close();
  await closePlatformDB();
  await closeAllHotelConnections();
});

describe('Provisioning & Hotel Onboarding API', () => {

  it('should successfully onboard a new hotel and provision tenant DB', async () => {
    const res = await request(app)
      .post('/api/v1/provisioning/onboard')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        property_name: 'Grand Test Hotel',
        address: '789 Ocean Drive',
        city: 'Miami'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('hotelId');
    expect(res.body.data.role).toBe(ROLES.HOTEL_ADMIN);

    const hotelId = res.body.data.hotelId;

    // Verify Platform Hotel Record
    const hotelRecord = await Hotel.findById(hotelId);
    expect(hotelRecord).not.toBeNull();
    expect(hotelRecord.property_name).toBe('Grand Test Hotel');
    expect(hotelRecord.tenant_db_name).toBe(`hotel_${hotelId}`);

    // Verify Account Updates
    const updatedAccount = await Account.findById(adminAccount._id);
    expect(updatedAccount.hotelId.toString()).toBe(hotelId);
    expect(updatedAccount.role).toBe(ROLES.HOTEL_ADMIN);

    // Verify Tenant Database Provisioning
    const tenantConn = await getHotelConnection(hotelId);
    const HotelProfile = tenantConn.model('HotelProfile');
    const profile = await HotelProfile.findOne();
    expect(profile).not.toBeNull();
    expect(profile.property_name).toBe('Grand Test Hotel');
  });

  it('should prevent onboarding if user is already associated with a hotel', async () => {
    const res = await request(app)
      .post('/api/v1/provisioning/onboard')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        property_name: 'Another Hotel',
        address: '123 Fake St',
        city: 'Nowhere'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('already associated');
  });

  it('should handle concurrent onboarding requests from the same account safely', async () => {
    const email = randomEmail('concurrent');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Concurrent User',
      email,
      phone: randomPhone(),
      password: 'Password123!',
      role: ROLES.HOTEL_USER
    });
    const login = await request(app).post('/api/v1/auth/login').send({ email, password: 'Password123!' });
    const concToken = login.body.data.accessToken;

    const payload = { property_name: 'Concurrent Hotel', address: '101 Parallel Rd', city: 'Lahore' };

    const [res1, res2] = await Promise.all([
      request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${concToken}`).send(payload),
      request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${concToken}`).send(payload),
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses[0]).toBe(201);
    expect([400, 409]).toContain(statuses[1]);

    const userAccount = await Account.findOne({ email });
    expect(userAccount.hotelId).not.toBeNull();
    
    const countHotels = await Hotel.countDocuments({ ownerId: userAccount._id });
    expect(countHotels).toBe(1);
  });

  it('should return 400 for invalid onboarding payload', async () => {
    const res = await request(app)
      .post('/api/v1/provisioning/onboard')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({
        property_name: 'Sh',
        city: 'City'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should prevent unauthenticated access', async () => {
    const res = await request(app)
      .post('/api/v1/provisioning/onboard')
      .send({
        property_name: 'Hacker Hotel',
        address: '123 Fake St',
        city: 'Nowhere'
      });

    expect(res.status).toBe(401);
  });
});
