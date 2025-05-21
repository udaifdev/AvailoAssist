import * as jwt from 'jsonwebtoken'; // Use correct import
import { Response } from 'express';

function generateToken(res: Response, userId: string, role: string): string {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
  }

  const token = jwt.sign({ userId, role }, secret, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
}

export default generateToken;
