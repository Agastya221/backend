import { Request, Response } from "express";
import { UserService } from "./user.service";
import { apiResponse } from "../../utils/apiResponse";

export const listUsers = async (_req: Request, res: Response) => {
  const users = await UserService.list();
  res.json(apiResponse(users, "Users fetched"));
};
