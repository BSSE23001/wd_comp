export {};

declare global {
  namespace Express {
    interface Request {
      validated: {
        body?: any;
        params?: any;
        query?: any;
      };
      auth: {
        userId?: any;
      };
    }
  }
}
