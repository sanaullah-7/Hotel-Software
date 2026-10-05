import { Router } from "express";
import * as folioController from "./folio.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import { createFolioSchema } from "./folio.validation.js";

const router = Router();

router.use(authMiddleware, hotelContext);

router.post(
  "/folios",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createFolioSchema),
  folioController.createFolio
);

router.get("/folios", folioController.getFolios);

router.get("/folios/:id", validateIdParam, folioController.getFolioById);

export default router;
