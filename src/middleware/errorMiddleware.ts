import type { Request, Response, NextFunction } from "express";
import { HttpException } from "../exceptions/HttpException";

export const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response: any = {
    message: error._message,
    errorCode: error._errorCode,
  };
  // Only include errors field if there are actual errors
  if (error._errors) {
    response.errors = error._errors;
  }
  res.status(error._statusCode).json(response);
};

/* 
  res.status(error._statusCode).json({
    message: error._message,
    errorCode: error._errorCode,
    errors: error._errors,
  });
*/
