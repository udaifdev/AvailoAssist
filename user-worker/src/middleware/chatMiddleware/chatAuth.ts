import jwt from 'jsonwebtoken';
import userModel from '../../models/userModel/userCollection';
import workerModel from '../../models/workerModel/workerCollection';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { CustomRequest } from '../../types/express';

interface JwtPayload {
  userId: string;
  role: string;
}

const protect = (requiredRole: string): RequestHandler => {
  return async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;
    
    // Check for the correct cookie based on the required role
    if (requiredRole === 'RoleUser') {
      token = req.cookies.jwt_user;
    } else if (requiredRole === 'RoleWorker') {
      token = req.cookies.jwt_worker;
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        
        let user;
        if (requiredRole === 'RoleUser') {
          user = await userModel.findById(decoded.userId);
          if (!user || user.status === false) {
            res.clearCookie('jwt_user');
            res.status(403).json({ message: 'User account has been blocked.' });
            return;
          }
        } else if (requiredRole === 'RoleWorker') {
          user = await workerModel.findById(decoded.userId);
        }

        if (!user) {
          res.status(401).json({ message: 'User not found' });
          return;
        }

        if (decoded.role !== requiredRole) {
          res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
          return;
        }

        // Attach user to request for further use
        req.user = {
          id: user._id.toString(),
          _id: user._id.toString()
        };

        next();
      } catch (error) {
        console.error('Token verification failed', error);
        res.status(401).json({ message: 'Not Authorized, Invalid Token' });
      }
    } else {
      res.status(401).json({ message: 'Not Authorized, No Token' });
    }
  };
};

export { protect };