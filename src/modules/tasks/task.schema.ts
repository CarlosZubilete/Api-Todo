import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(6, "Title must be at least 6 character")
    .max(50, "Title should not contain more than 50 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 character")
    .max(255, "Description should not contain more than 255 characters")
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(6, "Title must be at least 6 character")
    .max(50, "Title should not contain more than 50 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 character")
    .max(255, "Description should not contain more than 255 characters")
    .optional(),
});
