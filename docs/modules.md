# API Todo - Modules Documentation

## Overview

This API Todo application is organized into modules, each handling a specific feature. Every module follows a consistent pattern: **routes → controller → service → database**.

---

## 📋 Module Structure Pattern

Each module contains:

- **Routes** (`*.routes.ts`): Defines HTTP endpoints
- **Controller** (`*.controller.ts`): Handles HTTP requests/responses
- **Service** (`*.service.ts`): Contains business logic and database operations
- **Schema** (`*.schema.ts`): Validates request data using Zod

```
┌─────────────┐
│    Routes   │ (HTTP endpoints)
└──────┬──────┘
       ↓
┌─────────────┐
│ Controller  │ (Request handler)
└──────┬──────┘
       ↓
┌─────────────┐
│  Service    │ (Business logic)
└──────┬──────┘
       ↓
┌─────────────┐
│  Database   │ (Prisma queries)
└─────────────┘
```

---

## 🔑 Modules

### 1. **Auth Module** (`/modules/auth/`)

**Purpose**: User authentication and token management

**Responsibilities**:

- User registration (signup)
- User login
- User logout
- JWT token creation and management
- Cookie-based session handling

**Key Endpoints**:

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and receive JWT token (stored in cookie)
- `POST /auth/logout` - Logout and invalidate token

**Key Functions**:

- `signup()`: Creates new user, validates email uniqueness
- `login()`: Validates credentials, creates JWT token, sets httpOnly cookie
- `logout()`: Removes token from database and clears cookie

**Files**:

- `auth.controller.ts` - Handles signup, login, logout requests
- `auth.service.ts` - User creation, token management, credential validation
- `singUp.schema.ts` - Validates signup request (name, email, password)

---

### 2. **Tasks Module** (`/modules/tasks/`)

**Purpose**: Todo task management (CRUD operations)

**Responsibilities**:

- Create new tasks
- List user's tasks
- Get specific task details
- Update task information
- Delete tasks (soft delete)

**Key Endpoints**:

- `POST /tasks` - Create a new task
- `GET /tasks` - List all tasks for authenticated user
- `GET /tasks/:id` - Get specific task by ID
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete (soft delete) a task

**Key Functions**:

- `create()`: Validates and creates new task for user
- `list()`: Retrieves all non-deleted tasks for authenticated user
- `findOne()`: Gets specific task if it belongs to user
- `update()`: Updates task fields (title, description, completed status)
- `deleted()`: Soft deletes task (marks as deleted, doesn't remove from DB)

**Files**:

- `task.controller.ts` - Handles task HTTP requests
- `task.service.ts` - Task database operations (create, read, update, delete)
- `task.schema.ts` - Validates task creation and update requests
  - `createTaskSchema`: Requires title (6-50 chars), optional description (10-255 chars)
  - `updateTaskSchema`: All fields optional

**Important**: Uses **soft delete** - tasks marked as deleted are filtered out but remain in database

---

### 3. **Users Module** (`/modules/users/`)

**Purpose**: User management and administration

**Responsibilities**:

- List all users
- Filter users (active/deleted)
- Find user by ID
- Update user information
- Delete users (soft delete)

**Key Endpoints**:

- `GET /users` - List all users (admin only)
- `GET /users?deleted=true/false` - Filter users by status (admin only)
- `GET /users/:id` - Get user details (admin only)
- `PATCH /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only, soft delete)

**Key Functions**:

- `listUser()`: Returns all users
- `listFilerUsers()`: Filters users by deleted status
- `findUser()`: Gets specific user by ID
- `updateUser()`: Updates user data with self-demotion prevention
- `softDelete()`: Marks user as deleted

**Important Features**:

- **Self-demotion prevention**: Admin cannot demote themselves
- **Soft delete**: Users marked as deleted, not permanently removed
- **Password handling**: Passwords are hashed with bcrypt

**Files**:

- `user.controller.ts` - Handles user HTTP requests
- `user.service.ts` - User database operations
- `update.schema.ts` - Validates user update requests

---

## 🔐 Authentication Flow

1. **Signup**: User creates account → Password hashed → User stored in DB
2. **Login**: Email + password verified → JWT token created → Token stored in DB → Cookie set (httpOnly)
3. **Protected Routes**: JWT cookie automatically sent → authMiddleware verifies → Request proceeds
4. **Logout**: Token invalidated in DB → Cookie cleared

---

## 📊 Database Models

### Task

```
- id (Int, primary key)
- title (String) - Required
- description (String) - Optional
- completed (Boolean) - Default: false
- delete (Boolean) - Default: false (soft delete flag)
- userId (Int) - Foreign key to User
- createdAt (DateTime)
- updatedAt (DateTime)
```

### User

```
- id (Int, primary key)
- name (String)
- email (String) - Unique
- password (String) - Hashed
- role (Role enum) - ADMIN or USER
- delete (Boolean) - Default: false (soft delete flag)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Token

```
- id (Int, primary key)
- key (String) - The JWT token
- active (Boolean) - Default: true
- userId (Int) - Foreign key to User
- createdAt (DateTime)
- updatedAt (DateTime)
```

---

## 🛡️ Access Control

- **Public Routes**: Signup, Login
- **Authenticated Routes**: Create/update/delete own tasks, logout
- **Admin Routes**: Manage users and view admin panel
- **Protected with**: JWT token in httpOnly cookie + authMiddleware

---

## ⚠️ Error Handling

All modules use custom exception classes:

- `BadRequestException` - Invalid request data (400)
- `NotFoundException` - Resource not found (404)
- `UnauthorizedException` - Invalid/missing token (401)
- `InternalException` - Server errors (500)

Each exception includes:

- `message`: Readable error message
- `errorCode`: Numeric code for frontend handling
- `errors`: Optional validation details
