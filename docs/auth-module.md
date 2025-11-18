# Auth Module - Authentication & JWT

The Auth module handles user registration, login, and logout functionality with JWT (JSON Web Tokens) and httpOnly cookies.

---

## 🏗️ Module Structure

```
auth/
├── auth.controller.ts     # Request handlers
├── auth.service.ts        # Business logic (DB operations)
├── auth.routes.ts         # Route definitions
└── singUp.schema.ts        # Zod validation schema
```

---

## 🔐 Authentication Flow

### 1. **Sign Up Flow**

```
POST /auth/signup
  ↓
Controller validates request body with Zod schema
  ↓
Check if user already exists
  ├─ If yes → BadRequestException (USER_ALREADY_EXISTS)
  ↓
Hash password with bcrypt
  ↓
Save user to database
  ↓
Return user email and role (201 Created)
```

### 2. **Login Flow**

```
POST /auth/login
  ↓
Find user by email
  ├─ If not found → NotFoundException (USER_NOT_FOUND)
  ↓
Compare password with bcrypt
  ├─ If mismatch → BadRequestException (INCORRECT_PASSWORD)
  ↓
Generate JWT token
  ↓
Save token in Token table
  ↓
Set httpOnly cookie with JWT
  ↓
Return user ID and success message (200 OK)
```

### 3. **Logout Flow**

```
POST /auth/logout [Protected - Requires JWT]
  ↓
authMiddleware validates JWT token
  ├─ If invalid → UnauthorizedException (UNAUTHORIZED)
  ↓
Delete token from Token table
  ├─ If not found → NotFoundException (TOKEN_NOT_FOUND)
  ↓
Clear JWT cookie
  ↓
Return user ID and success message (201 Created)
```

---

## 📄 File Details

### **singUp.schema.ts** - Zod Validation Schema

Defines validation rules for signup requests using Zod.

```typescript
export const singUpSchema = z.object({
  name: z.string().trim().min(6, "Name must be at least 6 characters"),
  email: z
    .email("Invalid email")
    .trim()
    .min(6, "Email must be at least 6 characters"),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "ADMIN"]).optional(),
});
```

**Validation Rules**:

| Field      | Type   | Rules                                            |
| ---------- | ------ | ------------------------------------------------ |
| `name`     | string | Min 6 chars, trimmed                             |
| `email`    | string | Valid email format, min 6 chars, trimmed         |
| `password` | string | Min 6 chars, trimmed                             |
| `role`     | enum   | "USER" or "ADMIN", optional (defaults to "USER") |

**Usage**:

```typescript
const data = singUpSchema.parse(req.body);
// If validation fails, throws ZodError → ValidationException (400)
// If valid, returns typed object:
// { name: string, email: string, password: string, role?: "USER" | "ADMIN" }
```

---

### **auth.controller.ts** - Request Handlers

Processes HTTP requests and coordinates with the service layer.

#### `signup` Handler

```typescript
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Validate request body
  let data = singUpSchema.parse(req.body);

  // 2. Check if user already exists
  const existingUser = await service.isExists({ email: data.email });
  if (existingUser)
    return next(
      new BadRequestException(
        "User already exists!",
        ErrorCode.USER_ALREADY_EXISTS
      )
    );

  // 3. Create new user
  const user = await service.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data?.role ?? "USER",
  });

  // 4. Return success response
  res.status(201).json({ email: user.email, role: user.role });
};
```

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "USER"
}
```

**Success Response (201)**:

```json
{
  "email": "john@example.com",
  "role": "USER"
}
```

**Error Responses**:

- `400 - User already exists` (ERROR_CODE: 1002)
- `400 - Validation failed` (ERROR_CODE: 5002) - Invalid email, short password, etc.

---

#### `login` Handler

```typescript
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  // 1. Find user by email
  const user = await service.isExists({ email });
  if (!user)
    return next(
      new NotFoundException("User does not exist!", ErrorCode.USER_NOT_FOUND)
    );

  // 2. Compare passwords
  if (!compareSync(password, user.password))
    return next(
      new BadRequestException(
        "Incorrect password!",
        ErrorCode.INCORRECT_PASSWORD
      )
    );

  // 3. Create JWT token and save to DB
  const token = await service.createToken(user);

  // 4. Set httpOnly cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  // 5. Return success response
  res.status(200).json({ userID: user.id, message: "Login success!" });
};
```

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200)**:

```json
{
  "userID": 1,
  "message": "Login success!"
}
```

**Error Responses**:

- `404 - User not found` (ERROR_CODE: 1001)
- `400 - Incorrect password` (ERROR_CODE: 1003)

**Cookie Set**: `jwt=<token>` (httpOnly, secure)

---

#### `logout` Handler

```typescript
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Delete token from database
  const userToken = await service.deleteToken(req.token.key, req.token.id);

  if (!userToken)
    return next(
      new NotFoundException("Token does not exist!", ErrorCode.TOKEN_NOT_FOUND)
    );

  // 2. Clear JWT cookie
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: NODE_ENV === "production",
  });

  // 3. Return success response
  res.status(201).json({
    userId: userToken.userId,
    message: "Logout success",
  });
};
```

**Requirements**: `[authMiddleware]` - User must be logged in

**Success Response (201)**:

```json
{
  "userId": 1,
  "message": "Logout success"
}
```

**Error Responses**:

- `401 - Unauthorized` (ERROR_CODE: 4001) - No valid token
- `404 - Token not found` (ERROR_CODE: 6001) - Token already deleted

---

### **auth.service.ts** - Business Logic

Handles database operations and JWT token management.

#### `create` - Register New User

```typescript
export const create = async (
  user: Pick<User, "name" | "email" | "password" | "role">
) => {
  const result = await db.user.create({
    data: {
      name: user.name,
      email: user.email,
      password: hashSync(user.password, parseInt(SALT_ROUND)),
      role: user.role,
    },
  });
  return result;
};
```

**What it does**:

1. Hash password using bcrypt (SALT_ROUND from env)
2. Create user in database
3. Return created user object

**Parameters**:

- `user`: Object with name, email, password, role

**Returns**: `Promise<User>` - Created user

---

#### `isExists` - Check User Existence

```typescript
export const isExists = async (user: Pick<User, "email">) => {
  return await db.user.findFirst({
    where: {
      email: user.email,
      delete: false, // Ignore soft-deleted users
    },
  });
};
```

**What it does**:

1. Find user by email
2. Exclude soft-deleted users (delete: false)

**Parameters**:

- `user`: Object with email

**Returns**: `Promise<User | null>` - User if found, null otherwise

---

#### `createToken` - Generate JWT Token

```typescript
export const createToken = async (
  user: Pick<User, "id" | "name" | "email" | "password" | "role">
) => {
  // 1. Generate JWT token (expires in 1 hour)
  const token = jwt.sign(
    {
      sub: user.id, // Subject (user ID)
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 2. Save token to database
  const saveToken = await db.token.create({
    data: {
      key: token,
      userId: user.id,
    },
  });

  if (!saveToken) throw new Error("Can't save token into Token table");
  return token;
};
```

**What it does**:

1. Sign JWT with user info and 1-hour expiration
2. Save token key to Token table (for revocation/logout)
3. Return token string

**JWT Payload**:

```typescript
{
  sub: number,      // User ID
  name: string,
  role: string,
  iat: number,      // Issued at (auto)
  exp: number       // Expires in (1 hour)
}
```

**Returns**: `Promise<string>` - JWT token

---

#### `deleteToken` - Revoke Token on Logout

```typescript
export const deleteToken = async (token: string, id: number) => {
  return await db.token.delete({
    where: {
      id,
      key: token,
      active: true,
    },
  });
};
```

**What it does**:

1. Delete token from Token table
2. Only deletes if token is active

**Parameters**:

- `token`: JWT token string
- `id`: Token ID in database

**Returns**: `Promise<Token>` - Deleted token object

---

### **auth.routes.ts** - Route Definitions

```typescript
const authRouter: Router = Router();

// Public routes (no authentication required)
authRouter.post("/signup", errorHandler(ctrl.signup));
authRouter.post("/login", errorHandler(ctrl.login));

// Protected route (requires authentication)
authRouter.post("/logout", [authMiddleware], errorHandler(ctrl.logout));

export default authRouter;
```

**Endpoints**:

| Method | Path      | Middleware     | Handler                           |
| ------ | --------- | -------------- | --------------------------------- |
| POST   | `/signup` | -              | Create new user                   |
| POST   | `/login`  | -              | Authenticate user, set JWT cookie |
| POST   | `/logout` | authMiddleware | Revoke token, clear cookie        |

---

## 🔐 Security Features

### 1. **Password Hashing**

- Passwords are hashed using bcrypt
- SALT_ROUND from environment (typically 10)
- Never stored in plaintext

### 2. **JWT Token**

- Signed with JWT_SECRET
- Expires in 1 hour
- Contains user ID, name, and role
- Stored in httpOnly cookie (not accessible to JavaScript)

### 3. **Token Revocation**

- Token stored in database when created
- Deleted from database when user logs out
- authMiddleware checks token existence in DB

### 4. **httpOnly Cookie**

```typescript
res.cookie("jwt", token, {
  httpOnly: true, // Not accessible to JavaScript
  secure: NODE_ENV === "production", // HTTPS only in production
  maxAge: 60 * 60 * 1000, // 1 hour
});
```

**Benefits**:

- Protects against XSS attacks
- Automatically sent with each request
- Cannot be stolen via JavaScript

---

## 🔄 Data Models

### User Model

```typescript
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String   // Hashed password
  role      String   @default("USER") // USER or ADMIN
  delete    Boolean  @default(false)  // Soft delete
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]   // Relation to tasks
  tokens    Token[]  // Relation to tokens
}
```

### Token Model

```typescript
model Token {
  id        Int      @id @default(autoincrement())
  key       String   // JWT token
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🛠️ Type Safety

```typescript
import type { User } from "@prisma/client";
import type { JwtPayload } from "jsonwebtoken";

// JWT Payload Type
interface AuthPayload extends JwtPayload {
  sub: string; // User ID as string
  name: string;
  role: string;
}

// Express Request Extension
declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        role: string;
      };
      token: {
        id: number;
        key: string;
      };
    }
  }
}
```

---

## 📊 Error Codes

| Code | Error               | HTTP | Description               |
| ---- | ------------------- | ---- | ------------------------- |
| 1001 | USER_NOT_FOUND      | 404  | User doesn't exist        |
| 1002 | USER_ALREADY_EXISTS | 400  | Email already registered  |
| 1003 | INCORRECT_PASSWORD  | 400  | Wrong password            |
| 4001 | UNAUTHORIZED        | 401  | Invalid/missing JWT token |
| 5002 | VALIDATION_ERROR    | 400  | Schema validation failed  |
| 6001 | TOKEN_NOT_FOUND     | 404  | Token already deleted     |

---

## 💡 Usage Examples

### Sign Up

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "USER"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

The response sets a cookie that's automatically sent with subsequent requests.

### Logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Cookie: jwt=<token>"
```

The token is deleted from the database and the cookie is cleared.

---

## 🎯 Best Practices

### ✅ DO:

```typescript
// ✅ Always validate input with Zod
const data = singUpSchema.parse(req.body);

// ✅ Use specific error codes
throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);

// ✅ Hash passwords before saving
password: hashSync(user.password, parseInt(SALT_ROUND));

// ✅ Protect routes with authMiddleware
router.post("/logout", [authMiddleware], handler);
```

### ❌ DON'T:

```typescript
// ❌ Store plaintext passwords
password: user.password;

// ❌ Expose sensitive error details
res.json({ error: error.message, stack: error.stack });

// ❌ Skip validation
const email = req.body.email; // No validation!

// ❌ Use generic error messages
throw new Error("Something went wrong");
```

---

## 📝 Summary

The Auth module provides:

- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Token revocation on logout
- ✅ httpOnly cookie handling
- ✅ Password hashing with bcrypt
- ✅ Role-based access (USER/ADMIN)
- ✅ Comprehensive error handling

All authentication is handled through JWT tokens stored in secure httpOnly cookies.
