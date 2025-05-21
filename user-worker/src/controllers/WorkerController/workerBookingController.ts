// Backend (Express) - getWorkerBookingHistory
import BookingModal from "../../models/workerModel/bookingCollection";
import WorkerModel from "../../models/workerModel/workerCollection";
import { Request, Response } from 'express';
import moment from 'moment';

 



export const getWorkerBookingHistory = async (req: Request, res: Response) => {
    try {
        const { workerId } = req.params; // Extract workerId from the request params

        // Fetch the bookings from the Booking model
        const bookings = await BookingModal.find({ workerId })
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .populate('userId', 'name'); // Populate customer (user) name

        // Respond with the bookings data
        res.status(200).json({ bookings });
    } catch (error) {
        console.error('Error fetching worker booking history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// worker status update function
export const updateBooking_Status = async (req: Request, res: Response): Promise<void> => {
    const { bookingId, status } = req.body;

    const booking = await BookingModal.findById(bookingId);
    if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
    }
    try {
        // Prepare the update data
        const updateData: any = {
            bookedStatus: status,
            updatedAt: new Date(),
        };

        // If status is "Accepted", set chat field to true
        if (status === 'Accepted') {
            updateData.chat = true;
        }

        // Update the booking status in the database
        const updatedBooking = await BookingModal.findByIdAndUpdate(bookingId, updateData, { new: true });

        if (!updatedBooking) {
            res.status(404).json({ message: 'Booking not found.' });
            return;
        }

        // If status is "Rejected", update the worker's availability to mark the slot as not booked
        if (status === 'Rejected' && booking.workerId) {
            console.log('Status and Worker ID...........', status, booking.workerId);

            const worker = await WorkerModel.findById(booking.workerId);
            if (worker) {
                const { bookedDate, bookedSlot } = booking;

                // Convert `bookedDate` to the worker's date format (MM/DD/YY)
                const formattedDate = moment(bookedDate, 'MMM DD, YYYY').format('MM/DD/YY');

                console.log('Formatted Date and Slot...........', formattedDate, bookedSlot);

                // Find the specific date and slot in the worker's availability
                const availabilityDate = worker.availability.dates.find(date => date.date === formattedDate);
                if (availabilityDate) {
                    const slot = availabilityDate.slots.find(s => s.slot === bookedSlot);
                    if (slot) {
                        slot.booked = false; // Set booked status to false
                        console.log('Updated slot........', slot);
                    } else {
                        console.error('Slot not found.......', bookedSlot);
                    }
                } else {
                    console.error('Date not found in availability...........', formattedDate);
                }

                // Save the updated worker document
                await worker.save();
                console.log('Worker availability updated successfully');
            } else {
                console.error('Worker not found:', booking.workerId);
            }
        }


        res.status(200).json({
            message: 'Booking status updated successfully.',
            booking: updatedBooking,
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Failed to update booking status.' });
    }
};
