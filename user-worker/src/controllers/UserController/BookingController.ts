import { Request, Response } from 'express';
import WorkerModel from '../../models/workerModel/workerCollection';
import BookingModel from '../../models/workerModel/bookingCollection';
import PaymentModel from '../../models/userModel/paymentCollection';
import { Review } from '../../models/userModel/reviewCollection';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { AdminSchema } from '../../../../admin/src/admin-login-module/admin.schema'; // Import the schema

// Check if the model already exists, otherwise create it
const AdminModal = mongoose.models.admins || mongoose.model('admins', AdminSchema);


// Initialize Stripe with your secret key
const stripe = new Stripe(`${process.env.STRIPE_API_KEY}`,
  { apiVersion: '2024-12-18.acacia' });


export const available_Worker_list = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, service } = req.query;
    // console.log('Received Date and Service from Query.......', date, service);

    if (!date || !service) {
      res.status(400).json({ error: 'Date and Service are required' });
      return;
    }

    // Convert the incoming date to MM/DD/YY format
    const inputDate = new Date(date as string);
    const formattedDate = inputDate.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });

    // console.log('Formatted Date for Query........', formattedDate);

    // Query the database for workers with availability on the given date and matching the selected service
    const workers = await WorkerModel.find({
      'availability.dates.date': formattedDate,
      category: service,
      status: true,
      serviceStatus: 'Accepted',
    });

    res.status(200).json(workers);
  } catch (error) {
    console.error("Error fetching available workers:", error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
};


// Review getting Function
export const getWorkerReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    // console.log('review getting worker id params.............', workerId)

    // Fetch reviews for the worker and populate user details
    const reviews = await Review.find({ workerId })
      .populate('userId', 'name image') // Only get necessary user fields
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(10); // Limit to 10 most recent reviews
    console.log('reviews user details...........', reviews)

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching worker reviews:", error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}


export const selected_worker_data = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = req.params.id;
    //   console.log('worker id......' ,workerId)
    const worker = await WorkerModel.findById(workerId).select('fullName profilePicture category availability');
    // console.log('selected tasker...', worker)

    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}



// Booking Creating Post function
export const booking_confirmation = async (req: Request, res: Response): Promise<void> => {
  const { slotId, workerId, coordinates, userId, serviceName, bookedDate, bookedSlot, location, amount, ...otherBookingData } = req.body;

  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Start a transaction
  try {

    // Validate required fields
    if (!workerId || !req.body.userId) {
      res.status(400).json({ error: 'Missing required fields: workerId or userId' });
      return;
    }

    // Find worker and update slot booked status
    let worker;
    if (slotId.startsWith('fixed-')) {
      // Handle fixed slot separately
      worker = await WorkerModel.findOneAndUpdate(
        { _id: workerId }, // Worker ID filter
        { $set: { 'availability.fixedSlots.$[fixedSlot].slots.$[slot].enabled': false } }, // Update specific slot
        {
          arrayFilters: [
            { 'fixedSlot.dayOfWeek': { $exists: true } }, // Filter for the correct day of the week
            { 'slot.slot': bookedSlot, 'slot.enabled': true }, // Filter for the specific slot
          ],
          new: true,
          session,
        }
      );
    } else {
      // Handle dynamic slot (ObjectId-based)
      worker = await WorkerModel.findOneAndUpdate(
        {
          _id: workerId,
          'availability.dates.slots._id': slotId,
        },
        { $set: { 'availability.dates.$[date].slots.$[slot].booked': true } },
        {
          arrayFilters: [
            { 'date.slots._id': slotId },
            { 'slot._id': slotId },
          ],
          new: true,
          session,
        }
      );
    }

    if (!worker) {
      await session.abortTransaction();
      console.error('Worker or slot not found............', { workerId, slotId });
      res.status(404).json({ error: 'Slot not found or already booked' });
      return;
    }


    // Create and save booking
    const booking = new BookingModel({
      ...otherBookingData,
      workerId,
      userId,
      slotId,
      coordinates,
      serviceName,
      bookedDate,
      bookedSlot,
      location,
      amount,
      bookedStatus: 'Pending',
    });

    const savedBooking = await booking.save({ session }); // Use the session here

    await session.commitTransaction(); // Commit the transaction
    res.status(201).json(savedBooking); // Send response

  } catch (error) {
    await session.abortTransaction(); // Rollback on error
    console.error('Error saving booking:', error);
    res.status(500).json({ error: 'Failed to save booking' });
  } finally {
    session.endSession(); // End the session
  }
};



export const payment_Create = async (req: Request, res: Response): Promise<void> => {
  const { amount } = req.body;
  console.log('req.body of payment.............', amount)


  if (!amount || amount <= 0) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    });


    // Return the client secret to the frontend
    res.status(200).json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('Error creating payment intent.............', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};




//  for the commission percentage
const ADMIN_COMMISSION_PERCENTAGE = 10; // 10% commission

// Helper function to calculate commission
const calculateCommission = (amount: number): number => {
  return (amount * ADMIN_COMMISSION_PERCENTAGE) / 100;
};



export const confirm_Payment = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId, paymentIntentId, amount } = req.body;

    // Fetch booking to get workerId
    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      await session.abortTransaction();
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Calculate commission amount
    const commissionAmount = calculateCommission(amount);
    const workerAmount = amount - commissionAmount;

    console.log('worker amount & commission amount ..............', commissionAmount, workerAmount)


    // Create payment record
    const payment = new PaymentModel({
      bookingId,
      workerId: booking.workerId,
      paymentStatus: 'success', // Changed from 'completed' to match enum
      paymentMethod: 'online',
      amount,
      paymentDate: new Date(),
      transactionType: 'service', // Added required field
      paymentIntentId,
      adminCommission: commissionAmount
    });

    await payment.save({ session });

    // Update booking status
    await BookingModel.findByIdAndUpdate(bookingId,
      { paymentStatus: 'success', bookedStatus: 'Pending', paymentId: payment._id, adminCommission: commissionAmount },
      { session });

    // Update worker's wallet and earnings
    await WorkerModel.findByIdAndUpdate(booking.workerId, {
      $inc: { 'wallet.balanceAmount': workerAmount, 'totalEarnings': workerAmount }
    },
      { session }
    );


    // Updating admin's wallet with the commission
    await AdminModal.findOneAndUpdate({ username: 'udaifuzz'},
      {
        $inc: {
          'wallet.totalEarnings': commissionAmount,
          'wallet.balanceAmount': commissionAmount
        }
      },
      { session }
    );



    await session.commitTransaction();

    res.status(200).json({ message: 'Payment confirmed successfully', paymentId: payment._id });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error confirming payment:.........', error);
    res.status(500).json({ error: 'Failed to confirm payment', details: error instanceof Error ? error.message : 'Unknown error' });
  } finally {
    session.endSession();
  }
};

// export const cod_Payment = async (req: Request, res: Response): Promise<void> => {
//   const { bookingId, amount } = req.body;

//   try {
//     const paymentRecord = new PaymentModel({
//       bookingId,
//       paymentStatus: 'pending', // COD is pending until payment is collected
//       paymentMethod: 'cod',
//       amount,
//       paymentDate: new Date(),
//     });

//     await paymentRecord.save();

//     res.status(201).json({
//       message: 'Payment recorded successfully for COD.',
//     });
//   } catch (error) {
//     console.error('Error recording COD payment:', error);
//     res.status(500).json({ error: 'Failed to record COD payment' });
//   }
// };




// Fetch booking history for a user
export const getBookingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    // console.log('bookingId......', bookingId)

    const booking = await BookingModel.findById(bookingId);
    // console.log('booking history.....', booking)
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
};