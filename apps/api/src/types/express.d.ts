import 'express';

declare global {
  namespace Express {
    interface Request {
      fortressRequestId?: string;
      fortressAuth?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

export {};
