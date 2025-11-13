import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.email("Invalid email").min(3, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// role: z.number().optional(),
