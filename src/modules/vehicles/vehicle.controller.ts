import { Request, Response } from "express";
import { VehicleService } from "./vehicle.service";
import { apiResponse } from "../../utils/apiResponse";

export const listVehicles = async (_req: Request, res: Response) => {
  const vehicles = await VehicleService.list();
  res.json(apiResponse(vehicles, "Vehicles fetched"));
};
