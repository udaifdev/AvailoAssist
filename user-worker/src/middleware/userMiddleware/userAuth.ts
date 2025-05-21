import jwt from 'jsonwebtoken';
import userModel from '../../models/userModel/userCollection';
import { Request, Response, NextFunction, RequestHandler } from 'express';

interface JwtPayload {
  userId: string;
  role: string;
}

const protect = (requiredRole: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    // Check for the correct cookie based on the required role
    if (requiredRole === 'RoleUser') {
      token = req.cookies.jwt_user;
    }


    if (token) {

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        // Check if the user exists and is active
        const user = await userModel.findById(decoded.userId);

        if (!user || user.status === false) {
          res.clearCookie('jwt_user'); // Clear cookies if blocked
          res.clearCookie('jwt_worker'); // Clear cookies if blocked
          res.status(403).json({ message: 'Your account has been blocked.' });
          return
        }

        if (decoded.role !== requiredRole) {
          res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
          return;
        }
        next();
      } catch (error) {
        console.error('Token verification failed.........', error);
        res.status(401).json({ message: 'Not Authorized, Invalid Token' });
      }
    } else {
      res.status(401).json({ message: 'Not Authorized, No Token' });
    }
  };
};

export { protect };
