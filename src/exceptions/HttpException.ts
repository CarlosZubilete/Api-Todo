export enum ErrorCode {
  USER_NOT_FOUND = 1001,
  USER_ALREADY_EXISTS = 1002,
  INCORRECT_PASSWORD = 1003,
  USER_TASK_LIST_NOT_FOUND = 1004,
  USER_TASK_NOT_FOUND = 1005,
  UNPROCESSABLE_ENTITY = 2001,
  INTERNAL_EXCEPTION = 3001,
  UNAUTHORIZED = 4001,
  VALIDATION_ERROR = 5002,
  TOKEN_NOT_FOUND = 6001,
  SELF_DEMOTION = 7001,
}

export class HttpException extends Error {
  _message: string;
  _statusCode: number;
  _errorCode: ErrorCode;
  _errors: any;

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
