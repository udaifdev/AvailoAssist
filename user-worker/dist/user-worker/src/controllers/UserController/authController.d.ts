import { Request, Response } from 'express';
export declare const signupUser: (req: Request, res: Response) => Promise<any>;
export declare const verifyOtp: (req: Request, res: Response) => Promise<void>;
export declare const resendOtp: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const logoutUser: (req: Request, res: Response) => Promise<void>;
