import { Router } from "express";
import * as CarController from "./car.controller";
import { handleValidationErrors } from "../../middleware/expressValidator.middleware";
import {
    createCarValidator,
    getCarsValidator,
    updateCarValidator,
    updateStatusValidator,
} from "./car.validation";
// Note: auth middleware would be required for admin routes, but skipping for now to allow free CRUD testing per Phase 1 spec "Do NOT implement authentication yet" for the frontend.
// The routes are left unprotected to allow the Admin UI frontend to hit them.

const router = Router();

router.post("/", createCarValidator, handleValidationErrors, CarController.createCar);
router.get("/", getCarsValidator, handleValidationErrors, CarController.getCars);
router.get("/:id", CarController.getCarById);
router.patch("/:id", updateCarValidator, handleValidationErrors, CarController.updateCar);
router.delete("/:id", CarController.deleteCar);
router.patch("/:id/status", updateStatusValidator, handleValidationErrors, CarController.updateStatus);

export default router;
