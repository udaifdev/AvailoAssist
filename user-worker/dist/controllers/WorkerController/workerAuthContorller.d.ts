import { Request, Response } from 'express';
export declare const worker_Signup: (req: Request, res: Response) => Promise<any>;
export declare const worker_verifyOtp: (req: Request, res: Response) => Promise<void>;
export declare const worker_resendOtp: (req: Request, res: Response) => Promise<void>;
export declare const worker_login: (req: Request, res: Response) => Promise<void>;
export declare const worker_logout: (res: Response) => Promise<void>;
