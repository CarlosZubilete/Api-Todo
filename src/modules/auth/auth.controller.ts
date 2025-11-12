import { type NextFunction, type Request, type Response } from "express";
import { BadRequestException } from "../../exceptions/BadRequestException.js";
import { ErrorCode } from "../../exceptions/HttpException.js";
import * as service from "./auth.service.js";
import { NotFoundException } from "../../exceptions/NotFoundException.js";
import { compareSync } from "bcrypt";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  // This return a user
  const existingUser = await service.isExists({ email });

  console.log("existingUser: " + existingUser); // existingUser: null

  if (existingUser) {
    return next(
      new BadRequestException(
        "User already exists!",
        ErrorCode.USER_ALREADY_EXISTS
      )
    );
  }

  const user = await service.create({ name, email, password });

  res.status(201).json(user);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  const user = await service.isExists({ email });

  if (!user) {
    return next(
      new NotFoundException("User does not exists!", ErrorCode.USER_NOT_FOUND)
    );
  }

  if (!compareSync(password, user.password)) {
    return next(
      new BadRequestException(
        "Incorrect password!",
        ErrorCode.INCORRECT_PASSWORD
      )
    );
  }

  const token = await service.createToken(user);

  res.status(201).json(token);
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const disableToken = await service.deleteToken(req.body.key, req.body.id);
  // this error exception is wrong
  if (!disableToken)
    return next(
      new NotFoundException("Token does not exists!", ErrorCode.USER_NOT_FOUND)
    );

  res.status(201).json({ message: "Logout success" });
};
