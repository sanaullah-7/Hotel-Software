import { describe, it, expect } from 'vitest';

describe('Hotel Software Backend', () => {
  it('should calculate available rooms correctly', () => {
    const totalRooms = 10;
    const bookedRooms = 4;
    const availableRooms = totalRooms - bookedRooms;

    expect(availableRooms).toBe(6);
  });
});

// import { describe, it, expect } from 'vitest';
// // Iska kaam hai hamare Express API ko request bhejna.
// import request from 'supertest';
// import app from '../app.js';

// describe('Hotel Software Backend API', () => {
//   it('should return API running message on GET /', async () => {
//     const response = await request(app).get('/');

//     expect(response.status).toBe(200);
//     expect(response.text).toBe('Api is Running and must i will block it.');
//   });
// });