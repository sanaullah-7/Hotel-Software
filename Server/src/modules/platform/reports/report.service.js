import Hotel from "../../../database/platform/models/hotel.model.js";
import Subscription from "../../../database/platform/models/subscription.model.js";
import PlatformTransaction from "../../../database/platform/models/platformTransaction.model.js";
import Account from "../../../database/platform/models/account.model.js";
import { ROLES } from "../../../constants/roles.js";
import {
  getHotelGrowthTrend,
  getUserGrowthTrend,
  getMonthlyRevenueTrend,
  seedInitialTransactionsIfEmpty,
} from "../finance/finance.service.js";
import { syncHotelSubscriptions } from "../subscriptions/subscription.service.js";

/**
 * Compiles comprehensive hotel distribution and regional metrics.
 */
export const getHotelReport = async () => {
  await syncHotelSubscriptions();

  const [totalHotels, activeHotels, pendingApproval, suspendedHotels, cityBreakdown, monthlyGrowth] =
    await Promise.all([
      Hotel.countDocuments(),
      Hotel.countDocuments({ status: "active" }),
      Hotel.countDocuments({ status: "pending" }),
      Hotel.countDocuments({ status: "suspended" }),
      Hotel.aggregate([
        { $group: { _id: "$city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      getHotelGrowthTrend(),
    ]);

  const total = totalHotels || 1;
  const byCity = cityBreakdown.map((item) => {
    const cityName = item._id || "Other Cities";
    const percentage = Math.round((item.count / total) * 100);
    return {
      city: cityName,
      count: item.count,
      percentage: Math.max(1, percentage),
    };
  });

  return {
    totalHotels,
    activeHotels,
    pendingApproval,
    suspendedHotels,
    byCity: byCity.slice(0, 8),
    monthlyGrowth,
  };
};

/**
 * Compiles SaaS revenue, MRR, ARR, and city earnings.
 */
export const getRevenueReport = async () => {
  await seedInitialTransactionsIfEmpty();

  const [activeSubs, allSubs, activeHotelsCount, cityTxns, monthlyTrend] = await Promise.all([
    Subscription.find({ status: "ACTIVE" }).select("amount").lean(),
    Subscription.find().select("status").lean(),
    Hotel.countDocuments({ status: "active" }),
    PlatformTransaction.aggregate([
      { $match: { status: "SUCCESS" } },
      {
        $lookup: {
          from: "hotels",
          localField: "hotelId",
          foreignField: "_id",
          as: "hotel",
        },
      },
      { $unwind: "$hotel" },
      {
        $group: {
          _id: "$hotel.city",
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]),
    getMonthlyRevenueTrend(),
  ]);

  const mrr = activeSubs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const arr = mrr * 12;
  const avgRevenuePerHotel = Math.round(mrr / (activeHotelsCount || 1));

  const totalSubsCount = allSubs.length || 1;
  const expiredCount = allSubs.filter((s) => s.status === "EXPIRED").length;
  const churnRate = `${((expiredCount / totalSubsCount) * 100).toFixed(1)}%`;

  const topEarningCities = cityTxns.map((item) => ({
    city: item._id || "Islamabad",
    revenue: item.revenue,
  }));

  return {
    mrr,
    arr,
    avgRevenuePerHotel,
    churnRate,
    topEarningCities,
    monthlyTrend,
  };
};

/**
 * Compiles user roles, demographics, and account health metrics.
 */
export const getUserReport = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeManagers,
    activeReceptionists,
    superAdmins,
    activeUsersCount,
    recentSignupsMonth,
    monthlyGrowth,
  ] = await Promise.all([
    Account.countDocuments(),
    Account.countDocuments({
      role: { $in: [ROLES.HOTEL_ADMIN, "MANAGER"] },
      status: "active",
    }),
    Account.countDocuments({
      role: { $in: [ROLES.HOTEL_USER, "RECEPTIONIST"] },
      status: "active",
    }),
    Account.countDocuments({
      role: { $in: [ROLES.PLATFORM_ADMIN, "SUPER_ADMIN"] },
    }),
    Account.countDocuments({ status: "active" }),
    Account.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    getUserGrowthTrend(),
  ]);

  const total = totalUsers || 1;
  const activeRate = `${((activeUsersCount / total) * 100).toFixed(1)}%`;

  return {
    totalUsers,
    activeManagers,
    activeReceptionists,
    superAdmins,
    activeRate,
    recentSignupsMonth,
    monthlyGrowth,
  };
};
