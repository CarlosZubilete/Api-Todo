import "express-serve-static-core ";

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

export {};
