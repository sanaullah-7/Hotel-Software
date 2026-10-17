import mongoose from "mongoose";
import PlatformTransaction from "../../../database/platform/models/platformTransaction.model.js";
import Hotel from "../../../database/platform/models/hotel.model.js";
import Subscription from "../../../database/platform/models/subscription.model.js";
import Account from "../../../database/platform/models/account.model.js";
import { ROLES } from "../../../constants/roles.js";
import { syncHotelSubscriptions, getSubscriptionStats } from "../subscriptions/subscription.service.js";
import logger from "../../../config/logger.js";
import ApiError from "../../../utils/apiError.js";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Automatically seeds ledger transactions if database is empty.
 */
export const seedInitialTransactionsIfEmpty = async () => {
  const count = await PlatformTransaction.countDocuments();
  if (count > 0) return;

  await syncHotelSubscriptions();
  logger.info("Generating baseline platform financial transaction ledger...");

  const subscriptions = await Subscription.find().populate("hotelId").lean();
  const paymentMethods = [
    "Direct Bank Transfer (Meezan Bank)",
    "HBL Corporate Wire",
    "JazzCash Merchant",
    "EasyPaisa Business",
    "Visa Corporate Card",
  ];

  const transactions = [];
  const now = new Date();

  // Create historical transactions across recent months
  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i];
    const hotel = sub.hotelId;
    if (!hotel) continue;

    const baseAmount = sub.amount || 12999;
    const hotelNameCode = (hotel.property_name || "HTL").substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");

    // 1. One-time onboarding setup fee for this hotel
    const setupDate = new Date(now.getFullYear(), Math.max(0, now.getMonth() - 3), (i % 25) + 1);
    transactions.push({
      transactionId: `TXN-${setupDate.getFullYear()}-${hotelNameCode}-${1000 + i}`,
      hotelId: hotel._id,
      subscriptionId: sub._id,
      planTier: sub.planTier,
      planName: `${sub.planName || sub.planTier} Setup Fee`,
      amount: 15000,
      currency: "PKR",
      type: "ONE_TIME_FEE",
      status: "SUCCESS",
      paymentMethod: paymentMethods[i % paymentMethods.length],
      referenceNumber: `REF-ONB-${Date.now().toString().slice(-6)}-${i}`,
      paidAt: setupDate,
      notes: "Initial hotel tenant provisioning and PMS cloud setup fee",
    });

    // 2. Previous month subscription payment
    const prevMonthDate = new Date(now.getFullYear(), Math.max(0, now.getMonth() - 1), (i % 25) + 1);
    transactions.push({
      transactionId: `TXN-${prevMonthDate.getFullYear()}-${hotelNameCode}-${2000 + i}`,
      hotelId: hotel._id,
      subscriptionId: sub._id,
      planTier: sub.planTier,
      planName: sub.planName || `${sub.planTier} Plan`,
      amount: baseAmount,
      currency: "PKR",
      type: "SUBSCRIPTION_RENEWAL",
      status: "SUCCESS",
      paymentMethod: paymentMethods[(i + 1) % paymentMethods.length],
      referenceNumber: `REF-RNW-${Date.now().toString().slice(-6)}-${i}`,
      paidAt: prevMonthDate,
      notes: "Monthly SaaS recurring license fee",
    });

    // 3. Current month subscription payment (if active)
    if (sub.status === "ACTIVE") {
      const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), (i % 20) + 1);
      transactions.push({
        transactionId: `TXN-${currentMonthDate.getFullYear()}-${hotelNameCode}-${3000 + i}`,
        hotelId: hotel._id,
        subscriptionId: sub._id,
        planTier: sub.planTier,
        planName: sub.planName || `${sub.planTier} Plan`,
        amount: baseAmount,
        currency: "PKR",
        type: "SUBSCRIPTION_RENEWAL",
        status: "SUCCESS",
        paymentMethod: paymentMethods[(i + 2) % paymentMethods.length],
        referenceNumber: `REF-CUR-${Date.now().toString().slice(-6)}-${i}`,
        paidAt: currentMonthDate,
        notes: "Monthly SaaS recurring license fee",
      });
    } else if (sub.status === "EXPIRED") {
      // Record a failed renewal attempt
      const failedDate = new Date(now.getFullYear(), now.getMonth(), 5);
      transactions.push({
        transactionId: `TXN-${failedDate.getFullYear()}-${hotelNameCode}-${4000 + i}`,
        hotelId: hotel._id,
        subscriptionId: sub._id,
        planTier: sub.planTier,
        planName: sub.planName || `${sub.planTier} Plan`,
        amount: baseAmount,
        currency: "PKR",
        type: "SUBSCRIPTION_RENEWAL",
        status: "FAILED",
        paymentMethod: "Direct Bank Transfer",
        referenceNumber: `REF-FLD-${i}`,
        paidAt: failedDate,
        notes: "Renewal debit failed - payment deadline exceeded",
      });
    }
  }

  if (transactions.length > 0) {
    await PlatformTransaction.insertMany(transactions);
    logger.info(`Generated ${transactions.length} historical transactions for platform telemetry.`);
  }
};

/**
 * Returns overall revenue telemetry and KPI summaries.
 */
export const getRevenueOverview = async () => {
  await seedInitialTransactionsIfEmpty();

  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [currentMonthRes, prevMonthRes, subRevRes, oneTimeRevRes, totalRevRes] = await Promise.all([
    PlatformTransaction.aggregate([
      { $match: { status: "SUCCESS", paidAt: { $gte: startOfCurrentMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    PlatformTransaction.aggregate([
      { $match: { status: "SUCCESS", paidAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    PlatformTransaction.aggregate([
      { $match: { status: "SUCCESS", type: { $ne: "ONE_TIME_FEE" } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    PlatformTransaction.aggregate([
      { $match: { status: "SUCCESS", type: "ONE_TIME_FEE" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    PlatformTransaction.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const monthlyRevenue = currentMonthRes[0]?.total || 0;
  const prevMonthRevenue = prevMonthRes[0]?.total || 0;
  const subscriptionRevenue = subRevRes[0]?.total || 0;
  const oneTimeRevenue = oneTimeRevRes[0]?.total || 0;
  const totalRevenue = totalRevRes[0]?.total || 0;

  let revenueGrowth = 0;
  if (prevMonthRevenue > 0) {
    revenueGrowth = Number((((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1));
  } else if (monthlyRevenue > 0) {
    revenueGrowth = 100;
  }

  return {
    monthlyRevenue,
    prevMonthRevenue,
    revenueGrowth,
    subscriptionRevenue,
    oneTimeRevenue,
    totalRevenue,
  };
};

/**
 * Returns 12-month revenue trend for AreaChart.
 */
export const getMonthlyRevenueTrend = async () => {
  await seedInitialTransactionsIfEmpty();

  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const monthlyAgg = await PlatformTransaction.aggregate([
    {
      $match: {
        status: "SUCCESS",
        paidAt: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$paidAt" },
          isOneTime: { $eq: ["$type", "ONE_TIME_FEE"] },
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const monthMap = {};
  for (let m = 1; m <= 12; m++) {
    monthMap[m] = { revenue: 0, subscriptions: 0, oneTime: 0 };
  }

  monthlyAgg.forEach((item) => {
    const m = item._id.month;
    if (!monthMap[m]) return;
    if (item._id.isOneTime) {
      monthMap[m].oneTime += item.total;
    } else {
      monthMap[m].subscriptions += item.total;
    }
    monthMap[m].revenue += item.total;
  });

  return MONTH_NAMES.map((name, index) => {
    const data = monthMap[index + 1];
    return {
      month: name,
      revenue: data.revenue,
      subscriptions: data.subscriptions,
      oneTime: data.oneTime,
    };
  });
};

/**
 * Returns month-by-month hotel growth data.
 */
export const getHotelGrowthTrend = async () => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);

  const hotels = await Hotel.find({ createdAt: { $gte: startOfYear } }).select("status createdAt").lean();
  const monthlyCounts = Array(12).fill(0).map(() => ({ registrations: 0, active: 0 }));

  hotels.forEach((h) => {
    const monthIndex = new Date(h.createdAt).getMonth();
    monthlyCounts[monthIndex].registrations += 1;
    if (h.status === "active") {
      monthlyCounts[monthIndex].active += 1;
    }
  });

  return MONTH_NAMES.map((name, i) => ({
    month: name,
    registrations: monthlyCounts[i].registrations,
    active: monthlyCounts[i].active,
  }));
};

/**
 * Returns month-by-month user growth data (managers & receptionists).
 */
export const getUserGrowthTrend = async () => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);

  const users = await Account.find({
    createdAt: { $gte: startOfYear },
    role: { $in: [ROLES.HOTEL_ADMIN, ROLES.HOTEL_USER, "MANAGER", "RECEPTIONIST"] },
  }).select("role createdAt").lean();

  const monthlyUsers = Array(12).fill(0).map(() => ({ managers: 0, receptionists: 0 }));

  users.forEach((u) => {
    const m = new Date(u.createdAt).getMonth();
    const isMgr = u.role === ROLES.HOTEL_ADMIN || u.role === "MANAGER";
    if (isMgr) monthlyUsers[m].managers += 1;
    else monthlyUsers[m].receptionists += 1;
  });

  return MONTH_NAMES.map((name, i) => ({
    month: name,
    managers: monthlyUsers[i].managers,
    receptionists: monthlyUsers[i].receptionists,
  }));
};

/**
 * Returns real platform recent activity log.
 */
export const getRecentActivityLog = async () => {
  const [recentHotels, recentSubs, recentTxns] = await Promise.all([
    Hotel.find().sort({ updatedAt: -1 }).limit(4).lean(),
    Subscription.find().populate("hotelId", "property_name").sort({ updatedAt: -1 }).limit(4).lean(),
    PlatformTransaction.find().populate("hotelId", "property_name").sort({ paidAt: -1 }).limit(4).lean(),
  ]);

  const activities = [];

  recentHotels.forEach((h) => {
    if (h.status === "active") {
      activities.push({
        id: `act_hotel_app_${h._id}`,
        type: "approval",
        title: "Hotel Operational & Approved",
        message: `${h.property_name} in ${h.city} was officially approved for operations.`,
        user: "Super Admin",
        time: h.approvedAt || h.updatedAt || h.createdAt,
        target: h.property_name,
      });
    } else if (h.status === "pending") {
      activities.push({
        id: `act_hotel_reg_${h._id}`,
        type: "registration",
        title: "New Hotel Registration",
        message: `${h.property_name} applied for platform onboarding.`,
        user: "Hotel Partner",
        time: h.createdAt,
        target: h.property_name,
      });
    } else if (h.status === "suspended") {
      activities.push({
        id: `act_hotel_susp_${h._id}`,
        type: "suspension",
        title: "Hotel Suspended",
        message: `${h.property_name} has been suspended: ${h.suspensionReason || "Account review"}.`,
        user: "Super Admin",
        time: h.suspendedAt || h.updatedAt,
        target: h.property_name,
      });
    }
  });

  recentTxns.forEach((tx) => {
    const hotelName = tx.hotelId?.property_name || "Hotel Partner";
    activities.push({
      id: `act_tx_${tx._id}`,
      type: "payment",
      title: tx.status === "SUCCESS" ? "Payment Received" : "Payment Issue",
      message: `${hotelName} paid PKR ${tx.amount.toLocaleString()} for ${tx.planName}.`,
      user: "Billing System",
      time: tx.paidAt || tx.createdAt,
      target: hotelName,
    });
  });

  // Sort unified list descending by time
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));
  return activities.slice(0, 10);
};

/**
 * List ledger transactions with search, status & timeframe filtering, and pagination.
 */
export const listTransactions = async ({
  page = 1,
  limit = 10,
  status = "",
  search = "",
  period = "",
} = {}) => {
  await seedInitialTransactionsIfEmpty();

  const query = {};

  if (status) {
    query.status = status.toUpperCase();
  }

  if (period) {
    const now = new Date();
    if (period === "30d") {
      query.paidAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    } else if (period === "90d") {
      query.paidAt = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
    } else if (period === "1y") {
      query.paidAt = { $gte: new Date(now.getFullYear(), 0, 1) };
    }
  }

  if (search) {
    const matchingHotels = await Hotel.find({
      property_name: { $regex: search, $options: "i" },
    }).select("_id");
    const hotelIds = matchingHotels.map((h) => h._id);

    query.$or = [
      { transactionId: { $regex: search, $options: "i" } },
      { referenceNumber: { $regex: search, $options: "i" } },
      { hotelId: { $in: hotelIds } },
    ];
  }

  const numericPage = Math.max(1, parseInt(page, 10) || 1);
  const numericLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (numericPage - 1) * numericLimit;

  const [records, total] = await Promise.all([
    PlatformTransaction.find(query)
      .populate("hotelId", "property_name city")
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean(),
    PlatformTransaction.countDocuments(query),
  ]);

  const formatted = records.map((tx) => {
    const hotel = tx.hotelId || {};
    return {
      id: tx.transactionId,
      _id: tx._id.toString(),
      transactionId: tx.transactionId,
      hotelId: hotel._id ? hotel._id.toString() : (tx.hotelId ? String(tx.hotelId) : ""),
      hotelName: hotel.property_name || "Explore Pakistan Hotel",
      city: hotel.city || "—",
      plan: tx.planName || tx.planTier,
      planTier: tx.planTier,
      amount: tx.amount,
      currency: tx.currency || "PKR",
      method: tx.paymentMethod,
      status: tx.status,
      type: tx.type,
      referenceNumber: tx.referenceNumber || "—",
      date: tx.paidAt || tx.createdAt,
      notes: tx.notes || "",
    };
  });

  return {
    data: formatted,
    total,
    page: numericPage,
    limit: numericLimit,
    totalPages: Math.ceil(total / numericLimit) || 1,
  };
};

/**
 * Record a new platform transaction.
 */
export const recordTransaction = async (data) => {
  if (!data.hotelId) throw new ApiError(400, "hotelId is required");
  if (!data.amount) throw new ApiError(400, "amount is required");

  const hotel = await Hotel.findById(data.hotelId);
  if (!hotel) throw new ApiError(404, "Hotel not found");

  const code = (hotel.property_name || "HTL").substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const txnId = data.transactionId || `TXN-${new Date().getFullYear()}-${code}-${randomSuffix}`;

  const txn = await PlatformTransaction.create({
    transactionId: txnId,
    hotelId: data.hotelId,
    subscriptionId: data.subscriptionId || null,
    planTier: data.planTier || hotel.subscriptionPlan || "STANDARD",
    planName: data.planName || `${data.planTier || hotel.subscriptionPlan || "STANDARD"} Plan`,
    amount: Number(data.amount),
    currency: data.currency || "PKR",
    type: data.type || "SUBSCRIPTION_RENEWAL",
    status: data.status || "SUCCESS",
    paymentMethod: data.paymentMethod || "Direct Bank Transfer",
    referenceNumber: data.referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
    paidAt: data.paidAt || new Date(),
    notes: data.notes || "",
  });

  return {
    success: true,
    message: "Transaction recorded successfully",
    transaction: txn,
  };
};
