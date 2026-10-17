import { Router } from "express";
// Auth controller ke saare functions authController ke andar aa jayenge:
import * as authController from "./auth.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import { registerSchema, registerHotelSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.validation.js";

// Router() ek function call hai jo ek router object return karta hai.
const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/register-hotel", validate(registerHotelSchema), authController.registerHotel);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getMe);

export default router;


// chatgpt
// import { Router } from "express";

// import { login } from "./auth.controller.js";
// import validate from "../../../middlewares/validate.middleware.js";
// import { loginSchema } from "./auth.validation.js";

// const router = Router();

// router.post(
//   "/login",
//   validate(loginSchema),
//   login
// );

// export default router;