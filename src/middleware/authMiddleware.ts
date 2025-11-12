import { type Request, type Response, type NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { ErrorCode } from "../exceptions/HttpException";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import type { Token, User } from "../generated/client";
import { db } from "../config/db";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // is there a token?
  //const token: string = req.headers.authorization?.split(" ")[1]!; // "bearer <token>"

  const token: any = req.cookies.jwt; // there's not typed ....
  console.log("TOKEN: " + token);

  if (!token)
    return next(
      new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED)
    );
  // verify token:
  try {
    const payload: any = jwt.verify(token, JWT_SECRET) as any; // there's not typed ....

    const userToken: Token | null = await db.token.findFirst({
      where: {
        userId: payload.sub,
        key: token,
        active: true,
      },
    });

    if (!userToken)
      return next(
        new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED)
      );

    // todo: we have to create a express.d.ts,.
    req.body = userToken;

    next();
  } catch (err) {
    next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
  }
};

// This is a verify when we're verifying token without cookie ...
// const token: string = req.headers.authorization?.split(" ")[1]!; // "bearer <token>"
