import type { NextFunction, Response, Request } from "express";
import * as service from "./task.service";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { ErrorCode } from "../../exceptions/HttpException";
import { createTaskSchema, updateTaskSchema } from "./task.schema";
import { BadRequestException } from "../../exceptions/BadRequestException";
import type { Task } from "@prisma/client";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = createTaskSchema.parse(req.body);
  const idUser = req.user.id;

  const newTask: Task = await service.createTask(idUser, {
    title: data.title,
    description: data.description ?? "",
  });

  if (!newTask)
    return next(
      new BadRequestException(
        "Can't create a new task",
        ErrorCode.INTERNAL_EXCEPTION
      )
    );

  res.status(201).json({ success: true, data: newTask });
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  const idUser = req.user.id;

  const list: Task[] = await service.findTasksByUser(idUser);

  if (!list)
    return next(
      new NotFoundException(
        "List not found",
        ErrorCode.USER_TASK_LIST_NOT_FOUND
      )
    );

  res.status(200).json({ success: true, data: list });
};

export const findOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const targetId = Number(id);
  const idUser = req.user.id;

  const isTaskExists: Task | null = await service.findTaskById(
    idUser,
    targetId
  );

  if (!isTaskExists)
    return next(
      new NotFoundException(
        "Task does not exists!",
        ErrorCode.USER_TASK_NOT_FOUND
      )
    );

  res.status(200).json({ success: true, data: isTaskExists });
};

export const taskFilter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idUser = req.user.id;
  // console.log("taskFilter: " + idUser);
  const completed: boolean = req.query.completed === "true";
  const list: Task[] = await service.listTaskCompleted(completed, idUser);
  if (!list) return next();
  res.status(200).json({ success: true, data: list });
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const targetId = Number(id);
  const idUser = req.user.id;

  const isTaskExists: Task | null = await service.findTaskById(
    idUser,
    targetId
  );

  if (!isTaskExists)
    return next(
      new NotFoundException(
        "Task does not exists!",
        ErrorCode.USER_TASK_NOT_FOUND
      )
    );

  const data = updateTaskSchema.parse(req.body);

  const updateTask: Task = {
    ...isTaskExists,
    title: data.title ?? isTaskExists.title,
    description: data.description ?? isTaskExists.description,
  };

  const updated: Task = await service.updateTask(updateTask);

  if (!updated)
    return next(
      new BadRequestException(
        "Task does not updated",
        ErrorCode.UNPROCESSABLE_ENTITY
      )
    );

  res.status(201).json({ success: true, data: updated });
};

export const completed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const idTask = Number(id);
  const idUser = req.user.id;

  const isTaskExists: Task | null = await service.findTaskById(idUser, idTask);

  if (!isTaskExists)
    return next(
      new NotFoundException(
        "Task does not exists!",
        ErrorCode.USER_TASK_NOT_FOUND
      )
    );

  const completed = await service.completedTask(idUser, idTask);

  if (completed.count === 0)
    return next(
      new BadRequestException(
        "Task was not completed",
        ErrorCode.UNPROCESSABLE_ENTITY
      )
    );

  res.status(201).json({ success: true, message: "Task has been completed" });
};

export const deleted = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const targetId = Number(id);
  const idUser = req.user.id;

  const isTaskExists: Task | null = await service.findTaskById(
    idUser,
    targetId
  );

  if (!isTaskExists)
    return next(
      new NotFoundException(
        "Task does not exists!",
        ErrorCode.USER_TASK_NOT_FOUND
      )
    );

  const deleted = await service.softDelete(idUser, targetId);

  if (!deleted)
    return next(
      new BadRequestException(
        "Task does not Delete",
        ErrorCode.UNPROCESSABLE_ENTITY
      )
    );

  res.status(201).json({ success: true, message: "Task has been deleted" });
};
