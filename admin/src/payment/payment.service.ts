import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentDocument, Payment } from 'src/dashboard/entities/payment.schema';
import { BookingDocument, Booking } from 'src/dashboard/entities/booking.schema';
import { Worker } from 'src/workers/entities/worker.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { Admin, AdminDocument } from 'src/admin-login-module/admin.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) { }

  async findAllTransactions() {
    const payments = await this.paymentModel.find({ transactionType: 'service' })
      .populate<{
        bookingId: BookingDocument & {
          userId: UserDocument
        }
      }>({
        path: 'bookingId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate<{ workerId: Worker }>('workerId')
      .sort({ paymentDate: -1 });

    return payments.map(payment => {
      const booking = payment.bookingId;
      const adminFee = Math.floor(payment.amount * 0.1);
      const workerFee = Math.floor(payment.amount * 0.9);

      return {
        service: booking?.serviceName || 'N/A',
        clientName: booking?.userId?.name || 'N/A',
        clientEmail: booking?.userId?.email || 'N/A',
        amountPaid: payment.amount,
        workerName: (payment.workerId as Worker)?.fullName || 'N/A',
        workerFee,
        adminFee,
        dateTime: payment.paymentDate.toLocaleString(),
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus
      };
    });
  }

  async getAdminWalletBalance() {
    const admin = await this.adminModel.findOne();
    if (!admin) {
      console.log('admin Not found........!!')
      throw new Error('Admin not found');
    }

    // Fetch admin's wallet details directly
    const { totalEarnings, balanceAmount, totalWithdraw } = admin.wallet;
    console.log('admin wallet............', totalEarnings, balanceAmount, totalWithdraw)
    return {
      username: admin.username,
      wallet: {
        totalEarnings,
        balanceAmount,
        totalWithdraw,
      },
    };
  }


  async withdrawAdminFunds(amount: number) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

    const admin = await this.adminModel.findOne();
    if (!admin) {
      throw new Error('Admin not found');
    }

    if (amount > admin.wallet.balanceAmount) {
      throw new Error('Insufficient funds');
    }
    
    // Update admin wallet
    admin.wallet.totalWithdraw += amount;
    admin.wallet.balanceAmount -= amount;
    await admin.save();

    return {
      updatedWallet: admin.wallet
    };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} payment`;
  // }

  // update(id: number, updatePaymentDto: UpdatePaymentDto) {
  //   return `This action updates a #${id} payment`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} payment`;
  // }
}
