import { db } from "../../config/db";
import type { Task } from "../../generated/client";

export const createTask = async (
  id: number,
  task: { title: string; description?: string }
) => {
  // export const createTask = async (
  //   id: number,
  //   task: Pick<Task, "title" | "description">
  // ) => {

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

export const findTaskById = async (idUser: number, idTask: number) => {
  return await db.task.findFirst({
    where: {
      id: idTask,
      userId: idUser,
      delete: false,
    },
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

export const softDelete = async (idUser: number, idTask: number) => {
  return await db.task.update({
    where: {
      id: idTask,
      userId: idUser,
    },
    data: {
      delete: true,
    },
  });
};
