import { type Request, type Response, type NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/UnauthorizedException.js";
import { ErrorCode } from "../exceptions/HttpException.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets.js";
import type { Token, User } from "../generated/client.js";
import { db } from "../config/db.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // is there a token?
  const token: string = req.headers.authorization?.split(" ")[1]!; // "bearer <token>"

  if (!token)
    return next(
      new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED)
    );
  // verify token:
  try {
    const payload: any = jwt.verify(token, JWT_SECRET) as any; // DON'T USE "ANY"

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

// const user: User | null = await db.user.findFirst({
//   where: { id: payload.sub },
// });

// if (!user)
//   return next(
//     new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED)
//   );
