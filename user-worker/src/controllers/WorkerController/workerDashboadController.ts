import { Request, Response } from 'express';
import WorkerModel from '../../models/workerModel/workerCollection';
import BookingModel from '../../models/workerModel/bookingCollection';
import { Review } from '../../models/userModel/reviewCollection';
import PaymentModel from '../../models/userModel/paymentCollection';

// Get worker dashboard status
export const get_worker_dashboard = async (req: Request<{ workerEmail: string }>, res: Response): Promise<void> => {
  const { workerEmail } = req.params;

  try {
    const worker = await WorkerModel.findOne({ email: workerEmail });
    
    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }

    res.status(200).json({ status: worker.serviceStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get worker metrics
export const get_worker_metrics = async (req: Request<{ workerId: string }>, res: Response): Promise<void> => {
  const { workerId } = req.params;

  try {
    // Get completed bookings
    const completedBookings = await BookingModel.find({
      workerId,
      bookedStatus: 'Completed'
    });

    // Get total earnings
    const payments = await PaymentModel.find({
      workerId,
      paymentStatus: 'success',
      transactionType: 'service'
    });

    // Calculate total earnings (excluding admin commission)
    const totalEarnings = payments.reduce((sum, payment) => 
      sum + (payment.amount - payment.adminCommission), 0);

    // Calculate monthly earnings for the chart
    const monthlyEarnings = calculateMonthlyEarnings(payments);

    // Calculate total distance (assuming coordinates are available in bookings)
    const totalDistance = calculateTotalDistance(completedBookings);

    const metrics = {
      earnings: totalEarnings,
      jobsCompleted: completedBookings.length,
      totalJobs: await BookingModel.countDocuments({ workerId }),
      totalDistance,
      monthlyEarnings
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get worker ratings
export const get_worker_ratings = async (req: Request<{ workerId: string }>, res: Response): Promise<void> => {
  const { workerId } = req.params;

  try {
    const reviews = await Review.find({ workerId });
    
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.status(200).json({ averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate monthly earnings
function calculateMonthlyEarnings(payments: any[]): Array<{ name: string; earnings: number }> {
  const monthlyData = new Map<string, number>();
  
  payments.forEach(payment => {
    const date = new Date(payment.paymentDate);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    const earnings = payment.amount - payment.adminCommission;
    monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + earnings);
  });

  return Array.from(monthlyData.entries())
    .map(([name, earnings]) => ({ name, earnings }))
    .slice(-6); // Last 6 months
}

// Helper function to calculate total distance
function calculateTotalDistance(bookings: any[]): number {
  let totalDistance = 0;
  
  // Implement distance calculation logic based on your coordinates data
  // This is a placeholder - implement actual distance calculation based on your needs
  
  return Math.round(totalDistance);
}