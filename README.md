# 📋 API Todo — Task Management API

A modern, type-safe REST API for task management built with **TypeScript**, **Express**, and **Prisma**. Includes JWT authentication, role-based access control, soft deletes, and structured error handling — ready for production or learning.

---

## 🎯 Overview

**API Todo** is a backend REST API that provides task and user management functionality with secure authentication and authorization. The API is intended for developers building task-oriented apps, engineers learning full‑stack patterns, and teams who want a robust, deployable backend.

**Highlights:**

- Secure JWT authentication with httpOnly cookies
- Role-based access control (USER / ADMIN)
- CRUD operations for tasks and users
- Soft deletes and audit timestamps
- Zod validation and consistent error handling

---

## 📦 Technology Stack

- **Node.js** (runtime)
- **Express 5** (HTTP framework)
- **TypeScript** (type safety)
- **Prisma** (ORM)
- **SQLite** (default; configurable to PostgreSQL/MySQL)
- **jsonwebtoken** (JWT)
- **bcrypt** (password hashing)
- **Zod** (runtime validation)

---

## 🚀 Quick start

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm
- (Optional) PostgreSQL / MySQL for production

### Clone & install

```bash
git clone https://github.com/CarlosZubilete/Api-Todo.git
cd Api-Todo
pnpm install
# or: npm install
```

### Environment

Copy the example env file and update values:

```bash
cp .env.example .env
# then edit .env
```

Minimal `.env` example (development / SQLite):

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=dev_secret_key_123
SALT_ROUND=10
```

### Generate Prisma client

```bash
pnpm prisma generate
```

### Database migrations (development)

```bash
# create migrations after schema changes
pnpm prisma migrate dev --name init
# open Prisma Studio (visual DB explorer)
pnpm prisma studio
```

### Start server

```bash
# development (hot-reload)
pnpm dev

# production build
pnpm build
pnpm start
```

Server will run at: `http://localhost:3000`

---

## ⚙ Configuration

Key environment variables (see `.env.example`):

| Variable       | Type   | Default         | Description                        |
| -------------- | ------ | --------------- | ---------------------------------- |
| `PORT`         | number | `3000`          | Server port                        |
| `NODE_ENV`     | string | `development`   | `development` or `production`      |
| `DATABASE_URL` | string | `file:./dev.db` | Prisma database URL                |
| `JWT_SECRET`   | string | required        | Secret to sign JWTs (keep private) |
| `SALT_ROUND`   | number | `10`            | Bcrypt salt rounds                 |

---

## 📁 Project structure (key files)

```
api-todo/
├─ src/
│  ├─ app.ts                 # Express app setup
│  ├─ server.ts              # Server bootstrap
│  ├─ secrets.ts             # Environment helpers
│  ├─ config/db.ts           # Prisma client instance
│  ├─ middleware/            # auth, error handlers, admin check
│  ├─ exceptions/            # custom exception classes
│  └─ modules/               # feature modules (auth, tasks, users)
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ docs/
├─ package.json
├─ tsconfig.json
└─ Dockerfile
```

---

## 🔐 Authentication & Authorization

- **Flow:** signup → login → server sets JWT in httpOnly cookie → client sends cookie on subsequent requests → `authMiddleware` validates token
- **Roles:** `USER`, `ADMIN` — admin-only routes are protected by `isAdminMiddleware`

Example signup request:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePassword123"}'
```

Login returns a `Set-Cookie` header containing the JWT.

---

## 🧭 API Endpoints (summary)

### Auth

| Method | Path               | Description             | Auth |
| ------ | ------------------ | ----------------------- | ---- |
| POST   | `/api/auth/signup` | Create user             | No   |
| POST   | `/api/auth/login`  | Authenticate, set token | No   |
| POST   | `/api/auth/logout` | Revoke token            | Yes  |

### Tasks (authenticated)

| Method | Path                       | Description         |                            |
| ------ | -------------------------- | ------------------- | -------------------------- |
| POST   | `/api/tasks`               | Create a task       |                            |
| GET    | `/api/tasks`               | List user's tasks   |                            |
| GET    | `/api/tasks/:id`           | Get a task by id    |                            |
| GET    | `/api/tasks?completed=true | false`              | Filter tasks by completion |
| PATCH  | `/api/tasks/:id`           | Update a task       |                            |
| PATCH  | `/api/tasks/:id/complete`  | Mark task completed |                            |
| DELETE | `/api/tasks/:id`           | Soft delete a task  |                            |

### Users (admin only)

| Method | Path                     | Description      |                   |
| ------ | ------------------------ | ---------------- | ----------------- |
| GET    | `/api/users`             | List users       |                   |
| GET    | `/api/users/:id`         | Get user by id   |                   |
| GET    | `/api/users?deleted=true | false`           | Filter by deleted |
| PATCH  | `/api/users/:id`         | Update user      |                   |
| DELETE | `/api/users/:id`         | Soft delete user |                   |

---

## 🗄️ Database schema (summary)

**Users**: `id`, `name`, `email` (unique), `password` (hashed), `role`, `deleted` (soft flag), `createdAt`, `updatedAt`

**Tasks**: `id`, `title`, `description`, `completed` (boolean), `deleted` (soft flag), `userId` (FK), `createdAt`, `updatedAt`

**Tokens**: `id`, `key` (JWT), `active` (boolean), `userId` (FK), `createdAt`, `updatedAt`

(See `prisma/schema.prisma` for the authoritative schema.)

---

## 🧪 Common issues & troubleshooting

- **Cannot find module `@prisma/client`**

  ```bash
  pnpm prisma generate
  ```

- **`DATABASE_URL` not set**

  ```bash
  echo 'DATABASE_URL="file:./dev.db"' > .env
  ```

- **Port already in use**

  ```bash
  lsof -i :3000
  kill -9 <PID>
  ```

- **Migration conflicts during development** (⚠️ destructive)

  ```bash
  pnpm prisma migrate reset
  ```

---

## 🐳 Docker (optional)

Docker image is published on Docker Hub (if you maintain it there). Example usage:

```bash
# pull published image
docker pull happykitten/api-todo:v1.0.0

# run (example)
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="your_secret" \
  happykitten/api-todo:v1.0.0
```

(If you want, I can add a `docker-compose.yml` and a multi-stage `Dockerfile` optimized for production.)

---

## ✅ Recommended next steps / improvements

- Add pagination for list endpoints
- Add request logging (morgan / pino)
- Add rate limiting
- Use PostgreSQL (or managed DB) in production
- Add integration tests and CI (GitHub Actions)
- Add API docs (OpenAPI / Swagger)

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit changes with clear messages
4. Open a pull request

Please follow the code style and include tests for major features.

---

## 📝 License

This project is licensed under the **MIT License**.

---
