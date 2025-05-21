// src/models/subscriptionModel.ts
import mongoose, { Document, Schema } from 'mongoose';
import { Subscription } from '../types/notification.types';

interface ISubscriptionDocument extends Document {
    userId: mongoose.Types.ObjectId;
    subscription: Subscription;
}

const subscriptionSchema = new Schema<ISubscriptionDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    subscription: {
        type: Schema.Types.Mixed,
        required: true
    }
});


export const SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);  // Correct export
