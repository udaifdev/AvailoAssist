// src/types/notification.types.ts
import { Request, Response } from 'express';

export interface Subscription {
    endpoint: string;
    expirationTime: number | null;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface SubscriptionRequestBody {
    subscription: Subscription;
    userId: string;
}

export interface NotificationRequestBody {
    workerId?: string;
    userId?: string;
    message: string;
}

// Extend Express Request type
export interface TypedRequest<T> extends Request {
    body: T;
}