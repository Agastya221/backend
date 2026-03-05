import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const checkAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { carId, startDate, endDate } = req.body;
  const result = await BookingService.checkAvailability(carId, startDate, endDate);
  res.status(200).json(apiResponse(result, result.available ? "Car is available" : "Car is not available for selected dates"));
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const result = await BookingService.createBooking(req.body);
  res.status(201).json(apiResponse(result, "Booking created successfully"));
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const booking = await BookingService.getBookingById(req.params.id);
  res.status(200).json(apiResponse(booking, "Booking fetched"));
});

export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  const result = await BookingService.listBookings(req.query);
  res.status(200).json({ success: true, message: "Bookings fetched", ...result });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const booking = await BookingService.updateStatus(req.params.id, req.body.bookingStatus);
  res.status(200).json(apiResponse(booking, "Booking status updated"));
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await BookingService.cancelBooking(req.params.id);
  res.status(200).json(apiResponse(booking, "Booking cancelled"));
});
