// src/controllers/notificationController.ts
import { Request, Response } from 'express';
import webpush from 'web-push';
import { SubscriptionModel } from '../models/subscriptionModel';
import { SubscriptionRequestBody, NotificationRequestBody, TypedRequest } from '../types/notification.types';
import dotenv from 'dotenv';
dotenv.config();


// Configure web-push
webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:muhammadudaif786udaif@gmail.com',
    process.env.VAPID_PUBLIC_KEY || 'BA7vOsBuHw_k9EJORm_v068uvYAU5YLFPfQ91ymcQUsog0SxWiFXceoXShYJEDAcnvfXAdOVOqPL7NXujGs5ct8',
    process.env.VAPID_PRIVATE_KEY || 'sP5YLVOLGLeFa-e6r_mMBaau3cOe2zPapoZK80zSxJc'
);

export const saveSubscription = async (req: TypedRequest<SubscriptionRequestBody>, res: Response): Promise<void> => {
    try {
        const { subscription, userId } = req.body;

        await SubscriptionModel.findOneAndUpdate(
            { userId },
            { subscription },
            { upsert: true }
        );

        res.status(200).json({ message: 'Subscription saved!!' });
    } catch (error) {
        console.error('Save subscription error...........', error);
        res.status(500).json({ error: 'Failed to save subscription' });
    }
};

export const sendNotificationToWorker = async (req: TypedRequest<NotificationRequestBody>, res: Response): Promise<void> => {
    try {
        const { workerId, message } = req.body;
        console.log('workerId and message..........', workerId, message);

        if (!workerId) {
            console.log('workerId is required........')
            res.status(400).json({ error: 'workerId is required' });
            return;
        }

        const subscriptionDoc = await SubscriptionModel.findOne({ userId: workerId });

        if (!subscriptionDoc) {
            console.log('Subscription doc not found for workerId..........', workerId);
            res.status(404).json({ error: 'Worker subscription not found' });
            return;
        }
        try {
            // Send notification
            await webpush.sendNotification(subscriptionDoc.subscription as webpush.PushSubscription, message);
            res.status(200).json({ message: 'Notification sent successfully!' });
        } catch (error: any) {
            if (error.statusCode === 410) {
                console.error('Subscription expired. Removing it from the database.');
                await SubscriptionModel.deleteOne({ userId: workerId });
            } else {
                console.error('Failed to send notification:', error);
            }
            res.status(500).json({ error: 'Failed to send notification' });
        }
    } catch (error) {
        console.error('Send notification to worker error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
};


export const sendNotificationToUser = async (req: TypedRequest<NotificationRequestBody>, res: Response): Promise<void> => {
    try {
        const { userId, message } = req.body;
        // console.log('studauss update notifiation data.........',  userId, message )

        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return
        }

        const subscriptionDoc = await SubscriptionModel.findOne({ userId });

        if (!subscriptionDoc) {
            console.log('user subcription not found.............')
            res.status(404).json({ error: 'User subscription not found' });
            return
        }

        try {
            await webpush.sendNotification(subscriptionDoc.subscription as webpush.PushSubscription, message);
            res.status(200).json({ message: 'Notification sent' });
        } catch (error: any) {
            if (error.statusCode === 410) {
                // Remove expired subscription
                console.log('Removing expired subscription for user:', userId);
                await SubscriptionModel.deleteOne({ userId });
                res.status(410).json({ error: 'Subscription expired' });
            } else {
                console.error('Failed to send notification:', error);
                res.status(500).json({ error: 'Failed to send notification' });
            }
        }

    } catch (error) {
        console.error('Send notification to user error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
};
