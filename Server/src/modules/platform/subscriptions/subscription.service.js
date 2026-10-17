import mongoose from "mongoose";
import SubscriptionPlan from "../../../database/platform/models/subscriptionPlan.model.js";
import Subscription from "../../../database/platform/models/subscription.model.js";
import Hotel from "../../../database/platform/models/hotel.model.js";
import ApiError from "../../../utils/apiError.js";
import logger from "../../../config/logger.js";

const DEFAULT_PLANS = [
  {
    tier: "BASIC",
    name: "Basic Starter",
    price: 4999,
    billingPeriod: "month",
    maxRooms: 20,
    maxStaff: 5,
    features: [
      "Up to 20 rooms",
      "Basic guest registration",
      "Standard daily reports",
      "Email support",
    ],
    isPopular: false,
    isActive: true,
  },
  {
    tier: "PRO",
    name: "Business Pro",
    price: 12999,
    billingPeriod: "month",
    maxRooms: 100,
    maxStaff: 25,
    features: [
      "Up to 100 rooms",
      "Multi-user receptionist logins",
      "Advanced financial analytics",
      "Export to Excel / PDF",
      "Priority WhatsApp support",
    ],
    isPopular: true,
    isActive: true,
  },
  {
    tier: "PREMIUM",
    name: "Premium Suite",
    price: 19999,
    billingPeriod: "month",
    maxRooms: 250,
    maxStaff: 50,
    features: [
      "Up to 250 rooms",
      "Full analytics & reports",
      "Unlimited staff logins",
      "Custom guest portal",
      "Priority 24/7 SLA",
    ],
    isPopular: false,
    isActive: true,
  },
  {
    tier: "ENTERPRISE",
    name: "Enterprise Elite",
    price: 29999,
    billingPeriod: "month",
    maxRooms: 1000,
    maxStaff: 200,
    features: [
      "Unlimited rooms & branches",
      "Custom roles & permissions",
      "Real-time multi-branch sync",
      "Dedicated account manager",
      "24/7 Phone & on-site support",
      "API Integrations",
    ],
    isPopular: false,
    isActive: true,
  },
];

/**
 * Ensures default platform plans exist in MongoDB.
 */
export const seedDefaultPlansIfEmpty = async () => {
  const count = await SubscriptionPlan.countDocuments();
  if (count === 0) {
    logger.info("Seeding default subscription tiers into platform database...");
    await SubscriptionPlan.insertMany(DEFAULT_PLANS);
  }
};

/**
 * Ensures all approved/active hotels in the database have a live Subscription record.
 */
export const syncHotelSubscriptions = async () => {
  await seedDefaultPlansIfEmpty();
  const hotels = await Hotel.find({ status: { $in: ["active", "pending"] } }).lean();
  const existingSubs = await Subscription.find().lean();
  const subscribedHotelIds = new Set(existingSubs.map((s) => s.hotelId.toString()));

  const plans = await SubscriptionPlan.find().lean();
  const planMap = new Map();
  plans.forEach((p) => planMap.set(p.tier.toUpperCase(), p));

  const newSubscriptions = [];
  for (const hotel of hotels) {
    if (!subscribedHotelIds.has(hotel._id.toString())) {
      let tier = (hotel.subscriptionPlan || "STANDARD").toUpperCase();
      // Map STANDARD to PRO if STANDARD tier plan is absent
      if (!planMap.has(tier) && planMap.has("PRO")) {
        tier = "PRO";
      }
      const matchedPlan = planMap.get(tier) || plans[0];
      const isPending = hotel.status === "pending";

      newSubscriptions.push({
        hotelId: hotel._id,
        planId: matchedPlan ? matchedPlan._id : null,
        planTier: matchedPlan ? matchedPlan.tier : tier,
        planName: matchedPlan ? matchedPlan.name : `${tier} Plan`,
        amount: matchedPlan ? matchedPlan.price : 9999,
        billingPeriod: matchedPlan ? matchedPlan.billingPeriod : "month",
        status: isPending ? "TRIAL" : "ACTIVE",
        startDate: hotel.createdAt || new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMethod: isPending ? "Pending Verification" : "Direct Bank Transfer",
        autoRenew: true,
      });
    }
  }

  if (newSubscriptions.length > 0) {
    await Subscription.insertMany(newSubscriptions);
    logger.info(`Synchronized ${newSubscriptions.length} new hotel subscription agreements.`);
  }
};

/**
 * Get all available plans along with live subscriber count.
 */
export const getPlans = async () => {
  await seedDefaultPlansIfEmpty();
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 }).lean();
  
  // Compute active subscribers count per plan tier
  const activeSubsByTier = await Subscription.aggregate([
    { $match: { status: "ACTIVE" } },
    { $group: { _id: "$planTier", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  activeSubsByTier.forEach((item) => {
    countMap[item._id] = item.count;
  });

  return plans.map((p) => ({
    id: p._id.toString(),
    _id: p._id.toString(),
    name: p.name,
    tier: p.tier,
    price: p.price,
    billingPeriod: p.billingPeriod,
    maxRooms: p.maxRooms,
    maxStaff: p.maxStaff,
    features: p.features || [],
    isPopular: p.isPopular || false,
    activeSubscribers: countMap[p.tier] || 0,
  }));
};

/**
 * Get a single plan by ID.
 */
export const getPlanById = async (id) => {
  const plan = await SubscriptionPlan.findById(id).lean();
  if (!plan) throw new ApiError(404, "Subscription plan not found");
  return {
    id: plan._id.toString(),
    _id: plan._id.toString(),
    ...plan,
  };
};

/**
 * Update an existing subscription plan's pricing, rooms, or features.
 */
export const updatePlan = async (id, data) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(
    id,
    { $set: data },
    { returnDocument: "after", runValidators: true }
  ).lean();

  if (!plan) throw new ApiError(404, "Subscription plan not found");
  return {
    id: plan._id.toString(),
    _id: plan._id.toString(),
    ...plan,
  };
};

/**
 * Lists subscriptions with search, status & plan filters, and pagination.
 */
export const listSubscriptions = async ({
  page = 1,
  limit = 10,
  status = "",
  plan = "",
  search = "",
} = {}) => {
  await syncHotelSubscriptions();

  const query = {};

  if (status) {
    query.status = status.toUpperCase();
  }

  if (plan) {
    // If plan is an ID or tier code
    if (mongoose.Types.ObjectId.isValid(plan)) {
      query.planId = plan;
    } else {
      const cleanTier = plan.replace(/^plan_/, "").toUpperCase();
      query.planTier = cleanTier;
    }
  }

  if (search) {
    const matchingHotels = await Hotel.find({
      property_name: { $regex: search, $options: "i" },
    }).select("_id");
    const hotelIds = matchingHotels.map((h) => h._id);
    query.hotelId = { $in: hotelIds };
  }

  const numericPage = Math.max(1, parseInt(page, 10) || 1);
  const numericLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (numericPage - 1) * numericLimit;

  const [subscriptions, total] = await Promise.all([
    Subscription.find(query)
      .populate("hotelId", "property_name city email phone status")
      .populate("planId", "name tier price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean(),
    Subscription.countDocuments(query),
  ]);

  const formattedData = subscriptions.map((sub) => {
    const hotel = sub.hotelId || {};
    return {
      id: sub._id.toString(),
      _id: sub._id.toString(),
      hotelId: hotel._id ? hotel._id.toString() : (sub.hotelId ? String(sub.hotelId) : ""),
      hotelName: hotel.property_name || "Explore Pakistan Hotel",
      city: hotel.city || "—",
      planId: sub.planId?._id ? sub.planId._id.toString() : `plan_${sub.planTier.toLowerCase()}`,
      planTier: sub.planTier,
      planName: sub.planName || (sub.planId?.name ? sub.planId.name : `${sub.planTier} Plan`),
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      amount: sub.amount,
      billingPeriod: sub.billingPeriod,
      paymentMethod: sub.paymentMethod || "Direct Bank Transfer",
      autoRenew: sub.autoRenew,
    };
  });

  return {
    data: formattedData,
    total,
    page: numericPage,
    limit: numericLimit,
    totalPages: Math.ceil(total / numericLimit) || 1,
  };
};

/**
 * Returns KPI metrics and plan distribution for subscriptions.
 */
export const getSubscriptionStats = async () => {
  await syncHotelSubscriptions();

  const [activeCount, trialCount, expiredCount, suspendedCount, activeRevenue, tierBreakdown] =
    await Promise.all([
      Subscription.countDocuments({ status: "ACTIVE" }),
      Subscription.countDocuments({ status: "TRIAL" }),
      Subscription.countDocuments({ status: "EXPIRED" }),
      Subscription.countDocuments({ status: "SUSPENDED" }),
      Subscription.aggregate([
        { $match: { status: "ACTIVE" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Subscription.aggregate([
        { $group: { _id: "$planTier", count: { $sum: 1 } } },
      ]),
    ]);

  const colorMap = {
    ENTERPRISE: "#6366f1",
    PRO: "#8b5cf6",
    PREMIUM: "#ec4899",
    BASIC: "#06b6d4",
    STANDARD: "#10b981",
  };

  const nameMap = {
    ENTERPRISE: "Enterprise Elite",
    PRO: "Business Pro",
    PREMIUM: "Premium Suite",
    BASIC: "Basic Starter",
    STANDARD: "Standard Tier",
  };

  const distribution = tierBreakdown.map((t) => ({
    name: nameMap[t._id] || t._id,
    value: t.count,
    color: colorMap[t._id] || "#3b82f6",
  }));

  return {
    active: activeCount,
    trial: trialCount,
    expired: expiredCount,
    suspended: suspendedCount,
    totalRevenueMonthly: activeRevenue[0]?.total || 0,
    distribution,
  };
};

/**
 * Update an individual subscription (status, plan, dates, payment).
 */
export const updateSubscription = async (id, updateData) => {
  const sub = await Subscription.findById(id);
  if (!sub) throw new ApiError(404, "Subscription not found");

  if (updateData.status) {
    sub.status = updateData.status.toUpperCase();
  }

  if (updateData.planTier) {
    const tier = updateData.planTier.toUpperCase();
    sub.planTier = tier;
    const plan = await SubscriptionPlan.findOne({ tier });
    if (plan) {
      sub.planId = plan._id;
      sub.planName = plan.name;
      if (!updateData.amount) sub.amount = plan.price;
    }
    // Also update hotel model if linked
    if (sub.hotelId) {
      await Hotel.findByIdAndUpdate(sub.hotelId, { subscriptionPlan: tier });
    }
  }

  if (updateData.amount !== undefined) {
    sub.amount = Number(updateData.amount);
  }

  if (updateData.endDate) {
    sub.endDate = new Date(updateData.endDate);
  }

  if (updateData.paymentMethod) {
    sub.paymentMethod = updateData.paymentMethod;
  }

  if (updateData.autoRenew !== undefined) {
    sub.autoRenew = Boolean(updateData.autoRenew);
  }

  await sub.save();

  return {
    success: true,
    message: "Subscription updated successfully",
    subscription: sub,
  };
};
