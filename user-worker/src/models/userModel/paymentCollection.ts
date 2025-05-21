
// src/models/Payment.ts
import mongoose, { Schema, Document } from 'mongoose';



export interface IPayment extends Document {
    bookingId: mongoose.Types.ObjectId;
    workerId: mongoose.Types.ObjectId;
    paymentStatus: 'success' | 'pending' | 'failed';
    paymentMethod: 'online' | 'cod' | 'withdrawal';
    amount: number;
    paymentDate: Date;
    transactionType: 'service' | 'withdrawal';
    paymentIntentId?: string;
    adminCommission: number;
}

const PaymentSchema: Schema = new Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: false },
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
        paymentStatus: {
            type: String,
            enum: ['success', 'pending', 'failed'],
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['online', 'cod', 'withdrawal'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        paymentDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        transactionType: {
            type: String,
            enum: ['service', 'withdrawal'],
            required: true
        },
        adminCommission: {
            type: Number,
            required: true,
            default: 0
        }
    },
    { timestamps: true }
);

const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
export default PaymentModel;
