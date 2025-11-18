# Exceptions - Error Handling & HTTP Status Codes

Exceptions are custom error classes that standardize error responses across the API. They extend `HttpException` and map errors to specific HTTP status codes and error codes.

---

## 🏗️ Exception Architecture

### Base Exception: `HttpException`

All exceptions inherit from `HttpException`, which provides:

```typescript
export enum ErrorCode {
  // User-related errors (1000s)
  USER_NOT_FOUND = 1001,
  USER_ALREADY_EXISTS = 1002,
  INCORRECT_PASSWORD = 1003,

  // Task-related errors (1000s continued)
  USER_TASK_LIST_NOT_FOUND = 1004,
  USER_TASK_NOT_FOUND = 1005,

  // Validation errors (2000s)
  UNPROCESSABLE_ENTITY = 2001,

  // Internal errors (3000s)
  INTERNAL_EXCEPTION = 3001,

  // Authorization errors (4000s)
  UNAUTHORIZED = 4001,

  // Validation errors (5000s)
  VALIDATION_ERROR = 5002,

  // Token errors (6000s)
  TOKEN_NOT_FOUND = 6001,

  // User-specific errors (7000s)
  SELF_DEMOTION = 7001,
}

export class HttpException extends Error {
  _message: string; // Human-readable message
  _statusCode: number; // HTTP status code (400, 401, 404, 500, etc.)
  _errorCode: ErrorCode; // Application-specific error code
  _errors: any; // Additional error details (validation errors)

  constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode: number,
    errors?: any
  ) {
    super(message);
    this._message = message;
    this._statusCode = statusCode;
    this._errorCode = errorCode;
    this._errors = errors;
  }
}
```

---

## 📋 Exception Types & Usage

### 1. **BadRequestException** (HTTP 400)

Used for client errors that don't fit other categories.

```typescript
export class BadRequestException extends HttpException {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, errorCode, 400, null);
  }
}
```

**When to use**:

- Invalid request data
- Duplicate resources
- Incorrect credentials
- Business logic violations

**Examples**:

```typescript
// User already exists
throw new BadRequestException(
  "User already exists!",
  ErrorCode.USER_ALREADY_EXISTS
);

// Incorrect password
throw new BadRequestException(
  "Incorrect password!",
  ErrorCode.INCORRECT_PASSWORD
);

// Prevent self-demotion
throw new BadRequestException(
  "You cannot demote yourself",
  ErrorCode.SELF_DEMOTION
);
```

**Response**:

```json
{
  "message": "User already exists!",
  "errorCode": 1002
}
```

---

### 2. **NotFoundException** (HTTP 404)

Used when a requested resource doesn't exist.

```typescript
export class NotFoundException extends HttpException {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, errorCode, 404, null);
  }
}
```

**When to use**:

- User not found
- Task not found
- Token not found
- Resource doesn't exist

**Examples**:

```typescript
// User not found
throw new NotFoundException("User does not exist!", ErrorCode.USER_NOT_FOUND);

// Task not found
throw new NotFoundException("Task not found", ErrorCode.USER_TASK_NOT_FOUND);

// Token not found
throw new NotFoundException("Token does not exist!", ErrorCode.TOKEN_NOT_FOUND);
```

**Response**:

```json
{
  "message": "User does not exist!",
  "errorCode": 1001
}
```

---

### 3. **ValidationException** (HTTP 400)

Handles Zod validation errors. Automatically extracts and formats validation errors.

```typescript
export class ValidationException extends HttpException {
  constructor(zodError: ZodError) {
    const formattedErrors: ValidationError[] = zodError.issues.map(
      (error: ZodIssue) => ({
        field: error.path.join("."),
        message: error.message,
      })
    );
    super(
      "Validation failed",
      ErrorCode.VALIDATION_ERROR,
      400,
      formattedErrors
    );
  }
}
```

**When to use**:

- Zod schema validation fails
- Invalid input format
- Missing required fields

**Example**:

```typescript
try {
  const data = singUpSchema.parse(req.body);
} catch (error) {
  if (error instanceof ZodError) {
    throw new ValidationException(error);
  }
}
```

**Response**:

```json
{
  "message": "Validation failed",
  "errorCode": 5002,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

---

### 4. **UnauthorizedException** (HTTP 401)

Used for authentication and authorization failures.

```typescript
export class UnauthorizedException extends HttpException {
  constructor(message: string, errorCode: number, error?: any) {
    super(message, errorCode, 401, error);
  }
}
```

**When to use**:

- JWT token invalid/expired
- Token not provided
- Authentication failed
- No permission to access resource

**Example**:

```typescript
if (!token) {
  throw new UnauthorizedException("No token provided", ErrorCode.UNAUTHORIZED);
}
```

**Response**:

```json
{
  "message": "No token provided",
  "errorCode": 4001
}
```

---

### 5. **InternalException** (HTTP 500)

Used for unexpected server errors.

```typescript
export class InternalException extends HttpException {
  constructor(message: string, errors: any, errorCode: number) {
    super(message, errorCode, 500, errors);
  }
}
```

**When to use**:

- Database errors
- Unexpected runtime errors
- System failures

**Example**:

```typescript
try {
  const token = await db.token.create({...});
  if (!token) throw new Error("Can't save token");
} catch (error) {
  throw new InternalException(
    "Failed to create token",
    { originalError: error.message },
    ErrorCode.INTERNAL_EXCEPTION
  );
}
```

**Response**:

```json
{
  "message": "Failed to create token",
  "errorCode": 3001,
  "errors": {
    "originalError": "Can't save token"
  }
}
```

---

## 🔄 Error Flow in the Application

```
1. Controller receives request
   ↓
2. Schema validation (Zod)
   ├─ If error → ValidationException
   ↓
3. Business logic (Service)
   ├─ If user not found → NotFoundException
   ├─ If duplicate → BadRequestException
   ├─ If unauthorized → UnauthorizedException
   ├─ If system error → InternalException
   ↓
4. Error thrown → errorHandler (middleware)
   ↓
5. errorMiddleware catches error
   ├─ Extracts message, statusCode, errorCode
   ├─ Formats response
   ↓
6. Send JSON response with error details
```

---

## 📊 Error Code Reference

| Range     | Category               | Status Code |
| --------- | ---------------------- | ----------- |
| 1000-1999 | User & Resource Errors | 400, 404    |
| 2000-2999 | Validation Errors      | 400         |
| 3000-3999 | Internal Server Errors | 500         |
| 4000-4999 | Authorization Errors   | 401         |
| 5000-5999 | Validation Errors      | 400         |
| 6000-6999 | Token Errors           | 404, 401    |
| 7000-7999 | Custom Business Errors | 400         |

---

## 💡 Best Practices

### ✅ DO:

```typescript
// ✅ Use specific error codes
throw new NotFoundException(
  "User with ID 5 not found",
  ErrorCode.USER_NOT_FOUND
);

// ✅ Provide helpful error messages
throw new BadRequestException(
  "Password must contain uppercase, lowercase, and numbers",
  ErrorCode.UNPROCESSABLE_ENTITY
);

// ✅ Use ValidationException for schema errors
try {
  const data = userSchema.parse(req.body);
} catch (error) {
  if (error instanceof ZodError) {
    throw new ValidationException(error);
  }
}
```

### ❌ DON'T:

```typescript
// ❌ Throw generic Error
throw new Error("Something went wrong");

// ❌ Reuse error codes for different errors
throw new BadRequestException(
  "Token not found",
  ErrorCode.USER_NOT_FOUND // Wrong code!
);

// ❌ Use wrong HTTP status code
throw new BadRequestException(
  "User not found",
  ErrorCode.USER_NOT_FOUND // Should be NotFoundException
);
```

---

## 🔍 Exception Usage in Controllers

### Auth Controller Example

```typescript
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validation with schema
    const data = singUpSchema.parse(req.body);

    // Check if user exists
    const existingUser = await service.isExists({ email: data.email });
    if (existingUser) {
      return next(
        new BadRequestException(
          "User already exists!",
          ErrorCode.USER_ALREADY_EXISTS
        )
      );
    }

    // Create user
    const user = await service.create({...});
    res.status(201).json({ email: user.email, role: user.role });
  } catch (error) {
    // ZodError will be caught by errorHandler
    next(error);
  }
};
```

### User Controller Example

```typescript
export const findOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const user = await service.userByID(Number(id));

  if (!user) {
    return next(
      new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND)
    );
  }

  res.status(200).json(user);
};
```

---

## 🛡️ Type Safety

All exceptions are properly typed:

```typescript
interface HttpException {
  _message: string;
  _statusCode: number; // 400, 401, 404, 500
  _errorCode: ErrorCode; // Enum value
  _errors?: ValidationError[] | null;
}
```

---

## 📝 Summary

| Exception               | Status | Use Case                                        |
| ----------------------- | ------ | ----------------------------------------------- |
| `BadRequestException`   | 400    | Invalid data, duplicates, business logic errors |
| `NotFoundException`     | 404    | Resource not found                              |
| `ValidationException`   | 400    | Zod validation failures                         |
| `UnauthorizedException` | 401    | Auth failures, token issues                     |
| `InternalException`     | 500    | Server errors, DB errors                        |

All exceptions are caught by `errorMiddleware` and formatted into consistent JSON responses.
