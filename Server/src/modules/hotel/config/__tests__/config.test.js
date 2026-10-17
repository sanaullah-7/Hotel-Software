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

const randomEmail = (prefix = 'cfg') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('Phase 2: Hotel Configuration & Tenancy', () => {
  let adminTokenA, adminTokenB, userTokenA;
  let hotelA, hotelB;

  beforeAll(async () => {
    await connectPlatformDB();

    // Hotel A Setup
    const emailA = randomEmail('adminA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Admin A', email: emailA, phone: randomPhone(), password: 'password123', role: ROLES.HOTEL_USER
    });
    const loginA = await request(app).post('/api/v1/auth/login').send({ email: emailA, password: 'password123' });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post('/api/v1/provisioning/onboard').set('Authorization', `Bearer ${tempTokenA}`).send({
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

    // Hotel A Standard User Setup
    const emailUserA = randomEmail('userA');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'User A', email: emailUserA, phone: randomPhone(), password: 'password123', role: ROLES.HOTEL_USER
    });
    await Account.findOneAndUpdate({ email: emailUserA }, { hotelId: hotelA, role: ROLES.HOTEL_USER });
    const loginUserA = await request(app).post('/api/v1/auth/login').send({ email: emailUserA, password: 'password123' });
    userTokenA = loginUserA.body.data.accessToken;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await mongoose.connection.close();
  });

  describe('Hotel Profile', () => {
    it('should auto-create and fetch default profile if missing', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/profile')
        .set('Authorization', `Bearer ${adminTokenA}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.property_name).toBeDefined();
    });

    it('should update hotel profile', async () => {
      const res = await request(app)
        .put('/api/v1/hotel/profile')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ property_name: 'Updated Hotel A', city: 'New City' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.property_name).toBe('Updated Hotel A');
    });

    it('should reject standard users from updating profile', async () => {
      const res = await request(app)
        .put('/api/v1/hotel/profile')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ property_name: 'Hacked Hotel' });
      
      expect(res.status).toBe(403);
    });

    it('should isolate tenant profile data', async () => {
      await request(app).put('/api/v1/hotel/profile').set('Authorization', `Bearer ${adminTokenA}`).send({ property_name: 'Strict Hotel A' });
      await request(app).put('/api/v1/hotel/profile').set('Authorization', `Bearer ${adminTokenB}`).send({ property_name: 'Strict Hotel B' });

      const resA = await request(app).get('/api/v1/hotel/profile').set('Authorization', `Bearer ${adminTokenA}`);
      const resB = await request(app).get('/api/v1/hotel/profile').set('Authorization', `Bearer ${adminTokenB}`);

      expect(resA.body.data.property_name).toBe('Strict Hotel A');
      expect(resB.body.data.property_name).toBe('Strict Hotel B');
    });
  });

  describe('Hotel Policies', () => {
    it('should auto-create and fetch default policies if missing', async () => {
      const res = await request(app)
        .get('/api/v1/hotel/policies')
        .set('Authorization', `Bearer ${adminTokenA}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.check_in_time).toBeDefined();
    });

    it('should update hotel policies', async () => {
      const res = await request(app)
        .put('/api/v1/hotel/policies')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ check_in_time: '15:00', pets_allowed: true });
      
      expect(res.status).toBe(200);
      expect(res.body.data.check_in_time).toBe('15:00');
      expect(res.body.data.pets_allowed).toBe(true);
    });

    it('should isolate tenant policies data', async () => {
      await request(app).put('/api/v1/hotel/policies').set('Authorization', `Bearer ${adminTokenA}`).send({ check_in_time: '10:00' });
      await request(app).put('/api/v1/hotel/policies').set('Authorization', `Bearer ${adminTokenB}`).send({ check_in_time: '20:00' });

      const resA = await request(app).get('/api/v1/hotel/policies').set('Authorization', `Bearer ${adminTokenA}`);
      const resB = await request(app).get('/api/v1/hotel/policies').set('Authorization', `Bearer ${adminTokenB}`);

      expect(resA.body.data.check_in_time).toBe('10:00');
      expect(resB.body.data.check_in_time).toBe('20:00');
    });

    it('should validate time format', async () => {
      const res = await request(app)
        .put('/api/v1/hotel/policies')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .send({ check_in_time: '25:00' });
      
      expect(res.status).toBe(400);
    });
  });
});
