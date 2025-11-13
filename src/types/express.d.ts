import { User, Token } from "@prisma/client";
import "express-serve-static-core ";

declare global {
  namespace Express {
    interface Request {
      user: User;
      token: Token;
    }
  }
}

export {};
