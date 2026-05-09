import 'express';

declare global {
  namespace Express {
    interface Request {
      fortressAuth?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

export {};
