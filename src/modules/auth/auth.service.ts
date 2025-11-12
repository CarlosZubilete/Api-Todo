import { hashSync } from "bcrypt";
import { db } from "../../config/db.js";
import { JWT_SECRET, SALT_ROUND } from "../../secrets.js";
import { type Token, type User } from "../../generated/client.js";
import jwt from "jsonwebtoken";

export const create = async (
  user: Pick<User, "name" | "email" | "password">
) => {
  const result: User = await db.user.create({
    data: {
      name: user.name,
      email: user.email,
      password: hashSync(user.password, parseInt(SALT_ROUND)),
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
  // 1. generate token
  const token = jwt.sign(
    {
      sub: user.id,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  // Save token in Token Table
  const saveToken: Token = await db.token.create({
    data: {
      key: token,
      userId: user.id,
    },
  });

  // Validation:
  if (!saveToken) throw new Error("Can't save token into Token table");

  const payload = {
    token,
  };

  return token;
};

export const deleteToken = async (token: string, id: number) => {
  console.log("deleteToken token" + token);
  console.log("deleteToken id" + id);
  return await db.token.update({
    where: {
      id,
      key: token,
    },
    data: {
      active: false,
    },
  });
};
// const userToken = await db.token.findFirst({
//   where: {
//     key: token,
//   },
// });

// const update = await db.token.update({
//   where: {
//     id,
//     key: token,
//   },
//   data: {
//     active: false,
//   },
// });
