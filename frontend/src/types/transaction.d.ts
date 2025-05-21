export interface Transaction {
    _id: string;
    bookingId?: {
      bookedDate: string;
      serviceName: string;
    };
    amount: number;
    paymentStatus: string;
    paymentMethod: string;
    paymentDate: Date;
    adminCommission:number
  }
  
 export interface PaymentStats {
    totalEarnings: number;
    availableBalance: number;
    pendingPayments: number;
    totalCommission: number
  }
  