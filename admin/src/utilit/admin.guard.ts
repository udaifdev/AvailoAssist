// admin/src/utilit/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Get the token from cookies or headers
    const token = request.cookies?.jwt || request.headers['authorization']?.split(' ')[1];
    console.log('admin token..........', token)

    if (!token) {
      throw new UnauthorizedException('No token provided. Access denied...!');
    }

    try {
      // Verify the token
      const secret = process.env.JWT_SECRET as string;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in the environment variables...!');
      }

      const decoded = jwt.verify(token, secret) as { userId: string; role: string };

      // Check if the role is 'RoleAdmin'
      if (decoded.role !== 'RoleAdmin') {
        throw new ForbiddenException('Access denied. Admins only......!');
      }

      // Attach the user information to the request for further use
      request.user = decoded;

      return true; // Allow access
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
