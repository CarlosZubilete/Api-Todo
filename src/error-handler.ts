import {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
} from "express";
import { ErrorCode, HttpException } from "./exceptions/HttpException";
import { InternalException } from "./exceptions/InternalException";
import { ZodError } from "zod";
import { ValidationException } from "./exceptions/ValidationException";

export const errorHandler = (method: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (err) {
      // console.error("Caught error in errorHandler:", err);
      let exception: HttpException;
      if (err instanceof HttpException) {
        exception = err;
      } else if (err instanceof ZodError) {
        exception = new ValidationException(err);
      } else {
        exception = new InternalException(
          "Something went wrong!",
          err,
          ErrorCode.INTERNAL_EXCEPTION
        );
      }
      res.status(exception._statusCode).json({
        message: exception._message,
        errorCode: exception._errorCode,
        errors: exception._errors,
      });

      next(exception);
    }
  };
};
