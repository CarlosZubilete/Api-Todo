import { type Request, type Response, type NextFunction } from "express";
import { HttpException } from "../exceptions/HttpException.js";

export const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(error._statusCode).json({
    message: error._message,
    errorCode: error._errorCode,
    errors: error._errors,
  });
};
