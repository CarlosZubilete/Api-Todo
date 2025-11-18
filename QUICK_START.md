# 🚀 Quick Start Guide for New Developers

Welcome to the API Todo project! This guide will get you up and running in **5 minutes**.

---

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
cd api-todo
pnpm install
```

### Step 2: Setup Database (1 min)

```bash
# Generate Prisma client
pnpm prisma generate

# Setup environment
cp .env.example .env

# Run migrations
pnpm prisma migrate dev --name init
```

### Step 3: Start Development Server (1 min)

```bash
pnpm dev
```

Server running at: `http://localhost:3000`

### Step 4: Test the API (2 min)

**Sign Up:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

Save the JWT token from the response!

**Create a Task:**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=<your_jwt_token>" \
  -d '{
    "title": "Learn TypeScript",
    "description": "Complete the TypeScript basics course"
  }'
```

---

## 📚 Read the Documentation

Now that you're up and running, read these files in order:

### 1. **README.md** (10 min)

- Project overview
- Technology stack
- Architecture overview
- All available endpoints

### 2. **docs/middleware.md** (5 min)

- How authentication works
- How errors are handled
- Request pipeline

### 3. **docs/auth-module.md** (10 min)

- Sign up / Login flow
- JWT tokens
- Security features

### 4. **docs/tasks.md** (10 min)

- All task endpoints
- Request/response examples
- Validation rules

### 5. **docs/exceptions.md** (5 min)

- Error codes reference
- Error handling patterns
- When to use which exception

### 6. **docs/users-module.md** (10 min)

- Admin-only operations
- User management
- Role-based access control

---

## 🔍 Explore the Code

### Project Structure

```
src/
├── app.ts                  # Express app setup
├── middleware/             # Authentication & error handling
├── modules/
│   ├── auth/              # Login/Signup
│   ├── tasks/             # Task CRUD
│   └── users/             # User management (admin)
├── exceptions/            # Custom error classes
└── types/                 # TypeScript definitions
```

### Key Files to Read

1. `src/app.ts` - App entry point
2. `src/modules/auth/auth.routes.ts` - Example routes
3. `src/middleware/authMiddleware.ts` - How auth works
4. `src/exceptions/HttpException.ts` - Error handling

---

## 💡 Common Commands

```bash
# Development
pnpm dev                    # Start with hot reload
pnpm tsc --watch           # Check TypeScript errors

# Build & Deploy
pnpm build                 # Build for production
pnpm start                 # Run production build

# Database
pnpm prisma studio        # View database GUI
pnpm prisma migrate dev   # Create new migration
pnpm prisma migrate reset # Reset database (⚠️ deletes data)
```

---

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"

```bash
pnpm prisma generate
```

### "DATABASE_URL not set"

```bash
# Make sure .env exists with DATABASE_URL
cat .env | grep DATABASE_URL
```

### "Port 3000 already in use"

```bash
# Change PORT in .env
# Or kill the process using port 3000
lsof -i :3000
kill -9 <PID>
```

### Database errors

```bash
# Reset database (careful: deletes all data!)
pnpm prisma migrate reset
```

---

## 🎯 Next Steps

### Learn the Architecture

1. Read how **middleware** processes requests
2. Understand **authentication** with JWT
3. Learn **error handling** patterns
4. See **CRUD operations** in tasks module

### Make Your First Changes

1. Add a new field to Task in Prisma schema
2. Create a Prisma migration
3. Update the task controller/service
4. Test the new endpoint

### Deploy the Project

1. Read README.md "Production" section
2. Set production environment variables
3. Deploy to your server

---

## 📞 Need Help?

1. **Check the docs/** folder - Most questions answered there
2. **Check error codes** in `docs/exceptions.md`
3. **Check endpoint examples** in specific module docs
4. **Read the code** - It's well-commented!

---

## ✨ You're Ready!

You now have:

- ✅ Running development server
- ✅ Working authentication system
- ✅ Task management API
- ✅ Comprehensive documentation

**Start building!** 🚀

Pick an area to explore:

- **Want to understand auth?** → Read `docs/auth-module.md`
- **Want to build features?** → Look at `src/modules/tasks/`
- **Want to handle errors?** → Check `docs/exceptions.md`
- **Want to understand flow?** → Read `docs/middleware.md`

Happy coding! 💻
