import { z } from "zod";

export const singUpSchema = z.object({
  name: z.string().trim().min(6, "Name must be at least 6 characters"),
  email: z
    .email("Invalid email")
    .trim()
    .min(6, "Email must be at least 6 characters"),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
  // role: z.enum(["USER", "ADMIN"]).optional(), // *Removed to prevent role assignment on sign up
});
