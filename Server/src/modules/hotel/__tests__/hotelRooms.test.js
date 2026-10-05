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

const randomEmail = (prefix = 'hrooms') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe('Phase 3: Hotel Rooms & Amenities', () => {
  let platformConnection;
  let hotelConnection;
  let token;
  let hotelId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    platformConnection = await connectPlatformDB();
    hotelConnection = await getHotelConnection(hotelId);

    const email = randomEmail('mgr');
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'Rooms Manager',
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

  it('should create and retrieve amenities', async () => {
    const res = await request(app)
      .post('/api/v1/hotel/amenities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: `Free Wi-Fi ${crypto.randomBytes(2).toString('hex')}`,
        category: 'Room',
        description: 'High speed internet'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const getRes = await request(app)
      .get('/api/v1/hotel/amenities')
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should create a room type and then a room', async () => {
    const amenityRes = await request(app)
      .post('/api/v1/hotel/amenities')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `TV_${crypto.randomBytes(2).toString('hex')}`, category: 'Room' });

    expect(amenityRes.status).toBe(201);
    const amenityId = amenityRes.body.data._id;
    const roomTypeCode = `DLX_${crypto.randomBytes(2).toString('hex')}`.toUpperCase();

    const rtRes = await request(app)
      .post('/api/v1/hotel/room-types')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: roomTypeCode,
        name: 'Deluxe Room',
        base_occupancy: 2,
        max_occupancy: 3,
        base_price: 150,
        amenities: [{ amenity_id: amenityId }]
      });

    expect(rtRes.status).toBe(201);
    const roomTypeId = rtRes.body.data._id;
    const roomNumber = `${Math.floor(100 + Math.random() * 899)}`;

    const roomRes = await request(app)
      .post('/api/v1/hotel/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        room_number: roomNumber,
        room_type_id: roomTypeId,
        floor: '1',
        status: 'AVAILABLE',
        housekeeping_status: 'CLEAN'
      });

    expect(roomRes.status).toBe(201);
    expect(roomRes.body.data.room_number).toBe(roomNumber);

    const getRooms = await request(app)
      .get('/api/v1/hotel/rooms')
      .set('Authorization', `Bearer ${token}`);

    expect(getRooms.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
