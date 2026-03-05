import { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  next(error);
};
