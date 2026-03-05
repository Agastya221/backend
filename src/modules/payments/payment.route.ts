import { Router } from "express";
import { createOrder, handleWebhook, verifyPayment } from "./payment.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/create-order", authMiddleware, asyncHandler(createOrder));
router.post("/verify", authMiddleware, asyncHandler(verifyPayment));
router.post("/webhook", asyncHandler(handleWebhook));

export default router;
