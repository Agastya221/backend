import { Router } from "express";
import { listUsers } from "./user.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, asyncHandler(listUsers));

export default router;
