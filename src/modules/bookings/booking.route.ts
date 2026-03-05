import { Router } from "express";
import * as BookingController from "./booking.controller";
import { handleValidationErrors } from "../../middleware/expressValidator.middleware";
import {
    checkAvailabilityValidator,
    createBookingValidator,
    updateStatusValidator,
    listBookingsValidator,
} from "./booking.validation";

const router = Router();

// Check availability before booking
router.post("/check-availability", checkAvailabilityValidator, handleValidationErrors, BookingController.checkAvailability);

// Create new booking (transaction-safe)
router.post("/", createBookingValidator, handleValidationErrors, BookingController.createBooking);

// List all bookings (admin)
router.get("/", listBookingsValidator, handleValidationErrors, BookingController.listBookings);

// Get single booking
router.get("/:id", BookingController.getBookingById);

// Update booking status (transition-safe)
router.patch("/:id/status", updateStatusValidator, handleValidationErrors, BookingController.updateStatus);

// Cancel booking
router.delete("/:id", BookingController.cancelBooking);

export default router;
