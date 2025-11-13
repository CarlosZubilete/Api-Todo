import type { ZodError, ZodIssue } from "zod";
import { ErrorCode, HttpException } from "./HttpException";

interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends HttpException {
  constructor(zodError: ZodError) {
    // Extract only the essential error messages from Zod's error object
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
