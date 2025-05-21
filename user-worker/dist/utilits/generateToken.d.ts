import { Response } from 'express';
declare function generateToken(res: Response, userId: string, role: string): string;
export default generateToken;
