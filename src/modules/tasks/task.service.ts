import { db } from "../../config/db";
import type { Task } from "@prisma/client";

export const createTask = async (
  id: number,
  task: { title: string; description?: string }
) => {
  return await db.task.create({
    data: {
      title: task.title,
      description: task.description ?? "",
      userId: id,
    },
  });
};

export const findTasksByUser = async (idUser: number) => {
  return await db.task.findMany({
    where: {
      userId: idUser,
      delete: false,
    },
  });
};

export const findTaskById = async (idUser: number, id: number) => {
  return await db.task.findFirst({
    where: {
      id,
      userId: idUser,
      delete: false,
    },
  });
};

export const listTaskCompleted = async (
  isCompleted: boolean,
  userId: number
) => {
  return await db.task.findMany({
    where: {
      userId,
      completed: isCompleted,
      delete: false,
    },
  });
};

export const completedTask = async (userId: number, id: number) => {
  return await db.task.updateMany({
    where: { id, userId, delete: false },
    data: { completed: true },
  });
};

export const updateTask = async (task: Task) => {
  return await db.task.update({
    where: {
      id: task.id,
      userId: task.userId,
    },
    data: {
      ...task,
    },
  });
};

export const softDelete = async (idUser: number, id: number) => {
  return await db.task.update({
    where: {
      id,
      userId: idUser,
    },
    data: {
      delete: true,
    },
  });
};
