import { Request, Response } from "express";
import { CarService } from "./car.service";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createCar = asyncHandler(async (req: Request, res: Response) => {
    const car = await CarService.createCar(req.body);
    res.status(201).json(apiResponse(car, "Car created successfully"));
});

export const getCars = asyncHandler(async (req: Request, res: Response) => {
    const result = await CarService.getCars(req.query);
    // Custom response to match pagination format
    res.status(200).json({
        success: true,
        message: "Cars fetched successfully",
        ...result,
    });
});

export const getCarById = asyncHandler(async (req: Request, res: Response) => {
    const car = await CarService.getCarById(req.params.id as string);
    res.status(200).json(apiResponse(car, "Car fetched successfully"));
});

export const updateCar = asyncHandler(async (req: Request, res: Response) => {
    const car = await CarService.updateCar(req.params.id as string, req.body);
    res.status(200).json(apiResponse(car, "Car updated successfully"));
});

export const deleteCar = asyncHandler(async (req: Request, res: Response) => {
    await CarService.deleteCar(req.params.id as string);
    res.status(200).json(apiResponse(null, "Car deleted successfully"));
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const car = await CarService.updateStatus(req.params.id as string, req.body.status);
    res.status(200).json(apiResponse(car, "Car status updated successfully"));
});
