import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await AuthService.register(name, email, password);
  res.status(201).json(apiResponse(result, "Registration successful"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);
  res.status(200).json(apiResponse(result, "Login successful"));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  // req.user is populated by authMiddleware
  res.json(apiResponse((req as Request & { user?: unknown }).user, "Current user"));
});
