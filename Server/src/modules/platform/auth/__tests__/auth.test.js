import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../../../app.js';
import { connectPlatformDB } from '../../../../database/platform/platformConnection.js';
import mongoose from 'mongoose';
import Account from '../../../../database/platform/models/account.model.js';
import PasswordReset from '../../../../database/platform/models/passwordReset.model.js';
import { ROLES } from '../../../../constants/roles.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

let phoneSeq = Math.floor(100000000 + Math.random() * 800000000);
const randomEmail = (prefix = 'user') => `${prefix}_${crypto.randomBytes(4).toString('hex')}@hotel.com`;
const randomPhone = () => `03${phoneSeq++}`;

describe('Phase 1: Authentication & Identity', () => {
  let connection;

  beforeAll(async () => {
    connection = await connectPlatformDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Registration & Login', () => {
    it('should register a new account successfully', async () => {
      const email = randomEmail('register');
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test User',
          email,
          phone: randomPhone(),
          password: 'password123',
          role: ROLES.HOTEL_USER
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(email);
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.role).toBe(ROLES.HOTEL_USER);
    });

    it('should login and return tokens', async () => {
      const email = randomEmail('login');
      const regRes = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Test User',
        email,
        phone: randomPhone(),
        password: 'password123',
        role: ROLES.HOTEL_USER
      });
      expect(regRes.status).toBe(201);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email,
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/refreshToken=/);
    });

    it('should reject login with wrong password', async () => {
      const email = randomEmail('wrong');
      await request(app).post('/api/v1/auth/register').send({
        fullName: 'Test User',
        email,
        phone: randomPhone(),
        password: 'password123',
        role: ROLES.HOTEL_USER
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });

    it('should lock account after 5 consecutive failed login attempts', async () => {
      const email = randomEmail('lockout');
      const regRes = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Lockout User',
        email,
        phone: randomPhone(),
        password: 'password123',
        role: ROLES.HOTEL_USER
      });
      expect(regRes.status).toBe(201);

      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/v1/auth/login').send({ email, password: 'wrongpassword' });
      }

      const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'password123' });
      expect(res.status).toBe(423);
    });

    it('should prevent inactive account login', async () => {
      const email = randomEmail('banned');
      await Account.create({
        fullName: 'Banned User',
        email,
        phone: randomPhone(),
        password: await bcrypt.hash('password123', 10),
        status: 'suspended'
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email,
          password: 'password123'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('Session Management', () => {
    it('should fetch current user with /me, refresh token, and logout', async () => {
      const email = randomEmail('session');
      const regRes = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Session User',
        email,
        phone: randomPhone(),
        password: 'password123'
      });
      expect(regRes.status).toBe(201);

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email,
        password: 'password123'
      });

      expect(loginRes.status).toBe(200);
      const accessToken = loginRes.body.data.accessToken;
      const refreshTokenCookie = loginRes.headers['set-cookie'][0];

      // /me
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.email).toBe(email);

      // refresh token
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshTokenCookie);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.accessToken).toBeDefined();

      // logout
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.headers['set-cookie'][0]).toMatch(/refreshToken=;/);
    });

    it('should reject access without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject access with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer invalid.token.here`);
      expect(res.status).toBe(401);
    });
  });

  describe('Password Reset', () => {
    it('should trigger forgot password and generate hashed OTP', async () => {
      const email = randomEmail('forgot');
      const acc = await Account.create({
        fullName: 'Reset User',
        email,
        phone: randomPhone(),
        password: await bcrypt.hash('oldpassword', 10),
      });

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email });

      expect(res.status).toBe(200);

      const resets = await PasswordReset.find({ accountId: acc._id });
      expect(resets.length).toBe(1);
      expect(resets[0].isUsed).toBe(false);
    });

    it('should complete reset password flow', async () => {
      const email = randomEmail('reset');
      const acc = await Account.create({
        fullName: 'Reset User 2',
        email,
        phone: randomPhone(),
        password: await bcrypt.hash('oldpassword', 10),
      });

      const otp = '123456';
      await PasswordReset.create({
        accountId: acc._id,
        otp: await bcrypt.hash(otp, 10),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          email,
          otp,
          newPassword: 'newpassword123'
        });

      expect(res.status).toBe(200);

      // Verify new password works
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'newpassword123' });
      expect(loginRes.status).toBe(200);
    });

    it('should reject invalid OTP', async () => {
      const email = randomEmail('invalid_otp');
      const acc = await Account.create({
        fullName: 'Reset User 3',
        email,
        phone: randomPhone(),
        password: await bcrypt.hash('oldpassword', 10),
      });

      const otp = '123456';
      await PasswordReset.create({
        accountId: acc._id,
        otp: await bcrypt.hash(otp, 10),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          email,
          otp: '000000',
          newPassword: 'newpassword123'
        });

      expect(res.status).toBe(400);
    });
  });
});
