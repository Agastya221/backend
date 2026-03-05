import { Request, Response } from "express";
import { TrackingService } from "./tracking.service";
import { apiResponse } from "../../utils/apiResponse";

export const getLatestTracking = async (req: Request, res: Response) => {
  const data = await TrackingService.latestByVehicle(req.params.vehicleId as string);
  res.json(apiResponse(data, "Latest tracking fetched"));
};
