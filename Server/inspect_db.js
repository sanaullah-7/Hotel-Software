import mongoose from 'mongoose';
import { connectPlatformDB } from './src/database/platform/platformConnection.js';
import Account from './src/database/platform/models/account.model.js';
import PasswordReset from './src/database/platform/models/passwordReset.model.js';

async function inspectDB() {
  try {
    console.log("Connecting to DB...");
    await connectPlatformDB();
    
    console.log("Finding account...");
    const account = await Account.findOne({ email: 'test@hotel.com' });
    console.log('Account:', account ? { _id: account._id.toString(), email: account.email } : 'Not Found');
    
    if (account) {
      console.log("Finding resets...");
      const resets = await PasswordReset.find({ accountId: account._id }).sort({ createdAt: -1 });
      console.log(`Found ${resets.length} PasswordReset records.`);
      
      for (const r of resets) {
        console.log({
          _id: r._id.toString(),
          accountId: r.accountId.toString(),
          createdAt: r.createdAt,
          expiresAt: r.expiresAt,
          isUsed: r.isUsed,
          otpHash: r.otp
        });
      }
    }
  } catch (err) {
    console.error("Error inspecting DB:", err);
  } finally {
    process.exit(0);
  }
}

inspectDB();
