import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Worker } from 'src/workers/entities/worker.entity';
import { Booking } from './entities/booking.schema';
import { Payment } from './entities/payment.schema';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('Worker') private workerModel: Model<Worker>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Booking') private bookingModel: Model<Booking>,
    @InjectModel('Payment') private paymentModel: Model<Payment>,
  ) {}

  async findAll(createDashboardDto: CreateDashboardDto) {
    const [
      userStats,
      workerStats,
      bookingStats,
      paymentStats,
      recentBookings,
      categoryStats,
    ] = await Promise.all([
      this.getUserStats(),
      this.getWorkerStats(),
      this.getBookingStats(),
      this.getPaymentStats(),
      this.getRecentBookings(),
      this.getCategoryStats(),
    ]);

    return {
      userStats,
      workerStats,
      bookingStats,
      paymentStats,
      recentBookings,
      categoryStats,
    };
  }

  private async getUserStats() {
    const totalUsers = await this.userModel.countDocuments();
    const activeUsers = await this.userModel.countDocuments({ status: true });
    const newUsersThisMonth = await this.userModel.countDocuments({
      createdAt: { 
        $gte: new Date(new Date().setDate(1)) // First day of current month
      }
    });

    return { totalUsers, activeUsers, newUsersThisMonth };
  }

  private async getWorkerStats() {
    const totalWorkers = await this.workerModel.countDocuments();
    const activeWorkers = await this.workerModel.countDocuments({ 
      status: true,
      serviceStatus: 'Accepted'
    });
    const pendingWorkers = await this.workerModel.countDocuments({ 
      serviceStatus: 'pending'
    });

    const topWorkers = await this.workerModel.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'workerId',
          as: 'bookings'
        }
      },
      {
        $project: {
          fullName: 1,
          totalBookings: { $size: '$bookings' },
          totalEarnings: 1
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 }
    ]);

    return { totalWorkers, activeWorkers, pendingWorkers, topWorkers };
  }

  private async getBookingStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalBookings, monthlyBookings, statusCounts] = await Promise.all([
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({
        createdAt: { $gte: startOfMonth }
      }),
      this.bookingModel.aggregate([
        {
          $group: {
            _id: '$bookedStatus',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const bookingTrends = await this.bookingModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    return { totalBookings, monthlyBookings, statusCounts, bookingTrends };
  }

  private async getPaymentStats() {
    const [totalEarnings, monthlyEarnings, paymentMethods] = await Promise.all([
      this.paymentModel.aggregate([
        {
          $match: { paymentStatus: 'success' }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            paymentStatus: 'success',
            createdAt: {
              $gte: new Date(new Date().setDate(1))
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      this.paymentModel.aggregate([
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    return {
      totalEarnings: totalEarnings[0]?.total || 0,
      monthlyEarnings: monthlyEarnings[0]?.total || 0,
      paymentMethods
    };
  }

  private async getRecentBookings() {
    return this.bookingModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'workers',
          localField: 'workerId',
          foreignField: '_id',
          as: 'worker'
        }
      },
      {
        $project: {
          serviceName: 1,
          amount: 1,
          bookedStatus: 1,
          bookedDate: 1,
          userName: { $arrayElemAt: ['$user.name', 0] },
          workerName: { $arrayElemAt: ['$worker.fullName', 0] }
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 5 }
    ]);
  }

  private async getCategoryStats() {
    return this.workerModel.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }
  

  // findAll() {
  //   return `This action returns all dashboard`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} dashboard`;
  // }

  // update(id: number, updateDashboardDto: UpdateDashboardDto) {
  //   return `This action updates a #${id} dashboard`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} dashboard`;
  // }
}
