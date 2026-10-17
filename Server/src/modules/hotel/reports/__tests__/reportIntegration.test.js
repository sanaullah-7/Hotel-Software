import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../../../app.js";
import { connectPlatformDB } from "../../../../database/platform/platformConnection.js";
import { getHotelConnection } from "../../../../database/connectionManager.js";
import Account from "../../../../database/platform/models/account.model.js";
import { ROLES } from "../../../../constants/roles.js";
import crypto from "crypto";

const randomEmail = (prefix = "rep") =>
  `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;

const randomPhone = () =>
  `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Reports & Expenses Backend Integration Suite", () => {
  let platformConnection;
  let tokenA;
  let tokenB;
  const hotelIdA = new mongoose.Types.ObjectId().toString();
  const hotelIdB = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    platformConnection = await connectPlatformDB();
    await getHotelConnection(hotelIdA);
    await getHotelConnection(hotelIdB);

    // 1. Setup Hotel A
    const emailA = randomEmail("rep_admin_a");
    const pass = "Password123!";

    await request(app).post("/api/v1/auth/register").send({
      fullName: "Report Admin A",
      email: emailA,
      phone: randomPhone(),
      password: pass,
    });
    await Account.findOneAndUpdate(
      { email: emailA },
      { role: ROLES.HOTEL_ADMIN, hotelId: hotelIdA }
    );
    const loginResA = await request(app).post("/api/v1/auth/login").send({
      email: emailA,
      password: pass,
    });
    tokenA = loginResA.body.data.accessToken;

    // 2. Setup Hotel B
    const emailB = randomEmail("rep_admin_b");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Report Admin B",
      email: emailB,
      phone: randomPhone(),
      password: pass,
    });
    await Account.findOneAndUpdate(
      { email: emailB },
      { role: ROLES.HOTEL_ADMIN, hotelId: hotelIdB }
    );
    const loginResB = await request(app).post("/api/v1/auth/login").send({
      email: emailB,
      password: pass,
    });
    tokenB = loginResB.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("1. Authentication & Tenant Authorization", () => {
    it("should reject unauthenticated requests to /reports with 401", async () => {
      const res = await request(app).get("/api/v1/hotel/reports/revenue");
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated requests to /expenses with 401", async () => {
      const res = await request(app).get("/api/v1/hotel/expenses");
      expect(res.status).toBe(401);
    });
  });

  describe("2. Clean Empty Database Behavior", () => {
    it("should return empty expenses array with total 0 for fresh tenant", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/expenses")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.expenses).toEqual([]);
    });

    it("should return safe zero-based revenue report without NaN or division by zero", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/reports/revenue")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpi.totalRevenue).toBe(0);
      expect(res.body.data.kpi.adr).toBe(0);
      expect(res.body.data.kpi.revPar).toBe(0);
      expect(res.body.data.kpi.grossMargin).toBe(0);
      expect(res.body.data.trendData).toHaveLength(12);
      expect(res.body.data.donutData).toBeDefined();
    });

    it("should return clean occupancy report for fresh tenant", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/reports/occupancy")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpi.totalRooms).toBe(0);
      expect(res.body.data.kpi.averageOccupancyRate).toBe(0);
      expect(res.body.data.trendData).toHaveLength(7);
    });

    it("should return clean expense vs revenue report for fresh tenant", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/reports/expense-vs-revenue")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpi.totalRevenueYtd).toBe(0);
      expect(res.body.data.kpi.totalExpensesYtd).toBe(0);
      expect(res.body.data.kpi.netProfit).toBe(0);
      expect(res.body.data.monthlyTrendsData).toHaveLength(12);
    });
  });

  describe("3. Expense Lifecycle & CRUD Operations", () => {
    let createdExpenseId;

    it("should create a new expense with valid payload", async () => {
      const payload = {
        invoiceNo: "INV-9901",
        expense: "HVAC Filter Replacements",
        category: "Maintenance",
        amount: 1450,
        expenseBy: "Chief Engineer",
        paymentMode: "Bank Transfer",
        paidTo: "CoolAir Solutions",
        status: "Paid",
      };

      const res = await request(app)
        .post("/api/v1/hotel/expenses")
        .set("Authorization", `Bearer ${tokenA}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe("HVAC Filter Replacements");
      expect(res.body.data.amount).toBe(1450);
      expect(res.body.data.category).toBe("Maintenance");
      expect(res.body.data.expense_by).toBe("Chief Engineer");
      expect(res.body.data.payment_method).toBe("Bank Transfer");
      expect(res.body.data.paid_to).toBe("CoolAir Solutions");
      expect(res.body.data.status).toBe("Paid");

      createdExpenseId = res.body.data._id;
    });

    it("should reject expense creation with negative amount", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/expenses")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          expense: "Invalid Expense",
          amount: -500,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should retrieve the created expense by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/expenses/${createdExpenseId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(createdExpenseId);
      expect(res.body.data.amount).toBe(1450);
    });

    it("should update expense fields", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/expenses/${createdExpenseId}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          amount: 1600,
          paidTo: "CoolAir Premium Supplies",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(1600);
      expect(res.body.data.paid_to).toBe("CoolAir Premium Supplies");
    });

    it("should list expenses and filter by search term", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/expenses?search=CoolAir")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.expenses[0]._id).toBe(createdExpenseId);
    });

    it("should return high-level expense summary", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/expenses/summary")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalAmount).toBe(1600);
      expect(res.body.data.paidCount).toBe(1);
    });

    it("should delete single expense", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/expenses/${createdExpenseId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);

      const check = await request(app)
        .get(`/api/v1/hotel/expenses/${createdExpenseId}`)
        .set("Authorization", `Bearer ${tokenA}`);
      expect(check.status).toBe(404);
    });

    it("should support bulk delete", async () => {
      const res1 = await request(app)
        .post("/api/v1/hotel/expenses")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ expense: "Supplies A", amount: 100 });

      const res2 = await request(app)
        .post("/api/v1/hotel/expenses")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ expense: "Supplies B", amount: 200 });

      const ids = [res1.body.data._id, res2.body.data._id];

      const bulkRes = await request(app)
        .post("/api/v1/hotel/expenses/bulk-delete")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ ids });

      expect(bulkRes.status).toBe(200);
      expect(bulkRes.body.data.deletedCount).toBe(2);
    });
  });

  describe("4. Dynamic Revenue and Occupancy Calculation", () => {
    it("should dynamically recalculate revenue and expense vs revenue when data exists", async () => {
      await request(app)
        .post("/api/v1/hotel/expenses")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          expense: "Annual Water Filter License",
          amount: 5000,
          category: "Utilities",
          status: "Paid",
        });

      const expVsRev = await request(app)
        .get("/api/v1/hotel/reports/expense-vs-revenue")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(expVsRev.status).toBe(200);
      expect(expVsRev.body.data.kpi.totalExpensesYtd).toBe(5000);
      expect(expVsRev.body.data.kpi.netProfit).toBe(-5000);
    });
  });

  describe("5. Tenant Isolation Verification", () => {
    it("Hotel B cannot view or modify Hotel A's expenses", async () => {
      const createA = await request(app)
        .post("/api/v1/hotel/expenses")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          expense: "Hotel A Confidential Audit",
          amount: 10000,
        });
      const idA = createA.body.data._id;

      const accessB = await request(app)
        .get(`/api/v1/hotel/expenses/${idA}`)
        .set("Authorization", `Bearer ${tokenB}`);
      expect(accessB.status).toBe(404);

      const deleteB = await request(app)
        .delete(`/api/v1/hotel/expenses/${idA}`)
        .set("Authorization", `Bearer ${tokenB}`);
      expect(deleteB.status).toBe(404);

      const listB = await request(app)
        .get("/api/v1/hotel/expenses")
        .set("Authorization", `Bearer ${tokenB}`);
      expect(listB.body.data.total).toBe(0);
    });
  });
});
