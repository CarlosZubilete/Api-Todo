import { type NextFunction, type Request, type Response } from "express";
import { BadRequestException } from "../../exceptions/BadRequestException";
import { ErrorCode } from "../../exceptions/HttpException";
import * as service from "./auth.service";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { compareSync } from "bcrypt";
import { NODE_ENV } from "../../secrets";
import type { User } from "../../generated/client";
import { signupSchema } from "./auth.schema";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // validation schema:
  signupSchema.parse(req.body);
  const { name, email, password } = req.body;
  // This return a user
  const existingUser: User | null = await service.isExists({ email });
  // console.log("existingUser: " + existingUser); // existingUser: null
  if (existingUser)
    return next(
      new BadRequestException(
        "User already exists!",
        ErrorCode.USER_ALREADY_EXISTS
      )
    );
  const user: User = await service.create({ name, email, password });
  res.status(201).json({ email: user.email, role: user.role });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  const user: User | null = await service.isExists({ email });

  if (!user)
    return next(
      new NotFoundException("User does not exists!", ErrorCode.USER_NOT_FOUND)
    );

  if (!compareSync(password, user.password))
    return next(
      new BadRequestException(
        "Incorrect password!",
        ErrorCode.INCORRECT_PASSWORD
      )
    );

  const token: string = await service.createToken(user);

  res.cookie("jwt", token, {
    httpOnly: true,
    // sameSite: "strict", // o 'lax'
    secure: NODE_ENV === "production",
    maxAge: 60 * 60 * 1000,
    // path: '/', domain: 'your-dns'
  });

  res.status(200).json({ userID: user.id, message: "Login success!" });
};

// * [authMiddleware]
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userToken = await service.deleteToken(req.token.key, req.token.id);
  // this error exception is wrong
  if (!userToken)
    return next(
      new NotFoundException("Token does not exists!", ErrorCode.TOKEN_NOT_FOUND)
    );

  res.clearCookie("jwt", {
    httpOnly: true,
    // sameSite: "strict", // o 'lax'
    secure: NODE_ENV === "production",
  });

  res.status(201).json({ userId: userToken.userId, message: "Logout success" });
};
