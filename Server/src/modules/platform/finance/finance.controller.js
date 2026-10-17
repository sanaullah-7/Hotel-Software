import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as financeService from "./finance.service.js";
import { getSubscriptionStats } from "../subscriptions/subscription.service.js";
import Hotel from "../../../database/platform/models/hotel.model.js";
import Account from "../../../database/platform/models/account.model.js";
import { ROLES } from "../../../constants/roles.js";

export const getRevenueOverview = asyncHandler(async (req, res) => {
  const data = await financeService.getRevenueOverview();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "Revenue overview retrieved"));
});

export const getRevenueTrend = asyncHandler(async (req, res) => {
  const data = await financeService.getMonthlyRevenueTrend();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "Monthly revenue trend retrieved"));
});

export const getHotelGrowth = asyncHandler(async (req, res) => {
  const data = await financeService.getHotelGrowthTrend();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "Hotel growth telemetry retrieved"));
});

export const getUserGrowth = asyncHandler(async (req, res) => {
  const data = await financeService.getUserGrowthTrend();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "User growth telemetry retrieved"));
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  const data = await financeService.getRecentActivityLog();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "Recent activity logs retrieved"));
});

export const getTransactions = asyncHandler(async (req, res) => {
  const data = await financeService.listTransactions(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "Platform transactions retrieved"));
});

export const recordTransaction = asyncHandler(async (req, res) => {
  const data = await financeService.recordTransaction(req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, data, data.message));
});

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const [totalHotels, activeHotels, pendingApprovals, suspendedHotels, totalManagers, totalReceptionists, subStats, revStats] =
    await Promise.all([
      Hotel.countDocuments(),
      Hotel.countDocuments({ status: "active" }),
      Hotel.countDocuments({ status: "pending" }),
      Hotel.countDocuments({ status: "suspended" }),
      Account.countDocuments({ role: { $in: [ROLES.HOTEL_ADMIN, "MANAGER"] } }),
      Account.countDocuments({ role: { $in: [ROLES.HOTEL_USER, "RECEPTIONIST"] } }),
      getSubscriptionStats(),
      financeService.getRevenueOverview(),
    ]);

  const dashboardData = {
    totalHotels,
    activeHotels,
    pendingApprovals,
    suspendedHotels,
    totalManagers,
    totalReceptionists,
    activeSubscriptions: subStats.active,
    monthlyRevenue: revStats.monthlyRevenue,
    revenueGrowth: revStats.revenueGrowth,
    hotelGrowth: 15.2,
    userGrowth: 18.4,
    subscriptionGrowth: 12.1,
  };

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, dashboardData, "Dashboard telemetry retrieved"));
});
