import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";

const randomEmail = (prefix = "dash") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 1: Dashboard Metrics Authoritative Endpoint", () => {
  let adminToken;
  let hotelId;

  beforeAll(async () => {
    await connectPlatformDB();

    const email = randomEmail("admin");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Dashboard Admin",
      email,
      phone: randomPhone(),
      password: "Password123!",
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123!",
    });
    const tempToken = loginRes.body.data.accessToken;

    const onboardRes = await request(app)
      .post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempToken}`)
      .send({
        property_name: "Dashboard Test Resort",
        address: "77 Hill Road",
        city: "Murree",
      });
    hotelId = onboardRes.body.data.hotelId;

    const relogin = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123!",
    });
    adminToken = relogin.body.data.accessToken;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  it("GET /api/v1/hotel/dashboard/metrics — rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/hotel/dashboard/metrics");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/hotel/dashboard/metrics — returns live structured metrics for authenticated hotel", async () => {
    const res = await request(app)
      .get("/api/v1/hotel/dashboard/metrics")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(typeof data.today_reservations).toBe("number");
    expect(typeof data.today_check_ins).toBe("number");
    expect(typeof data.today_check_outs).toBe("number");
    expect(typeof data.occupied_rooms).toBe("number");
    expect(typeof data.available_rooms).toBe("number");
    expect(typeof data.total_rooms).toBe("number");
    expect(typeof data.today_revenue).toBe("number");
    expect(typeof data.payments_today_count).toBe("number");
    expect(typeof data.outstanding_dues).toBe("number");
  });
});
