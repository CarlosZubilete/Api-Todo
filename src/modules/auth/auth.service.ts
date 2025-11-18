import { hashSync } from "bcrypt";
import { db } from "../../config/db";
import { JWT_SECRET, SALT_ROUND } from "../../secrets";
import type { Token, User } from "@prisma/client";
import jwt from "jsonwebtoken";

export const create = async (
  user: Pick<User, "name" | "email" | "password" | "role">
) => {
  const result: User = await db.user.create({
    data: {
      name: user.name,
      email: user.email,
      password: hashSync(user.password, parseInt(SALT_ROUND)),
      role: user.role,
    },
  });
  return result;
};

export const isExists = async (user: Pick<User, "email">) => {
  return await db.user.findFirst({
    where: {
      email: user.email,
      delete: false,
    },
  });
};

export const createToken = async (
  user: Pick<User, "id" | "name" | "email" | "password" | "role">
) => {
  // 1. Generate token:
  const token: string = jwt.sign(
    {
      sub: user.id,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  // Save token in Token Table:
  const saveToken: Token = await db.token.create({
    data: {
      key: token,
      userId: user.id,
    },
  });
  // Validation:
  if (!saveToken) throw new Error("Can't save token into Token table");
  return token;
};

export const deleteToken = async (token: string, id: number) => {
  return await db.token.delete({
    where: {
      id,
      key: token,
      active: true,
    },
  });
};
