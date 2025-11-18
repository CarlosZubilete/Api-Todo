# Users Module - User Management

The Users module handles user management operations including listing, finding, updating, and soft-deleting users. All endpoints are admin-only and require authentication.

---

## 🏗️ Module Structure

```
users/
├── user.controller.ts      # Request handlers
├── user.service.ts         # Business logic (DB operations)
├── user.routes.ts          # Route definitions
└── update.schema.ts        # Zod validation schema for updates
```

---

## 🔐 Access Control

**All user endpoints require**:

1. `[authMiddleware]` - User must be logged in
2. `[isAdminMiddleware]` - User must have ADMIN role

**Protected Routes Structure**:

```typescript
router.get("/", [authMiddleware, isAdminMiddleware], handler);
```

---

## 📄 File Details

### **update.schema.ts** - Zod Validation Schema

Defines validation rules for user update requests.

```typescript
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
```

**Validation Rules**:

| Field      | Type   | Rules                          |
| ---------- | ------ | ------------------------------ |
| `name`     | string | Min 6 chars, trimmed, optional |
| `email`    | string | Valid email format, optional   |
| `password` | string | Min 6 chars, trimmed, optional |
| `role`     | enum   | "USER" or "ADMIN", optional    |

**Usage**:

```typescript
const data = updateSchema.parse(req.body);
// Returns typed object with only provided fields:
// { name?: string, email?: string, password?: string, role?: "USER" | "ADMIN" }
```

---

### **user.controller.ts** - Request Handlers

Processes HTTP requests and coordinates with the service layer.

#### `list` Handler - Get All Users

```typescript
export const list = async (req: Request, res: Response, next: NextFunction) => {
  const list = await service.userList();
  if (!list) return next();
  res.status(200).json(list);
};
```

**Endpoint**: `GET /users`

**Requirements**: `[authMiddleware, isAdminMiddleware]`

**Success Response (200)**:

```json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN",
    "delete": false,
    "createdAt": "2025-11-17T10:00:00.000Z",
    "updatedAt": "2025-11-17T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Regular User",
    "email": "user@example.com",
    "role": "USER",
    "delete": false,
    "createdAt": "2025-11-17T10:05:00.000Z",
    "updatedAt": "2025-11-17T10:05:00.000Z"
  }
]
```

**Notes**:

- Returns ALL users (including soft-deleted ones)
- No pagination implemented yet (TODO in routes)

---

#### `findOne` Handler - Get User by ID

```typescript
export const findOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const user = await service.userByID(Number(id));

  if (!user)
    return next(
      new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND)
    );

  res.status(200).json(user);
};
```

**Endpoint**: `GET /users/:id`

**Requirements**: `[authMiddleware, isAdminMiddleware]`

**Path Parameters**:

- `id`: User ID (number)

**Success Response (200)**:

```json
{
  "id": 2,
  "name": "Regular User",
  "email": "user@example.com",
  "role": "USER",
  "delete": false,
  "createdAt": "2025-11-17T10:05:00.000Z",
  "updatedAt": "2025-11-17T10:05:00.000Z"
}
```

**Error Responses**:

- `404 - User not found` (ERROR_CODE: 1001)

---

#### `listFiler` Handler - Filter Users by Delete Status

```typescript
export const listFiler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deleted = req.query.deleted === "true";
  const list = await service.userFilterList(deleted);
  if (!list) return next();
  res.status(200).json(list);
};
```

**Endpoint**: `GET /users/user?deleted=true|false`

**Requirements**: `[authMiddleware, isAdminMiddleware]`

**Query Parameters**:

- `deleted`: "true" to get deleted users, "false" for active users (default: false)

**Success Response (200)**:

```json
[
  {
    "id": 3,
    "name": "Deleted User",
    "email": "deleted@example.com",
    "role": "USER",
    "delete": true,
    "createdAt": "2025-11-17T09:00:00.000Z",
    "updatedAt": "2025-11-17T10:30:00.000Z"
  }
]
```

**Examples**:

```bash
# Get deleted users
GET /users/user?deleted=true

# Get active users
GET /users/user?deleted=false

# Default (active users)
GET /users/user
```

---

#### `update` Handler - Update User

```typescript
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const targetId = Number(id);

  // 1. Verify user exists
  const existingUser = await service.userByID(targetId);
  if (!existingUser)
    return next(
      new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND)
    );

  // 2. Validate update data
  const data = updateSchema.parse(req.body);

  // 3. Prevent self-demotion
  if (req.user.id === targetId && data.role && data.role !== "ADMIN")
    return next(
      new BadRequestException(
        "You cannot demote yourself",
        ErrorCode.SELF_DEMOTION
      )
    );

  // 4. Prepare update data
  const updatedUserData = {
    ...existingUser,
    name: data.name ?? existingUser.name,
    email: data.email ?? existingUser.email,
    role: data.role ?? existingUser.role,
  };

  // 5. Hash password if provided
  if (data.password) {
    updatedUserData.password = hashSync(data.password, parseInt(SALT_ROUND));
  }

  // 6. Update user
  const updated = await service.userUpdate(updatedUserData);
  res.status(200).json({ message: "User updated", user: updated });
};
```

**Endpoint**: `PATCH /users/:id`

**Requirements**: `[authMiddleware, isAdminMiddleware]`

**Path Parameters**:

- `id`: User ID to update (number)

**Request Body** (all optional):

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "password": "NewPassword123",
  "role": "ADMIN"
}
```

**Success Response (200)**:

```json
{
  "message": "User updated",
  "user": {
    "id": 2,
    "name": "Updated Name",
    "email": "newemail@example.com",
    "role": "ADMIN",
    "delete": false,
    "createdAt": "2025-11-17T10:05:00.000Z",
    "updatedAt": "2025-11-17T10:45:00.000Z"
  }
}
```

**Error Responses**:

- `404 - User not found` (ERROR_CODE: 1001)
- `400 - Validation failed` (ERROR_CODE: 5002) - Invalid email format, etc.
- `400 - You cannot demote yourself` (ERROR_CODE: 7001) - Admin trying to change their own role to USER

**Special Logic**:

- **Self-demotion Protection**: An ADMIN cannot change their own role to USER
- **Partial Updates**: All fields are optional, only provided fields are updated
- **Password Hashing**: If password is provided, it's automatically hashed with bcrypt

---

#### `softDelete` Handler - Soft Delete User

```typescript
export const softDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const targetId = Number(id);

  // 1. Verify user exists
  const existingUser = await service.userByID(targetId);
  if (!existingUser)
    return next(
      new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND)
    );

  // 2. Soft delete user
  const deleted = await service.userSoftDelete(targetId);
  res.status(200).json({ message: "User soft deleted", user: deleted });
};
```

**Endpoint**: `DELETE /users/:id`

**Requirements**: `[authMiddleware, isAdminMiddleware]`

**Path Parameters**:

- `id`: User ID to delete (number)

**Success Response (200)**:

```json
{
  "message": "User soft deleted",
  "user": {
    "id": 2,
    "name": "Regular User",
    "email": "user@example.com",
    "role": "USER",
    "delete": true,
    "createdAt": "2025-11-17T10:05:00.000Z",
    "updatedAt": "2025-11-17T10:50:00.000Z"
  }
}
```

**Error Responses**:

- `404 - User not found` (ERROR_CODE: 1001)

**What Happens**:

- Sets `delete: true` flag on user
- User data is NOT removed from database
- Can be restored by setting `delete: false`
- User cannot login (authMiddleware checks `delete: false`)

---

### **user.service.ts** - Business Logic

Handles database operations for user management.

#### `userList` - Get All Users

```typescript
export const userList = async () => {
  return await db.user.findMany();
};
```

**Returns**: `Promise<User[]>` - All users (including soft-deleted)

---

#### `userFilterList` - Filter Users by Delete Status

```typescript
export const userFilterList = async (isDelete: boolean) => {
  return await db.user.findMany({
    where: {
      delete: isDelete,
    },
  });
};
```

**Parameters**:

- `isDelete`: true for deleted users, false for active users

**Returns**: `Promise<User[]>` - Filtered users

---

#### `userByID` - Find User by ID

```typescript
export const userByID = async (id: number) => {
  return await db.user.findFirst({
    where: { id },
  });
};
```

**Parameters**:

- `id`: User ID (number)

**Returns**: `Promise<User | null>` - User if found, null otherwise

---

#### `userUpdate` - Update User

```typescript
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
```

**Parameters**:

- `user`: User object with updated values

**Returns**: `Promise<User>` - Updated user

---

#### `userSoftDelete` - Soft Delete User

```typescript
export const userSoftDelete = async (id: number) => {
  return await db.user.update({
    where: {
      id,
    },
    data: { delete: true },
  });
};
```

**Parameters**:

- `id`: User ID to delete

**Returns**: `Promise<User>` - Deleted user (with delete: true)

---

### **user.routes.ts** - Route Definitions

```typescript
const userRouter: Router = Router();

// List all users
userRouter.get(
  "/",
  [authMiddleware, isAdminMiddleware],
  errorHandler(ctrl.list)
);

// Get user by ID
userRouter.get(
  "/:id",
  [authMiddleware, isAdminMiddleware],
  errorHandler(ctrl.findOne)
);

// Filter users by delete status
userRouter.get(
  "/user",
  [authMiddleware, isAdminMiddleware],
  errorHandler(ctrl.listFiler)
);

// Update user
userRouter.patch(
  "/:id",
  [authMiddleware, isAdminMiddleware],
  errorHandler(ctrl.update)
);

// Soft delete user
userRouter.delete(
  "/:id",
  [authMiddleware, isAdminMiddleware],
  errorHandler(ctrl.softDelete)
);

export default userRouter;
```

**Endpoints Summary**:

| Method | Path                        | Handler                       |
| ------ | --------------------------- | ----------------------------- |
| GET    | `/`                         | List all users                |
| GET    | `/:id`                      | Get user by ID                |
| GET    | `/user?deleted=true\|false` | Filter users by delete status |
| PATCH  | `/:id`                      | Update user                   |
| DELETE | `/:id`                      | Soft delete user              |

---

## 🔐 Security Features

### 1. **Admin-Only Access**

All endpoints require `isAdminMiddleware`:

```typescript
router.get("/", [authMiddleware, isAdminMiddleware], handler);
```

Only users with `role: "ADMIN"` can access user management.

### 2. **Self-Demotion Protection**

Prevents an ADMIN from downgrading their own role:

```typescript
if (req.user.id === targetId && data.role && data.role !== "ADMIN")
  throw new BadRequestException(
    "You cannot demote yourself",
    ErrorCode.SELF_DEMOTION
  );
```

### 3. **Password Hashing**

Passwords are automatically hashed before storage:

```typescript
if (data.password) {
  updatedUserData.password = hashSync(data.password, parseInt(SALT_ROUND));
}
```

### 4. **Soft Delete**

Users are not permanently deleted, only marked as deleted:

```typescript
delete: true  // Marks user as deleted
```

---

## 📊 User Model

```typescript
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String   // Hashed
  role      String   @default("USER")  // USER or ADMIN
  delete    Boolean  @default(false)   // Soft delete flag
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]   // Related tasks
  tokens    Token[]  // Related tokens
}
```

---

## 🛠️ Type Safety

```typescript
import type { User } from "@prisma/client";

// Update payload type
type UserUpdatePayload = Partial<
  Pick<User, "name" | "email" | "password" | "role">
>;

// Full user type from Prisma
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  delete: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 📊 Error Codes

| Code | Error            | HTTP | Description                    |
| ---- | ---------------- | ---- | ------------------------------ |
| 1001 | USER_NOT_FOUND   | 404  | User doesn't exist             |
| 4001 | UNAUTHORIZED     | 401  | Not authenticated or not admin |
| 5002 | VALIDATION_ERROR | 400  | Schema validation failed       |
| 7001 | SELF_DEMOTION    | 400  | Admin trying to demote self    |

---

## 💡 Usage Examples

### List All Users

```bash
curl -X GET http://localhost:3000/users \
  -H "Cookie: jwt=<token>"
```

### Get User by ID

```bash
curl -X GET http://localhost:3000/users/2 \
  -H "Cookie: jwt=<token>"
```

### Filter Deleted Users

```bash
curl -X GET "http://localhost:3000/users/user?deleted=true" \
  -H "Cookie: jwt=<token>"
```

### Update User

```bash
curl -X PATCH http://localhost:3000/users/2 \
  -H "Cookie: jwt=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "role": "ADMIN"
  }'
```

### Soft Delete User

```bash
curl -X DELETE http://localhost:3000/users/2 \
  -H "Cookie: jwt=<token>"
```

---

## 📝 TODOs & Future Enhancements

### From routes.ts:

```typescript
// TODO: implements variable parameter to get all users, also deleted
// - Add pagination with limit/offset
// - Filter by role, delete status in single endpoint
```

### From service.ts:

```typescript
// TODO: Physical delete
/*
  * FIRST OF ALL:
  1. DELETE USER'S TASKS
  2. DELETE EVERYTHING RELATED TO THE USER
  3. CREATE A SUPER-ADMIN PERMISSION FOR THAT
*/
```

---

## 🎯 Best Practices

### ✅ DO:

```typescript
// ✅ Always validate input
const data = updateSchema.parse(req.body);

// ✅ Check user exists before updating
const existingUser = await service.userByID(targetId);
if (!existingUser) throw new NotFoundException(...);

// ✅ Use specific error codes
throw new BadRequestException(
  "You cannot demote yourself",
  ErrorCode.SELF_DEMOTION
);

// ✅ Hash passwords automatically
if (data.password) {
  updatedUserData.password = hashSync(data.password, parseInt(SALT_ROUND));
}
```

### ❌ DON'T:

```typescript
// ❌ Skip validation
const name = req.body.name; // No validation!

// ❌ Update without checking existence
await db.user.update(...); // What if ID doesn't exist?

// ❌ Store plaintext passwords
password: req.body.password // Never do this!

// ❌ Allow self-demotion
// Admin can change own role without protection
```

---

## 📝 Summary

The Users module provides:

- ✅ List all users (admin-only)
- ✅ Find user by ID (admin-only)
- ✅ Filter users by delete status (admin-only)
- ✅ Update user details (admin-only, self-demotion protected)
- ✅ Soft delete users (admin-only)
- ✅ Password hashing on updates
- ✅ Comprehensive validation with Zod
- ✅ Proper error handling with specific error codes

All endpoints are protected by authentication and authorization middleware.
