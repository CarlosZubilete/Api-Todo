import {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
} from "express";
import { ErrorCode, HttpException } from "./exceptions/HttpException.js";
import { InternalException } from "./exceptions/InternalException.js";

export const errorHandler = (method: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (err) {
      // console.error("Caught error in errorHandler:", err);
      let exception: HttpException;
      if (err instanceof HttpException) {
        exception = err;
      } else {
        exception = new InternalException(
          "Something went wrong!",
          err,
          ErrorCode.INTERNAL_EXCEPTION
        );
      }
      // if (!res.headersSent) {
      //   res.status(exception._statusCode).json({
      //     message: exception._message,
      //     errorCode: exception._errorCode,
      //     errors: exception._errors,
      //   });
      // }
      // res.status(exception._statusCode).json({
      //   message: exception._message,
      //   errorCode: exception._errorCode,
      //   errors: exception._errors,
      // });

      next(exception);
    }
  };
};
