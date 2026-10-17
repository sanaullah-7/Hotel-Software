import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as subscriptionService from "./subscription.service.js";

export const getPlans = asyncHandler(async (req, res) => {
  const plans = await subscriptionService.getPlans();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, plans, "Subscription plans retrieved"));
});

export const getPlanById = asyncHandler(async (req, res) => {
  const plan = await subscriptionService.getPlanById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, plan, "Subscription plan retrieved"));
});

export const updatePlan = asyncHandler(async (req, res) => {
  const updated = await subscriptionService.updatePlan(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, "Subscription plan updated successfully"));
});

export const getSubscriptions = asyncHandler(async (req, res) => {
  const result = await subscriptionService.listSubscriptions(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Subscriptions retrieved successfully"));
});

export const getSubscriptionStats = asyncHandler(async (req, res) => {
  const stats = await subscriptionService.getSubscriptionStats();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, stats, "Subscription stats retrieved successfully"));
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.updateSubscription(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});
