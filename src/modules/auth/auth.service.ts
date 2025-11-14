import { hashSync } from "bcrypt";
import { db } from "../../config/db";
import { JWT_SECRET, SALT_ROUND } from "../../secrets";
import { type Token, type User } from "../../generated/client";
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
  return await db.user.findFirst({ where: { email: user.email } });
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

// TODO: if we still use sqlite change: hard delete (physical delete) for Token.
export const deleteToken = async (token: string, id: number) => {
  // console.log("deleteToken token" + token);
  // console.log("deleteToken id" + id);
  return await db.token.update({
    where: {
      id,
      key: token,
      active: true,
    },
    data: {
      active: false,
    },
  });
};

// export const userList = async () => {
//   return await db.user.findMany();
// };
