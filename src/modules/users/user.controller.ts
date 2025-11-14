import { type Request, type Response, type NextFunction } from "express";
import type { User } from "../../generated/client";
import * as service from "./user.service";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { ErrorCode } from "../../exceptions/HttpException";
import { updateSchema } from "./update.schema";
import { BadRequestException } from "../../exceptions/BadRequestException";
import { hashSync } from "bcrypt";
import { SALT_ROUND } from "../../secrets";

export const listUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const list: User[] = await service.userList();
  if (!list) return next();
  res.status(200).json(list);
};

export const listFilerUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(req.query.deleted);
  const deleted = req.query.deleted === "true";
  const list: User[] = await service.userFilterList(deleted);
  if (!list) return next();
  res.status(200).json(list);
};

export const findUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const user: User | null = await service.userByID(Number(id));
  if (!user)
    return next(
      new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND)
    );
  res.status(200).json(user);
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const targetId = Number(id);

  const existingUser: User | null = await service.userByID(targetId);

  if (!existingUser)
    return next(
      new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND)
    );

  // validation with zod
  const data = updateSchema.parse(req.body);

  // Prevent self-demotion: if
  if (req.user.id === targetId && data.role && data.role !== "ADMIN")
    return next(
      new BadRequestException(
        "You cannot demote yourself",
        ErrorCode.SELF_DEMOTION
      )
    );

  const updatedUserData: User = {
    ...existingUser,
    name: data.name ?? existingUser.name,
    email: data.email ?? existingUser.email,
    role: data.role ?? existingUser.role,
  };

  if (data.password) {
    updatedUserData.password = hashSync(data.password, parseInt(SALT_ROUND));
  }

  const updated: User = await service.userUpdate(updatedUserData);

  res.status(200).json({ message: "User updated", user: updated });
};

export const softDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const targetId = Number(id);

  const existingUser: User | null = await service.userByID(targetId);

  if (!existingUser)
    return next(
      new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND)
    );

  // Prevent self-deletion:
  if (req.user.id === targetId)
    return next(
      new BadRequestException(
        "You cannot delete yourself",
        ErrorCode.SELF_DEMOTION
      )
    );

  const deleted: User = await service.userSoftDelete(targetId);

  res.status(200).json({ message: "User deleted", user: deleted });
};

/* 
name: data.name ?? existingUser.name,
email: data.email ?? existingUser.email,
password: data.password ?? existingUser.password,
*/
