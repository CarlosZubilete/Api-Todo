import { z } from "zod";

export const updateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(6, "Name must be at least 6 characters")
    .optional(),
  email: z.email().optional(),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});
