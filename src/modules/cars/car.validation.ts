import { body, param, query } from "express-validator";

export const createCarValidator = [
    body("name").trim().notEmpty().withMessage("Car name is required"),
    body("brand").trim().notEmpty().withMessage("Brand is required"),
    body("pricePerDay").isFloat({ min: 0 }).withMessage("Valid price per day is required"),
    body("transmission").isIn(["manual", "automatic"]).withMessage("Invalid transmission type"),
    body("fuelType").isIn(["petrol", "diesel", "electric", "cng"]).withMessage("Invalid fuel type"),
    body("seats").isInt({ min: 2, max: 14 }).withMessage("Seats must be between 2 and 14"),
    body("locationId").isMongoId().withMessage("Valid locationId is required"),
    body("images").isArray().optional().withMessage("Images must be an array of strings"),
];

export const updateCarValidator = [
    param("id").isMongoId().withMessage("Valid car ID required"),
    body("name").optional().trim().notEmpty(),
    body("brand").optional().trim().notEmpty(),
    body("pricePerDay").optional().isFloat({ min: 0 }),
    body("transmission").optional().isIn(["manual", "automatic"]),
    body("fuelType").optional().isIn(["petrol", "diesel", "electric", "cng"]),
    body("seats").optional().isInt({ min: 2, max: 14 }),
    body("locationId").optional().isMongoId(),
    body("images").optional().isArray(),
];

export const updateStatusValidator = [
    param("id").isMongoId().withMessage("Valid car ID required"),
    body("status")
        .isIn(["available", "maintenance", "inactive"])
        .withMessage("Status must be available, maintenance, or inactive"),
];

export const getCarsValidator = [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("status").optional().isIn(["available", "maintenance", "inactive"]),
    query("locationId").optional().isMongoId(),
    query("transmission").optional().isIn(["manual", "automatic"]),
    query("fuelType").optional().isIn(["petrol", "diesel", "electric", "cng"]),
];
