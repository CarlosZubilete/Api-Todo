# 📋 API Todo - Task Management API

A modern, type-safe REST API for task management built with TypeScript, Express, and Prisma. Features JWT authentication, role-based access control, and comprehensive error handling.

---

## 🎯 What is This Project?

**API Todo** is a backend REST API that provides task management functionality with user authentication and authorization. It allows users to:

- ✅ Register and login with secure JWT tokens
- ✅ Create, read, update, and delete their own tasks
- ✅ Filter tasks by completion status
- ✅ Manage user profiles (admin-only)
- ✅ Mark tasks as completed or delete them (soft delete)

**Who is it for?**

- Frontend developers building task management applications
- Teams needing a scalable backend API for task tracking
- Anyone learning TypeScript, Express, and REST API design patterns

**What problem does it solve?**

Provides a production-ready backend for task management applications with enterprise-grade features like JWT authentication, role-based access control, soft deletes, and comprehensive error handling.

---

## 🛠️ Technology Stack

### Core Framework

- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web framework for building REST APIs
- **TypeScript 5.9.3** - Type-safe JavaScript

### Database & ORM

- **Prisma 6.19.0** - Modern ORM for database access
- **SQLite** - Lightweight SQL database (configurable to PostgreSQL/MySQL)

### Authentication & Security

- **JWT (jsonwebtoken 9.0.2)** - Secure token-based authentication
- **bcrypt 6.0.0** - Password hashing and verification
- **cookie-parser 1.4.7** - Parse and manage cookies

### Validation

- **Zod 4.1.12** - Runtime schema validation with TypeScript support

### Development Tools

- **tsx 4.20.6** - TypeScript executor for development
- **ts-node 10.9.2** - Run TypeScript directly without compilation
- **Dotenv 17.2.3** - Environment variable management

---

## 📦 Installation

### Prerequisites

- **Node.js** >= 18.x (download from [nodejs.org](https://nodejs.org))
- **pnpm** >= 8.x or **npm** >= 9.x
- **SQLite** (included with Node.js) or another database

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/CarlosZubilete/Api-Todo.git
cd api-todo

# Install dependencies using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### Step 2: Generate Prisma Client

```bash
# Generate Prisma client (required before running)
pnpm prisma generate
```

### Step 3: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration (see Configuration section below)
```

### Step 4: Set Up Database

```bash
# Run Prisma migrations
pnpm prisma migrate dev --name init

# Optional: Open Prisma Studio to view database
pnpm prisma studio
```

### Step 5: Start Development Server

```bash
# Start with hot reload
pnpm dev

# Or build and start production build
pnpm build
pnpm start
```

**Server will run at**: `http://localhost:3000`

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="file:./dev.db"

# JWT & Security
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
SALT_ROUND=10
```

### Environment Variables Explained

| Variable       | Type   | Default       | Description                                          |
| -------------- | ------ | ------------- | ---------------------------------------------------- |
| `PORT`         | number | 3000          | Port the server listens on                           |
| `NODE_ENV`     | string | development   | Environment (development/production)                 |
| `DATABASE_URL` | string | file:./dev.db | Database connection URL                              |
| `JWT_SECRET`   | string | required      | Secret key for signing JWT tokens (keep private!)    |
| `SALT_ROUND`   | number | 10            | Bcrypt salt rounds (higher = more secure but slower) |

### Example .env for Different Scenarios

**Development (SQLite)**:

```bash
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=dev_secret_key_123
SALT_ROUND=10
```

**Production (PostgreSQL)**:

```bash
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://user:password@localhost:5432/api_todo"
JWT_SECRET=your_production_secret_key_here_123456789
SALT_ROUND=12
```

---

## 🗄️ Database Setup

### Database Technologies Supported

The project currently uses **SQLite** by default, but Prisma supports:

- **SQLite** - Lightweight, file-based (perfect for development)
- **PostgreSQL** - Production-ready, powerful
- **MySQL** - Popular, reliable
- **MongoDB** - Document database
- **Microsoft SQL Server** - Enterprise

### Prisma Migrations

Migrations automatically track database schema changes.

```bash
# Create a new migration after schema changes
pnpm prisma migrate dev --name add_new_feature

# Apply migrations to production
pnpm prisma migrate deploy

# Reset database (⚠️ deletes all data - development only!)
pnpm prisma migrate reset

# View migration status
pnpm prisma migrate status

# View the database visually
pnpm prisma studio
```

### Database Schema

The project includes three main tables:

**Users**

```sql
- id (PK)
- name
- email (unique)
- password (hashed)
- role (USER or ADMIN)
- delete (soft delete flag)
- createdAt
- updatedAt
```

**Tasks**

```sql
- id (PK)
- title
- description
- completed (boolean)
- delete (soft delete flag)
- userId (FK)
- createdAt
- updatedAt
```

**Tokens**

```sql
- id (PK)
- key (JWT token)
- active (boolean)
- userId (FK)
- createdAt
- updatedAt
```

---

## 📁 Folder Structure

```
api-todo/
├── src/                          # Source code
│   ├── app.ts                    # Express app setup
│   ├── error-handler.ts          # Error handling wrapper
│   ├── secrets.ts                # Environment variables
│   ├── config/
│   │   └── db.ts                 # Prisma client initialization
│   ├── exceptions/               # Custom exception classes
│   │   ├── HttpException.ts      # Base exception with error codes
│   │   ├── BadRequestException.ts
│   │   ├── NotFoundException.ts
│   │   ├── ValidationException.ts
│   │   ├── UnauthorizedException.ts
│   │   └── InternalException.ts
│   ├── middleware/               # Express middleware
│   │   ├── authMiddleware.ts     # JWT authentication
│   │   ├── errorMiddleware.ts    # Error handling middleware
│   │   └── isAdminMiddleware.ts  # Admin role check
│   ├── modules/                  # Feature modules
│   │   ├── root.routes.ts        # Root router
│   │   ├── auth/                 # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── singUp.schema.ts  # Zod validation schema
│   │   ├── tasks/                # Task management module
│   │   │   ├── task.controller.ts
│   │   │   ├── task.service.ts
│   │   │   ├── task.routes.ts
│   │   │   └── task.schema.ts
│   │   └── users/                # User management module
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       ├── user.routes.ts
│   │       └── update.schema.ts
│   └── types/
│       └── express.d.ts          # TypeScript definitions for Express
│
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Prisma schema
│   └── migrations/               # Migration history
│
├── docs/                         # Documentation
│   ├── auth-module.md            # Auth module documentation
│   ├── users-module.md           # User management documentation
│   ├── tasks.md                  # Task management documentation
│   ├── middleware.md             # Middleware documentation
│   └── exceptions.md             # Exception handling documentation
│
├── dev/                          # Development utilities
│   ├── docker-setup.md           # Docker configuration
│   └── make-readme.md            # README generator notes
│
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Example environment variables
├── .env                          # Actual environment variables (not in git)
└── Dockerfile                    # Docker configuration

```

### Key Directories Explained

- **src/modules** - Feature modules following MVC pattern

  - `*controller.ts` - HTTP request handlers
  - `*service.ts` - Business logic
  - `*routes.ts` - Route definitions
  - `*.schema.ts` - Zod validation schemas

- **src/exceptions** - Custom error classes

  - Provide consistent error responses across API
  - Map to specific HTTP status codes and error codes

- **src/middleware** - Express middleware

  - Authentication, authorization, error handling
  - Applied to routes as needed

- **prisma** - Database layer

  - `schema.prisma` - Database models and relationships
  - `migrations` - Version-controlled schema changes

- **docs** - Comprehensive documentation
  - Each module has detailed documentation
  - Architecture and flow diagrams included

---

## 🚀 Available Commands

### Development

```bash
# Start development server with hot reload
pnpm dev

# Watch TypeScript for compilation errors
pnpm tsc --watch
```

### Production

```bash
# Build TypeScript to JavaScript
pnpm build

# Start production server
pnpm start
```

### Database

```bash
# Generate Prisma client
pnpm prisma generate

# Create new migration after schema changes
pnpm prisma migrate dev --name migration_name

# Apply migrations to production
pnpm prisma migrate deploy

# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset

# Open database GUI
pnpm prisma studio

# View migration status
pnpm prisma migrate status
```

---

## 🔐 API Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Authentication Flow

```
1. User signs up (POST /api/auth/signup)
   ↓
2. User logs in (POST /api/auth/login)
   ↓
3. Server returns JWT token in httpOnly cookie
   ↓
4. Client sends token with each request
   ↓
5. authMiddleware validates token
   ↓
6. Request proceeds or returns 401 Unauthorized
```

### Using the API

**Sign Up**:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "role": "USER"
  }'
```

**Login**:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

Response includes `Set-Cookie` header with JWT token.

**Create Task** (Authenticated):

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=<token>" \
  -d '{
    "title": "Complete project",
    "description": "Finish the task management API"
  }'
```

---

## 📚 API Endpoints

### Authentication

| Method | Path               | Description                | Auth |
| ------ | ------------------ | -------------------------- | ---- |
| POST   | `/api/auth/signup` | Create new user account    | ❌   |
| POST   | `/api/auth/login`  | Authenticate user, get JWT | ❌   |
| POST   | `/api/auth/logout` | Logout and revoke token    | ✅   |

### Tasks

| Method | Path                                    | Description            | Auth |
| ------ | --------------------------------------- | ---------------------- | ---- |
| POST   | `/api/tasks`                            | Create new task        | ✅   |
| GET    | `/api/tasks`                            | Get all user's tasks   | ✅   |
| GET    | `/api/tasks/:id`                        | Get specific task      | ✅   |
| GET    | `/api/tasks/task?completed=true\|false` | Filter tasks by status | ✅   |
| PATCH  | `/api/tasks/:id`                        | Update task            | ✅   |
| PATCH  | `/api/tasks/:id/complete`               | Mark task as completed | ✅   |
| DELETE | `/api/tasks/:id`                        | Soft delete task       | ✅   |

### Users (Admin-only)

| Method | Path                                  | Description            | Auth |
| ------ | ------------------------------------- | ---------------------- | ---- |
| GET    | `/api/users`                          | Get all users          | ✅👑 |
| GET    | `/api/users/:id`                      | Get specific user      | ✅👑 |
| GET    | `/api/users/user?deleted=true\|false` | Filter users by status | ✅👑 |
| PATCH  | `/api/users/:id`                      | Update user            | ✅👑 |
| DELETE | `/api/users/:id`                      | Soft delete user       | ✅👑 |

✅ = Requires Authentication | 👑 = Requires Admin Role

---

## 📖 Documentation

Complete documentation is available in the `docs/` folder:

- **[auth-module.md](docs/auth-module.md)** - Authentication & JWT
- **[users-module.md](docs/users-module.md)** - User management
- **[tasks.md](docs/tasks.md)** - Task management & type safety
- **[middleware.md](docs/middleware.md)** - Middleware architecture
- **[exceptions.md](docs/exceptions.md)** - Error handling & exception codes

Each document includes:

- Architecture overview
- File-by-file breakdown
- Request/response examples
- Error codes reference
- Best practices
- Type safety information

---

## 🔍 Project Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│      HTTP Client (Postman, etc)     │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│        Express Middleware           │
│ ┌───────────────────────────────┐  │
│ │ • Error Handler               │  │
│ │ • Auth Middleware             │  │
│ │ • Admin Middleware            │  │
│ └───────────────────────────────┘  │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│        Route Controllers            │
│ ┌───────────────────────────────┐  │
│ │ • Auth Controller             │  │
│ │ • Task Controller             │  │
│ │ • User Controller             │  │
│ └───────────────────────────────┘  │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│        Service Layer                │
│ ┌───────────────────────────────┐  │
│ │ • Auth Service                │  │
│ │ • Task Service                │  │
│ │ • User Service                │  │
│ └───────────────────────────────┘  │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Prisma ORM                     │
│ ┌───────────────────────────────┐  │
│ │ Database Queries              │  │
│ └───────────────────────────────┘  │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      SQLite Database                │
│ ┌───────────────────────────────┐  │
│ │ Users | Tasks | Tokens        │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Data Flow

```
Request → Validation → Authentication → Authorization → Business Logic → Database → Response
```

---

## ✨ Features

### Security

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ httpOnly cookies (XSS protection)
- ✅ Role-based access control (ADMIN/USER)
- ✅ User isolation (users only access their own data)
- ✅ Self-demotion protection (admins can't demote themselves)

### Data Management

- ✅ Soft deletes (data not permanently removed)
- ✅ Timestamps (createdAt, updatedAt)
- ✅ Unique constraints (email)
- ✅ Foreign key relationships

### Error Handling

- ✅ Comprehensive error codes (1000-7000)
- ✅ Consistent error response format
- ✅ Validation error details
- ✅ HTTP status codes
- ✅ Error middleware

### Validation

- ✅ Zod schema validation
- ✅ Input sanitization (trim)
- ✅ Min/max length constraints
- ✅ Email format validation
- ✅ Enum validation (roles)

### Developer Experience

- ✅ Full TypeScript support
- ✅ Hot reload development server
- ✅ Comprehensive documentation
- ✅ Clear error messages
- ✅ Middleware pattern

---

## 🐛 Common Issues

### Issue: `Cannot find module '@prisma/client'`

**Solution**: Generate Prisma client

```bash
pnpm prisma generate
```

### Issue: `DATABASE_URL not set`

**Solution**: Create `.env` file with DATABASE_URL

```bash
echo 'DATABASE_URL="file:./dev.db"' > .env
```

### Issue: Port already in use

**Solution**: Change PORT in `.env` or stop process using port 3000

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Issue: Migration conflicts

**Solution**: Reset migrations (⚠️ deletes data)

```bash
pnpm prisma migrate reset
```

---

## 📊 Performance & Scalability

### Current Optimizations

- Indexed database queries
- Efficient Prisma queries
- Middleware caching opportunities
- Error handling reduces overhead

### Future Improvements

- Add pagination to list endpoints
- Implement database connection pooling
- Add rate limiting
- Cache frequently accessed data
- Add request logging

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💡 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT.io](https://jwt.io/)
- [Zod Documentation](https://zod.dev/)

---

## 📞 Support

For issues, questions, or suggestions:

1. Check existing documentation in `docs/`
2. Review error codes in `exceptions.md`
3. Open an issue on GitHub
4. Contact the development team

---

## 🎓 Getting Started Guide

**For beginners**, here's the quickest way to get started:

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
pnpm prisma generate

# 3. Create .env file
echo 'PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=dev_secret_123
SALT_ROUND=10' > .env

# 4. Run migrations
pnpm prisma migrate dev --name init

# 5. Start server
pnpm dev

# 6. Open another terminal and test the API
curl http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Pass123"}'
```

Then explore the detailed documentation in the `docs/` folder!

---

**Happy coding! 🚀**
