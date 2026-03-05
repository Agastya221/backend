import { Router } from "express";
import { getLatestTracking } from "./tracking.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/:vehicleId/latest", authMiddleware, asyncHandler(getLatestTracking));

export default router;
