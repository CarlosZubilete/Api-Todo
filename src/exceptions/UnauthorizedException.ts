import { HttpException } from "./HttpException";

export class UnauthorizedException extends HttpException {
  constructor(message: string, errorCode: number, error?: any) {
    super(message, errorCode, 401, error);
  }
}
