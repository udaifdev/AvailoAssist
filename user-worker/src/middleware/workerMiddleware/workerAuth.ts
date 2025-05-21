import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';

interface JwtPayload {
  userId: string;
  role: string;
}

const protect = (requiredRole: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;
    
    // Check for the correct cookie based on the required role
    if (requiredRole === 'RoleWorker') {
      token = req.cookies.jwt_worker;
    }
    
    // console.log('worker token checking..............', token)
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        if (decoded.role !== requiredRole) {
          console.log('Forbidden: Insufficient permissions....................')
          res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
          return;
        }
        next();
      } catch (error) {
        console.error('worker Token verification failed.........', error);
        res.status(401).json({ message: 'Not Authorized, Invalid Worker Token' });
      }
    } else {
      res.status(401).json({ message: 'Not Authorized, No Worker Token' });
    }
  };
};

export { protect };
