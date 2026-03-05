import { Router } from "express";
import { login, me, register } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authSchema } from "./auth.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/register", validate(authSchema), register);
router.post("/login", validate(authSchema), login);
router.get("/me", authMiddleware, me);

export default router;
