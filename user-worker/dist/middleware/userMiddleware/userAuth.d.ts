import { RequestHandler } from 'express';
declare const protect: (requiredRole: string) => RequestHandler;
export { protect };
