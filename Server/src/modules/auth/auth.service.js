import bcrypt from "bcryptjs";
import Account from "../accounts/account.model.js";
import ApiError from "../../utils/apiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken.js";

// Role is received from the backend business logic.
// It should NOT come directly from the client request.

export const registerAccount = async ({fullName,email,phone,password,role,}) => {
  // Check if an account already exists
  // with the same email or phone number.
  const existing = await Account.findOne({$or: [{ email }, { phone }],});

  // If account already exists, stop registration.
  if (existing) {
    throw new ApiError(409, "Account already exists with this email or phone");
  }

  // Hash the user's password before saving it.
  const hashedPassword = await bcrypt.hash(password, 10); //10 ko salt rounds / cost factor kehte hain.

  // Create the account.
  const account = await Account.create({fullName,email,phone,password: hashedPassword,
    // Role is decided by backend business logic.
    role,
  });

  return account;
};






export const loginAccount = async ({ email, password }) => {
  //MongoDB ko bol rahe ho:"Aisa account find karo jiska email same ho OR phone same ho."
  const account = await Account.findOne({ email }).select("+password");

  // Agar email exist nahi karti:401 Unauthorized
  if (!account) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Only active accounts can log in.
  if (account.status !== "active") {
    throw new ApiError(403, "Account is not active. Contact support.");
  }

  // Compare entered password with stored hashed password.
  const isMatch = await bcrypt.compare(password, account.password);

  // Wrong password.
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

//  hotelAccess middleware will use this hotelId .to protect hotel-specific resources.
// 1 Account = 1 Hotel
  const payload = {
    id: account._id,
    role: account.role,
    hotelId: account.hotelId,
  };

  // Generate access token.
  const accessToken = generateAccessToken(payload);

  // Generate refresh token.
  const refreshToken = generateRefreshToken(payload);


// Return authentication result.
  return {
    account,
    accessToken,
    refreshToken,
  };
};
