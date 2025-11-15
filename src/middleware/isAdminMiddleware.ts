import { type Request, type Response, type NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { ErrorCode } from "../exceptions/HttpException";

export const isAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user.role !== "ADMIN")
    return next(
      new UnauthorizedException(
        "Access Denied. Admins only",
        ErrorCode.UNAUTHORIZED
      )
    );

  next();
};
