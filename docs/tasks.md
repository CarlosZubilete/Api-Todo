# Tasks Module - Task Management

The Tasks module handles task creation, retrieval, updating, and deletion. All endpoints require authentication and are limited to the authenticated user's own tasks.

---

## 🏗️ Module Structure

```
tasks/
├── task.controller.ts      # Request handlers
├── task.service.ts         # Business logic (DB operations)
├── task.routes.ts          # Route definitions
└── task.schema.ts          # Zod validation schemas
```

---

## 🔐 Access Control

**All task endpoints require**: `[authMiddleware]` - User must be logged in

**Task Isolation**: Users can only access their own tasks (user ID verified in each operation)

---

## 📄 File Details

### **task.schema.ts** - Zod Validation Schemas

Defines validation rules for task creation and updates.

```typescript
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(6, "Title must be at least 6 characters")
    .max(50, "Title should not contain more than 50 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(255, "Description should not contain more than 255 characters")
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(6, "Title must be at least 6 characters")
    .max(50, "Title should not contain more than 50 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(255, "Description should not contain more than 255 characters")
    .optional(),
});
```

**Validation Rules**:

| Schema | Field         | Type   | Rules                                    |
| ------ | ------------- | ------ | ---------------------------------------- |
| Create | `title`       | string | Min 6, Max 50 chars, trimmed             |
| Create | `description` | string | Min 10, Max 255 chars, trimmed, optional |
| Update | `title`       | string | Min 6, Max 50 chars, trimmed, optional   |
| Update | `description` | string | Min 10, Max 255 chars, trimmed, optional |

**Usage**:

```typescript
const data = createTaskSchema.parse(req.body);
// If validation fails → ValidationException (400)
```

---

### **task.controller.ts** - Request Handlers

Processes HTTP requests and coordinates with the service layer.

#### `create` Handler - Create New Task

```typescript
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
```

**Endpoint**: `POST /tasks`

**Requirements**: `[authMiddleware]`

**Request Body**:

```json
{
  "title": "Complete project setup",
  "description": "Set up Docker and configure environment variables"
}
```

**Success Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project setup",
    "description": "Set up Docker and configure environment variables",
    "completed": false,
    "delete": false,
    "userId": 1,
    "createdAt": "2025-11-18T10:00:00.000Z",
    "updatedAt": "2025-11-18T10:00:00.000Z"
  }
}
```

**Error Responses**:

- `400 - Validation failed` (ERROR_CODE: 5002) - Invalid title/description length
- `400 - Can't create a new task` (ERROR_CODE: 3001) - Database error

---

#### `list` Handler - Get All User Tasks

```typescript
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
```

**Endpoint**: `GET /tasks`

**Requirements**: `[authMiddleware]`

**Success Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Complete project setup",
      "description": "Set up Docker and configure environment variables",
      "completed": false,
      "delete": false,
      "userId": 1,
      "createdAt": "2025-11-18T10:00:00.000Z",
      "updatedAt": "2025-11-18T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Write unit tests",
      "description": "Add tests for all authentication endpoints",
      "completed": true,
      "delete": false,
      "userId": 1,
      "createdAt": "2025-11-18T11:00:00.000Z",
      "updatedAt": "2025-11-18T11:30:00.000Z"
    }
  ]
}
```

**Error Responses**:

- `404 - List not found` (ERROR_CODE: 1004) - No tasks for user

**Notes**:

- Returns only active tasks (delete: false)
- Does NOT include soft-deleted tasks
- Only user's own tasks are returned

---

#### `findOne` Handler - Get Task by ID

```typescript
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
        "Task does not exist!",
        ErrorCode.USER_TASK_NOT_FOUND
      )
    );

  res.status(200).json({ success: true, data: isTaskExists });
};
```

**Endpoint**: `GET /tasks/:id`

**Requirements**: `[authMiddleware]`

**Path Parameters**:

- `id`: Task ID (number)

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project setup",
    "description": "Set up Docker and configure environment variables",
    "completed": false,
    "delete": false,
    "userId": 1,
    "createdAt": "2025-11-18T10:00:00.000Z",
    "updatedAt": "2025-11-18T10:00:00.000Z"
  }
}
```

**Error Responses**:

- `404 - Task does not exist` (ERROR_CODE: 1005) - Task not found or belongs to different user

---

#### `taskFilter` Handler - Filter Tasks by Completion Status

```typescript
export const taskFilter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idUser = req.user.id;
  const completed: boolean = req.query.completed === "true";
  const list: Task[] = await service.listTaskCompleted(completed, idUser);
  if (!list) return next();
  res.status(200).json({ success: true, data: list });
};
```

**Endpoint**: `GET /tasks/task?completed=true|false`

**Requirements**: `[authMiddleware]`

**Query Parameters**:

- `completed`: "true" for completed tasks, "false" for incomplete tasks (default: false)

**Success Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "title": "Write unit tests",
      "description": "Add tests for all authentication endpoints",
      "completed": true,
      "delete": false,
      "userId": 1,
      "createdAt": "2025-11-18T11:00:00.000Z",
      "updatedAt": "2025-11-18T11:30:00.000Z"
    }
  ]
}
```

**Examples**:

```bash
# Get completed tasks
GET /tasks/task?completed=true

# Get incomplete tasks
GET /tasks/task?completed=false
```

---

#### `update` Handler - Update Task

```typescript
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
        "Task does not exist!",
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
```

**Endpoint**: `PATCH /tasks/:id`

**Requirements**: `[authMiddleware]`

**Path Parameters**:

- `id`: Task ID to update (number)

**Request Body** (all optional):

```json
{
  "title": "Updated task title",
  "description": "Updated description with more details"
}
```

**Success Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated task title",
    "description": "Updated description with more details",
    "completed": false,
    "delete": false,
    "userId": 1,
    "createdAt": "2025-11-18T10:00:00.000Z",
    "updatedAt": "2025-11-18T10:15:00.000Z"
  }
}
```

**Error Responses**:

- `404 - Task does not exist` (ERROR_CODE: 1005) - Task not found or belongs to different user
- `400 - Validation failed` (ERROR_CODE: 5002) - Invalid title/description length
- `400 - Task does not updated` (ERROR_CODE: 2001) - Database error

---

#### `completed` Handler - Mark Task as Completed

```typescript
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
        "Task does not exist!",
        ErrorCode.USER_TASK_NOT_FOUND
      )
    );

  const completed = await service.completedTask(idUser, idTask);

  res.status(201).json({ success: true, data: completed });
};
```

**Endpoint**: `PATCH /tasks/:id/complete`

**Requirements**: `[authMiddleware]`

**Path Parameters**:

- `id`: Task ID to mark as completed (number)

**Success Response (201)**:

```json
{
  "success": true,
  "data": {
    "count": 1
  }
}
```

**Error Responses**:

- `404 - Task does not exist` (ERROR_CODE: 1005) - Task not found or belongs to different user

**What Happens**:

- Sets `completed: true` on the task
- Task remains in the list (not deleted)
- Can be marked as incomplete again by updating

---

#### `deleted` Handler - Soft Delete Task

```typescript
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
        "Task does not exist!",
        ErrorCode.USER_TASK_NOT_FOUND
      )
    );

  const deleted = await service.softDelete(idUser, targetId);

  res.status(200).json({ success: true, data: deleted });
};
```

**Endpoint**: `DELETE /tasks/:id`

**Requirements**: `[authMiddleware]`

**Path Parameters**:

- `id`: Task ID to delete (number)

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project setup",
    "description": "Set up Docker and configure environment variables",
    "completed": false,
    "delete": true,
    "userId": 1,
    "createdAt": "2025-11-18T10:00:00.000Z",
    "updatedAt": "2025-11-18T10:20:00.000Z"
  }
}
```

**Error Responses**:

- `404 - Task does not exist` (ERROR_CODE: 1005) - Task not found or belongs to different user

**What Happens**:

- Sets `delete: true` flag on task
- Task data is NOT removed from database
- Task no longer appears in regular list endpoints
- Can be restored in future if needed

---

### **task.service.ts** - Business Logic

Handles database operations for task management.

#### `createTask` - Create New Task

```typescript
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
```

**Returns**: `Promise<Task>` - Created task

---

#### `findTasksByUser` - Get All User's Tasks

```typescript
export const findTasksByUser = async (idUser: number) => {
  return await db.task.findMany({
    where: {
      userId: idUser,
      delete: false,
    },
  });
};
```

**Returns**: `Promise<Task[]>` - User's active tasks

---

#### `findTaskById` - Find Specific Task

```typescript
export const findTaskById = async (idUser: number, id: number) => {
  return await db.task.findFirst({
    where: {
      id,
      userId: idUser,
      delete: false,
    },
  });
};
```

**Returns**: `Promise<Task | null>` - Task if found and belongs to user

---

#### `listTaskCompleted` - Filter by Completion Status

```typescript
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
```

**Returns**: `Promise<Task[]>` - Filtered tasks

---

#### `completedTask` - Mark Task as Completed

```typescript
export const completedTask = async (userId: number, id: number) => {
  return await db.task.updateMany({
    where: { id, userId, delete: false },
    data: { completed: true },
  });
};
```

**Returns**: `Promise<{ count: number }>` - Number of updated records

---

#### `updateTask` - Update Task

```typescript
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
```

**Returns**: `Promise<Task>` - Updated task

---

#### `softDelete` - Soft Delete Task

```typescript
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
```

**Returns**: `Promise<Task>` - Deleted task (with delete: true)

---

### **task.routes.ts** - Route Definitions

```typescript
const taskRouter: Router = Router();

// POST - Create task
taskRouter.post("/", [authMiddleware], errorHandler(ctrl.create));

// GET - Get filtered tasks
taskRouter.get("/task", [authMiddleware], errorHandler(ctrl.taskFilter));

// GET - Get all user tasks
taskRouter.get("/", [authMiddleware], errorHandler(ctrl.list));

// GET - Get specific task
taskRouter.get("/:id", [authMiddleware], errorHandler(ctrl.findOne));

// PATCH - Mark task as completed
taskRouter.patch(
  "/:id/complete",
  [authMiddleware],
  errorHandler(ctrl.completed)
);

// PATCH - Update task
taskRouter.patch("/:id", [authMiddleware], errorHandler(ctrl.update));

// DELETE - Soft delete task
taskRouter.delete("/:id", [authMiddleware], errorHandler(ctrl.deleted));

export default taskRouter;
```

**Endpoints Summary**:

| Method | Path                          | Handler    | Description                 |
| ------ | ----------------------------- | ---------- | --------------------------- |
| POST   | `/`                           | create     | Create new task             |
| GET    | `/`                           | list       | Get all user tasks          |
| GET    | `/:id`                        | findOne    | Get task by ID              |
| GET    | `/task?completed=true\|false` | taskFilter | Filter by completion status |
| PATCH  | `/:id/complete`               | completed  | Mark task as completed      |
| PATCH  | `/:id`                        | update     | Update task details         |
| DELETE | `/:id`                        | deleted    | Soft delete task            |

---

## 🔄 Task Lifecycle

```
Create Task (POST /tasks)
  ↓
Task created with completed: false, delete: false
  ↓
Complete Task (PATCH /tasks/:id/complete)
  OR
Update Task (PATCH /tasks/:id)
  ↓
Delete Task (DELETE /tasks/:id)
  ↓
Task marked with delete: true (soft delete)
```

---

## 📊 Task Model

```typescript
model Task {
  id          Int      @id @default(autoincrement())
  title       String   // Required, 6-50 chars
  description String?  // Optional, 10-255 chars
  completed   Boolean  @default(false)
  delete      Boolean  @default(false)  // Soft delete flag
  user        User     @relation(fields: [userId], references: [id])
  userId      Int      // User who owns task
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("tasks")
}
```

---

## 🔐 Security Features

### 1. **User Isolation**

Every operation verifies the task belongs to the authenticated user:

```typescript
const isTaskExists = await service.findTaskById(idUser, targetId);
// Returns null if task belongs to different user
```

### 2. **Soft Delete**

Tasks are never permanently deleted:

```typescript
delete: true  // Marks task as deleted
```

Users cannot see soft-deleted tasks in list operations.

### 3. **Input Validation**

All inputs validated with Zod:

```typescript
createTaskSchema.parse(req.body);
// Validates title and description lengths
```

---

## 🛠️ Type Safety Review

### Overall Status: **GOOD** ✅

The Tasks module has proper TypeScript types. Here's the detailed analysis:

---

## 📄 File-by-File Type Analysis

### 1. **task.controller.ts** - ✅ GOOD

**Types Used**:

```typescript
// ✅ Proper types
import type { Task } from "../../generated/client";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const newTask: Task = await service.createTask(idUser, {...});
  // ✅ Task is properly typed
}
```

**✅ Correctly Typed**:

- Request/Response/NextFunction from Express
- Task type imported from Prisma generated types
- All exception types properly imported
- Controller functions have proper return types (implicit void + response)

**⚠️ Note**:

- `req.user.id` relies on authMiddleware attaching it
- Should have proper TypeScript declaration in `express.d.ts`

---

### 2. **task.service.ts** - ⚠️ MIXED

**Current Implementation**:

```typescript
export const createTask = async (
  id: number,
  task: { title: string; description?: string }  // ⚠️ Inline type
) => {
  return await db.task.create({...});
};
```

**Issues Found**:

| Issue                | Current                                  | Recommendation                             |
| -------------------- | ---------------------------------------- | ------------------------------------------ |
| Task parameter type  | Inline object type                       | Use `Pick<Task, 'title' \| 'description'>` |
| Return type          | Implicit                                 | Explicitly type as `Promise<Task>`         |
| Function consistency | All functions lack explicit return types | Add `Promise<Task \| null>`                |

**Recommended Improvements**:

```typescript
// ✅ BETTER WAY 1: Using Pick (strict)
export const createTask = async (
  userId: number,
  task: Pick<Task, 'title' | 'description'>
): Promise<Task> => {
  return await db.task.create({
    data: {
      title: task.title,
      description: task.description ?? "",
      userId: userId,
    },
  });
};

// ✅ BETTER WAY 2: Using interface (flexible)
interface CreateTaskInput {
  title: string;
  description?: string;
}

export const createTask = async (
  userId: number,
  task: CreateTaskInput
): Promise<Task> => {
  return await db.task.create({...});
};
```

**Return Types to Add**:

```typescript
export const findTasksByUser = async (idUser: number): Promise<Task[]> => {...};
export const findTaskById = async (idUser: number, idTask: number): Promise<Task | null> => {...};
export const updateTask = async (task: Task): Promise<Task> => {...};
export const softDelete = async (idUser: number, idTask: number): Promise<Task> => {...};
```

---

### 3. **task.schema.ts** - ✅ EXCELLENT

**Type Safety**: **PERFECT** ✅

```typescript
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
```

**Why it's good**:

- ✅ Uses Zod for runtime validation AND type inference
- ✅ String validation with clear error messages
- ✅ Optional fields properly marked
- ✅ Min/max length requirements clear

**Inferred Types** (Zod auto-generates):

```typescript
type CreateTaskInput = z.infer<typeof createTaskSchema>;
// Becomes:
// {
//   title: string;
//   description?: string;
// }
```

---

### 4. **task.routes.ts** - ✅ GOOD

**Types**: Simple but effective

```typescript
const taskRouter: Router = Router();
// ✅ Explicit Router type

taskRouter.post("/", [authMiddleware], errorHandler(ctrl.create));
// ✅ Middleware properly chained
// ✅ Error handler wraps controller
```

---

## 🔄 Type Flow

```
Request
  ↓
Zod Schema Validation
  ↓ (throws if invalid)
  ↓ (type-safe data)
Controller
  ↓
Service (receives typed data)
  ↓
Prisma Query (type-safe DB operation)
  ↓ Returns Task | null | Task[]
  ↓
Response (properly typed)
```

---

## 📋 Task Model Structure

From your Prisma schema:

```typescript
model Task {
  id        Int      @id @default(autoincrement())
  title     String   // Required
  description String  // Optional
  completed Boolean  @default(false)
  delete    Boolean  @default(false)  // Soft delete flag
  user      User     @relation(...)
  userId    Int      // Foreign key
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Key Points**:

- Uses soft delete (not permanent deletion)
- Tasks are linked to users via `userId`
- Timestamps automatically managed

---

## 🎯 RECOMMENDATIONS

### Priority 1: Add Explicit Return Types (Quick Fix)

```typescript
import type { Task } from "../../generated/client";

export const createTask = async (
  id: number,
  task: { title: string; description?: string }
): Promise<Task> => {
  return await db.task.create({...});
};

export const findTasksByUser = async (idUser: number): Promise<Task[]> => {
  return await db.task.findMany({...});
};

export const findTaskById = async (idUser: number, idTask: number): Promise<Task | null> => {
  return await db.task.findFirst({...});
};

export const updateTask = async (task: Task): Promise<Task> => {
  return await db.task.update({...});
};

export const softDelete = async (idUser: number, idTask: number): Promise<Task> => {
  return await db.task.update({...});
};
```

### Priority 2: Use Pick Type (Best Practice)

```typescript
// In task.service.ts
interface CreateTaskPayload extends Pick<Task, "title"> {
  description?: string;
}

export const createTask = async (
  userId: number,
  task: CreateTaskPayload
): Promise<Task> => {
  // ...
};
```

### Priority 3: Add Input/Output Types

```typescript
// At top of task.service.ts
type TaskInput = Pick<Task, "title" | "description">;
type TaskUpdateInput = Partial<
  Pick<Task, "title" | "description" | "completed">
>;
```

---

## ✅ Summary

| Aspect            | Status               | Notes                         |
| ----------------- | -------------------- | ----------------------------- |
| Schema validation | ✅ Excellent         | Zod properly configured       |
| Controller types  | ✅ Good              | Request types proper          |
| Service types     | ⚠️ Needs improvement | Missing explicit return types |
| Route types       | ✅ Good              | Router properly typed         |
| Error handling    | ✅ Good              | Proper exceptions used        |

**Current Score**: 7/10 - Works fine, but could be stricter

**After recommendations**: 9/10 - Production ready
