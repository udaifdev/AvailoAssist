// types/express.d.ts
import { Request } from 'express';
import { Document } from 'mongoose';

export interface CustomUser {
  id: string;
  _id: string;
}

export interface CustomRequest extends Request {
  user?: CustomUser;
}



// import { IUser } from '../models/userModel/userCollection'; // Adjust the path accordingly

// declare global {
//   namespace Express {
//     interface Request {
//       user?: IUser; // Add 'user' property of type 'IUser'
//     }
//   }
// }



// export {};