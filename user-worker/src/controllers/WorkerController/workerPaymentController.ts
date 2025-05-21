// // src/controllers/paymentController.ts
import { Request, Response } from 'express';
import PaymentModel from '../../models/userModel/paymentCollection';
import BookingModel from '../../models/workerModel/bookingCollection';
import WorkerModel from '../../models/workerModel/workerCollection';
import mongoose from 'mongoose';

interface PaymentResponse {
    totalEarnings: number;
    availableBalance: number;
    pendingPayments: number;
    recentTransactions: any[];
    totalCommission:number
}

export const getWorkerPayments = async (req: Request, res: Response): Promise<void> => {
    const workerId = req.params.workerId;

    try {
        // Validate workerId
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            res.status(400).json({ error: 'Invalid worker ID' });
            return;
        }

        // Fetch worker details
        const worker = await WorkerModel.findById(workerId);
        if (!worker) {
            res.status(404).json({ error: 'Worker not found' });
            return;
        }

        // Get all payments for the worker
        const payments = await PaymentModel.find({ workerId })
            .populate({
                path: 'bookingId',
                select: 'bookedDate serviceName'
            })
            .sort({ paymentDate: -1 })
            .limit(10);

        // Calculate pending payments
        const pendingPayments = await BookingModel.aggregate([
            {
                $match: {
                    workerId: new mongoose.Types.ObjectId(workerId),
                    bookedStatus: 'Confirmed',
                    paymentId: { $exists: false }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

         // Calculate total commission
         const totalCommission = await PaymentModel.aggregate([
            { $match: { workerId: new mongoose.Types.ObjectId(workerId) } },
            { $group: { _id: null, total: { $sum: '$adminCommission' } } }
        ]);

        // Construct response
        const response: PaymentResponse = {
            totalEarnings: worker.totalEarnings || 0,
            availableBalance: worker.wallet.balanceAmount || 0,
            pendingPayments: pendingPayments[0]?.total || 0,
            totalCommission: totalCommission[0]?.total || 0,  
            recentTransactions: payments
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({ error: 'Failed to fetch payment details' });
    }
};

export const withdrawBalance = async (req: Request, res: Response): Promise<void> => {
    const { workerId } = req.params;
    const { amount } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Input validation
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            res.status(400).json({ error: 'Invalid worker ID' });
            return;
        }

        if (!amount || amount <= 0) {
            res.status(400).json({ error: 'Invalid withdrawal amount' });
            return;
        }

        // Fetch worker with session
        const worker = await WorkerModel.findById(workerId).session(session);
        if (!worker) {
            await session.abortTransaction();
            res.status(404).json({ error: 'Worker not found' });
            return;
        }

        // Check sufficient balance
        if (amount > worker.wallet.balanceAmount) {
            await session.abortTransaction();
            res.status(400).json({ error: 'Insufficient balance' });
            return;
        }

        // Create withdrawal transaction
        const payment = new PaymentModel({
            workerId,
            paymentStatus: 'success',
            paymentMethod: 'withdrawal',
            amount,
            paymentDate: new Date(),
            transactionType: 'withdrawal'
        });
        await payment.save({ session });

        // Update worker's wallet
        await WorkerModel.findByIdAndUpdate(
            workerId,
            {
                $inc: {
                    'wallet.balanceAmount': -amount,
                    'wallet.totalWithdraw': amount
                }
            },
            { session }
        );

        await session.commitTransaction();

        res.json({
            message: 'Withdrawal successful',
            transactionId: payment._id,
            updatedBalance: worker.wallet.balanceAmount - amount,
            totalWithdrawn: worker.wallet.totalWithdraw + amount,
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error processing withdrawal:', error);
        res.status(500).json({ error: 'Failed to process withdrawal' });
    } finally {
        session.endSession();
    }
};