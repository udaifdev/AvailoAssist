// src/dashboard/interfaces/dashboard.interface.ts

import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  subtext?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export interface WorkerStats {
  totalWorkers: number;
  activeWorkers: number;
  pendingWorkers: number;
  topWorkers: Array<{
    _id: string;
    fullName: string;
    totalBookings: number;
    totalEarnings: number;
  }>;
}

export interface BookingStats {
  totalBookings: number;
  monthlyBookings: number;
  statusCounts: Array<{
    _id: string;
    count: number;
  }>;
  bookingTrends: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }>;
}

export interface PaymentStats {
  totalEarnings: number;
  monthlyEarnings: number;
  paymentMethods: Array<{
    _id: string;
    count: number;
    total: number;
  }>;
}

export interface CategoryStats {
  _id: string;
  count: number;
}

export interface RecentBooking {
  serviceName: string;
  amount: number;
  bookedStatus: 'Pending' | 'Confirmed' | 'Cancelled';
  bookedDate: string;
  userName: string;
  workerName: string;
}

export interface DashboardData {
  userStats: UserStats;
  workerStats: WorkerStats;
  bookingStats: BookingStats;
  paymentStats: PaymentStats;
  categoryStats: CategoryStats[];
  recentBookings: RecentBooking[];
}