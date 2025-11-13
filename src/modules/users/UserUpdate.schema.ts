import { email, z } from "zod";

/* 
    "id": 1,
    "name": "Pepito Firulo",
    "email": "pepito.firulo@gmail.com",
    "password": "hash_code",
    "role": "USER",
    "delete": false,
    "createdAt": "2025-11-11T12:03:59.607Z",
    "updatedAt": "2025-11-11T12:03:59.607Z"
*/

export const AdminUserUpdateSchema = z.object({
  name: z.string().min(6).trim().optional(),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  delete: z.boolean().optional(),
});
