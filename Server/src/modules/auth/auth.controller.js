import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
// Yahan auth.service.js ke saare named exports authService ke andar aa jayenge.
import * as authService from "./auth.service.js";
import logger from "../../config/logger.js";
import { HTTP_STATUS } from "../../Constants/httpStatusCodes.js";
import { ENV } from "../../config/env.js";


export const register = asyncHandler(async (req, res) => {
  const account = await authService.registerAccount(req.body);

  const safeAccount = account.toObject();
  delete safeAccount.password;//Response mein password nahi bhejna.

  // Server-side log
  logger.info(
    `Account registered successfully: ${account.email}`
  );

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, safeAccount, "Account created successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { account, accessToken, refreshToken } = await authService.loginAccount(
    req.body,
  );

  const safeAccount = account.toObject();
  // Lekin frontend ko hum refreshToken directly response body mein nahi bhej rahe.
  delete safeAccount.password;


// Browser mein refreshToken naam ki cookie set kar do aur uske andar ye refresh token rakh do.
// Browser is cookie ko store kar lega.  
res.cookie("refreshToken", refreshToken, {
    // Iska matlab browser ka JavaScript normally cookie ko read nahi kar sakta.
      httpOnly: true,
    // Production mein cookie sirf HTTPS par jayegi.
      secure: ENV.NODE_ENV === "production",
    // Cross-site request situations mein cookie sending ko restrict karta hai.
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { account: safeAccount, accessToken },
        "Login successful",
      ),
    );


    //  Login successful hone ka server-side log.
  logger.info(
    `Account logged in successfully: ${account.email}`
  );
});

export const logout = asyncHandler(async (req, res) => {
  // Browser se refresh-token cookie clear karne ki koshish.
  res.clearCookie("refreshToken");
  //Logout ka server-side log.
    logger.info(
    `Account logged out: ${req.user.email}`
  );

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, req.user, "Current account fetched"));
});
