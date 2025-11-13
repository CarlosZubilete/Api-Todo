import { db } from "../../config/db";
import type { User } from "../../generated/client";

export const userList = async () => {
  return await db.user.findMany();
};

export const userByID = async (id: number) => {
  return await db.user.findFirst({
    where: { id },
  });
};

export const userUpdate = async (user: User) => {
  return await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      delete: user.delete,
    },
  });
};
