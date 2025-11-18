import { db } from "../../config/db";
import type { User } from "@prisma/client";

export const userList = async () => {
  return await db.user.findMany();
};

export const userFilterList = async (isDelete: boolean) => {
  return await db.user.findMany({
    where: {
      delete: isDelete,
    },
  });
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
    },
  });
};

// *Soft delete
export const userSoftDelete = async (id: number) => {
  return await db.user.update({
    where: {
      id,
    },
    data: { delete: true },
  });
};

// TODO:
// *physical delete
/*
  * FIRST OF ALL. 
  1. DELETE USER'S TASKS.
  2. EVERYTHING RELATIONS WITH THE REGISTER.
  3. CREATE A SUPER-ADMIN PERMISSIONS FOR THAT. 
*/
