import { Router } from "express";
import * as auditController from "./audit.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = Router();

// Strictly guard audit logs behind Platform Super Admin
router.use(authMiddleware);
router.use(authorize(ROLES.PLATFORM_ADMIN));

router.get("/stats", auditController.getStats);
router.get("/", auditController.getLogs);
router.post("/", auditController.recordLog);

export default router;
