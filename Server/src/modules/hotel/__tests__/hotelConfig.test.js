import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import { connectPlatformDB } from '../../../database/platform/platformConnection.js';
import { getHotelConnection } from '../../../database/connectionManager.js';
import mongoose from 'mongoose';
import Account from '../../../database/platform/models/account.model.js';
import { ROLES } from '../../../constants/roles.js';
import { getModel } from '../../../database/hotel/modelFactory.js';
import crypto from 'crypto';

const randomEmail = (prefix = 'hcfg') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('Phase 2: Hotel Configuration', () => {
  let platformConnection;
  let hotelConnection;
  let token;
  let hotelId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    platformConnection = await connectPlatformDB();
    hotelConnection = await getHotelConnection(hotelId);

    const email = randomEmail('admin');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Test Manager',
      email,
      phone: randomPhone(),
      password: 'password123'
    });
    
    await Account.findOneAndUpdate(
      { email },
      { role: ROLES.HOTEL_ADMIN, hotelId: hotelId }
    );

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email,
      password: 'password123'
    });
    token = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should initialize and retrieve hotel profile', async () => {
    const res = await request(app)
      .get('/api/v1/hotel/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.property_name).toBeDefined();
  });

  it('should update hotel policies', async () => {
    await request(app).get('/api/v1/hotel/policies').set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .put('/api/v1/hotel/policies')
      .set('Authorization', `Bearer ${token}`)
      .send({ check_in_time: '15:00', pet_policy: 'Allowed with fee' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.check_in_time).toBe('15:00');
  });

  it('should create and retrieve a department', async () => {
    const createRes = await request(app)
      .post('/api/v1/hotel/departments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: `HK_${crypto.randomBytes(2).toString('hex')}`,
        name: 'Housekeeping',
        description: 'Room cleaning and maintenance',
        is_active: true
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Housekeeping');

    const getRes = await request(app)
      .get('/api/v1/hotel/departments')
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
