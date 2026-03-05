import { Router } from "express";
import { listVehicles } from "./vehicle.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(listVehicles));

export default router;
