import { body, param, query } from "express-validator";

export const checkAvailabilityValidator = [
    body("carId").isMongoId().withMessage("Valid carId is required"),
    body("startDate").isISO8601().withMessage("Valid startDate (ISO 8601) is required"),
    body("endDate").isISO8601().withMessage("Valid endDate (ISO 8601) is required"),
];

export const createBookingValidator = [
    body("carId").isMongoId().withMessage("Valid carId is required"),
    body("startDate").isISO8601().withMessage("Valid startDate (ISO 8601) is required"),
    body("endDate").isISO8601().withMessage("Valid endDate (ISO 8601) is required"),
    body("pickupLocation").optional().trim().notEmpty(),
    body("dropoffLocation").optional().trim().notEmpty(),
    body("notes").optional().trim(),
];

export const updateStatusValidator = [
    param("id").isMongoId().withMessage("Valid booking ID required"),
    body("bookingStatus")
        .isIn(["reserved", "confirmed", "active", "completed", "cancelled"])
        .withMessage("Invalid booking status"),
];

export const listBookingsValidator = [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("bookingStatus").optional().isIn(["reserved", "confirmed", "active", "completed", "cancelled"]),
    query("carId").optional().isMongoId(),
];
