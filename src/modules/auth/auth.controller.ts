import type { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../../exceptions/BadRequestException";
import { ErrorCode } from "../../exceptions/HttpException";
import * as service from "./auth.service";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { compareSync } from "bcrypt";
import { NODE_ENV } from "../../secrets";
import type { User } from "@prisma/client";
import { singUpSchema } from "./singUp.schema";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // validation schema:
  let data = singUpSchema.parse(req.body);
  // const { name, email, password } = req.body;
  // This return a user
  const existingUser: User | null = await service.isExists({
    email: data.email,
  });
  // if the user already existing
  if (existingUser)
    return next(
      new BadRequestException(
        "User already exists!",
        ErrorCode.USER_ALREADY_EXISTS
      )
    );

  const user: User = await service.create({
    name: data.name,
    email: data.email,
    password: data.password,
    // role: data?.role ?? "USER",
    role: "USER", // *ALways assign USER role on sign up
  });

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
    sameSite: "lax", // allows cookie to be sent with same-site requests
    secure: false, // set to false for HTTP development/testing, true for HTTPS production
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
    sameSite: "lax", // o 'strict'
    secure: NODE_ENV === "production",
  });

  res.status(201).json({ userId: userToken.userId, message: "Logout success" });
};
