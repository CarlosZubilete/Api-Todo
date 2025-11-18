import type { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { ErrorCode } from "../exceptions/HttpException";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { db } from "../config/db";

interface AuthPayload extends JwtPayload {
  sub: string;
  name: string;
  role: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // is there a token?
  //const token: string = req.headers.authorization?.split(" ")[1]!; // "bearer <token>"
  const token: string | undefined = req.cookies.jwt;

  if (!token)
    return next(
      new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED)
    );
  // * verify token:
  try {
    const payload: AuthPayload = jwt.verify(token, JWT_SECRET) as AuthPayload;

    const userToken = await db.token.findFirst({
      where: {
        userId: Number(payload.sub),
        key: token,
        active: true,
      },
      include: { user: true },
    });

    if (!userToken)
      return next(
        new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED)
      );

    req.user = {
      id: userToken.userId,
      role: userToken.user.role || payload.role,
    };

    req.token = {
      id: userToken.id,
      key: userToken.key,
    };

    next();
  } catch (err) {
    next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
  }
};
