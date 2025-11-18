# Middleware Documentation

Middleware in Express are functions that execute before route handlers. They process requests, validate data, and manage authentication/authorization.

---

## 🔒 Auth Middleware (`authMiddleware.ts`)

**Purpose**: Verify JWT token and attach user information to requests

**How it works**:

1. Extract JWT token from httpOnly cookie
2. Verify token signature using JWT_SECRET
3. Find token in database and check if it's active
4. If valid, attach user info to `req.user` object
5. If invalid, return 401 Unauthorized error

**What it does**:

- ✅ Validates JWT token
- ✅ Checks token exists in DB (hasn't been revoked)
- ✅ Attaches user ID and role to request
- ✅ Attaches token ID and key to request for logout

**Attached to Request**:

```typescript
req.user = {
  id: number, // User ID
  role: string, // User role (ADMIN or USER)
};

req.token = {
  id: number, // Token ID in DB
  key: string, // JWT token string
};
```

**Usage in Routes**:

```typescript
// Protected route - requires authentication
router.get("/tasks", [authMiddleware], handler);
```

**Type Safety**:

```typescript
interface AuthPayload extends JwtPayload {
  sub: string; // User ID (as string in JWT)
  name: string; // User name
  role: string; // User role
}
```

---

## 👮 Is Admin Middleware (`isAdminMiddleware.ts`)

**Purpose**: Verify user has ADMIN role before allowing access

**How it works**:

1. Check `req.user.role` (attached by authMiddleware)
2. If role is not "ADMIN", return 401 Unauthorized
3. If role is "ADMIN", allow request to proceed

**Requirement**:

- Must use AFTER authMiddleware
- Assumes `req.user` already exists

**Usage in Routes**:

```typescript
// Admin-only route
router.get("/users", [authMiddleware, isAdminMiddleware], handler);
```

**Error Response**:

```json
{
  "message": "Access Denied. Admins only",
  "errorCode": 4001
}
```

---

## 🚨 Error Middleware (`errorMiddleware.ts`)

**Purpose**: Catch and format all errors into consistent JSON responses

**How it works**:

1. Express calls error middleware when `next(error)` is invoked
2. Extract error details from HttpException
3. Build response object with message and error code
4. Only include `errors` field if there are validation errors
5. Send formatted JSON response with appropriate HTTP status

**Key Feature**:

- Only includes `errors` field if needed (avoids `null` values)

**Response Format**:

```json
{
  "message": "Error description",
  "errorCode": 1001
}
```

With validation errors:

```json
{
  "message": "Invalid request",
  "errorCode": 2001,
  "errors": {
    "title": "Title must be at least 6 characters"
  }
}
```

**Usage**:
Must be registered LAST in Express app:

```typescript
app.use(errorMiddleware); // ⚠️ Must be last
```

**Note**: Error middleware must be placed after all other routes and middleware

---

## 🔄 Middleware Execution Order

1. **Request arrives**

   ```
   Request → authMiddleware → isAdminMiddleware → Route Handler
   ```

2. **If authentication fails**

   ```
   Request → authMiddleware (fails) → errorMiddleware → Response
   ```

3. **If route throws error**
   ```
   Request → Handler (error) → errorMiddleware → Response
   ```

---

## 📝 Type System

**Request Extension** (TypeScript):

```typescript
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

Currently uses `any` type - should create `express.d.ts` for proper types (as noted in your TODO)

---

## 🎯 Common Middleware Patterns

### Public Routes (No Middleware)

```typescript
router.post("/signup", handler); // No authentication needed
```

### Authenticated Routes

```typescript
router.post("/tasks", [authMiddleware], handler); // User must be logged in
```

### Admin Routes

```typescript
router.get("/users", [authMiddleware, isAdminMiddleware], handler); // Must be admin
```

### Error Wrapped Routes

```typescript
router.post("/tasks", [authMiddleware], errorHandler(handler)); // Catches errors
```

---

## 🐛 Current Issues & TODOs

1. **Type Safety**: `req.user` and `req.token` use `any` type

   - **Solution**: Create `src/types/express.d.ts` with proper declarations

2. **Token Refresh**: No token expiration refresh mechanism

   - Tokens expire but no auto-refresh implemented

3. **CORS**: No CORS middleware visible - may need configuration

---

## 🚀 Best Practices

✅ **Do**:

- Use authMiddleware on all protected routes
- Use errorHandler wrapper on all route handlers
- Place error middleware last in app
- Return proper error codes

❌ **Don't**:

- Use `any` types for request/response
- Forget to wrap handlers in errorHandler
- Place middleware in wrong order
- Expose sensitive info in error messages
