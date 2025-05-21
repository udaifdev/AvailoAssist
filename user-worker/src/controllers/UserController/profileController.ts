// import AWS from 'aws-sdk';
import { Request, Response } from 'express';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import userModel from '../../models/userModel/userCollection';
import bookingModal from '../../models/workerModel/bookingCollection';
import WorkerModel from '../../models/workerModel/workerCollection';
import { Review } from '../../models/userModel/reviewCollection';
import generateToken from '../../utilits/generateToken';





export const user_Profile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId; // Get worker ID from request params
    // console.log('profile worker Id ---> ', userId)

    try {
        // Find the user by ID and exclude sensitive data like password
        const user = await userModel.findById(userId).select('-password');
        // console.log('profile user collections ---> ', user)

        if (!user) {
            res.status(404).json({ message: 'user not found' });
            return
        }

        // Return the worker data
        res.json(user); // Send the full worker data including availability and notifications
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};




// // Configure AWS S3
// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: 'us-east-1',  // Adjust to your region
// });

// const s3 = new AWS.S3();

// const uploadToS3 = (file: Express.Multer.File): Promise<string> => {
//     const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `profile-images/${Date.now()}-${file.originalname}`, // Unique file name
//         Body: file.buffer,
//         ContentType: file.mimetype,
//         ACL: 'public-read',  // Makes the image publicly accessible
//     };

//     return new Promise((resolve, reject) => {
//         s3.upload(params, (err, data) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(data.Location);  // Return the URL of the uploaded image
//             }
//         });
//     });
// };


// Update Profile Controller
export const user_updateProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const { name } = req.body; // Destructure name from request body
    const profilePic = req.file?.path; // Get the uploaded image path (Cloudinary URL)

    console.log('Update profile data received..........', { userId, name, profilePic });

    try {
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: 'Invalid name provided' });
            return;
        }

        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Update the name if provided
        user.name = name.trim();

        // Update the profile picture if provided
        if (profilePic) {
            user.image = profilePic;
        }

        const updatedUser = await user.save();
        console.log('Updated User:', updatedUser);

        // Generate token
        const userToken = generateToken(res, user._id.toString(), 'RoleUser', 'jwt_user');

        res.json({
            message: 'User profile updated successfully',
            user: updatedUser,
            userToken,
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};



// List all Booking History for user
export const List_All_BookingHistory = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    // console.log('Fetching booking history for userId:......', userId);

    try {
        // Fetch bookings from the database based on userId
        const bookings = await bookingModal.find({ userId });
        if (bookings.length === 0) {
            res.status(404).json({ error: 'No bookings found for this user' });
            return
        }

        // Return bookings as JSON response
        res.status(200).json(bookings);
        return
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
        return
    }
};



// Change Password
export const change_password = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Current password and new password are required.' });
        return;
    }

    try {
        // Find the user by ID
        const user = await userModel.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        // Verify the current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Current password is incorrect.' });
            return;
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password. Please try again.' });
    }
};



// Booking Cancelation function
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const { reason } = req.body;

    console.log('booking Id , cancel reason............', bookingId, reason)

    if (!reason || reason.length < 10 || reason.length > 100) {
        console.log('Cancellation reason must be between 10 and 75 characters...........')
        res.status(400).json({ error: 'Cancellation reason must be between 10 and 25 characters.' });
        return
    }

    try {
        // Find the booking document
        const booking = await bookingModal.findById(bookingId);
        if (!booking) {
            console.log('Booking not found...........')
            res.status(404).json({ error: 'Booking not found.' });
            return
        }

        // Update the booking status and save the cancellation reason
        booking.bookedStatus = 'Cancelled';
        booking.bookedDescription = reason; // Save the reason as part of the booking document
        await booking.save();

        // Update the worker's availability
        const worker = await WorkerModel.findById(booking.workerId);
        if (worker) {
            const { bookedDate, bookedSlot } = booking;

            const formattedDate = moment(bookedDate, 'MMM DD, YYYY').format('MM/DD/YY');

            console.log('Formatted Date and Slot...........', formattedDate, bookedSlot);

            // Find the specific date and slot in the worker's availability
            const availabilityDate = worker.availability.dates.find(date => date.date === formattedDate);
            if (availabilityDate) {
                const slot = availabilityDate.slots.find(s => s.slot === bookedSlot);
                if (slot) {
                    slot.booked = false; // Mark the slot as available
                }
            }

            await worker.save(); // Save the updated worker document
        }

        res.status(200).json({ message: 'Booking cancelled successfully.' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Failed to cancel the booking.' });
    }
};





export const createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, workerId, bookingId,   rating, review } = req.body;
        console.log('review data............', userId, workerId, bookingId,   rating, review)

      // Validate input fields
      if (!userId || !workerId || !rating) {
        res.status(400).json({ message: "userId, workerId, and rating are required." });
        return;
      }
      if (rating < 1 || rating > 5) {
        res.status(400).json({ message: "Rating must be between 1 and 5." });
        return;
      }

      // Create and save the review
      const newReview = new Review({
        userId,
        workerId,
        bookingId,
        rating,
        review,  
      });
  
      const savedReview = await newReview.save();
  
      res.status(201).json({ message: "Review added successfully!",review: savedReview,});

    } catch (error) {
      res.status(500).json({
        message: "Failed to create review.",
        error: (error as Error).message,
      });
    }
  };


  // Get review for a specific booking
    export const reviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const review = await Review.findOne({ bookingId: req.params.bookingId });
        console.log('review............', review)
        
        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return 
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching review' });
    }
}



// Delete a review
export const review_Delete = async (req: Request, res: Response): Promise<void> => {
    try {
        await Review.findOneAndDelete({ bookingId: req.params.bookingId });
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review' });
    }
}
 

  // Delete a review
// export const deleteReview = async (req: Request, res: Response) => {
//     try {
//       const { id } = req.params;
  
//       const deletedReview = await Review.findByIdAndDelete(id);
  
//       if (!deletedReview) {
//         return res.status(404).json({ message: "Review not found" });
//       }
  
//       res.status(200).json({ message: "Review deleted successfully" });
//     } catch (error) {
//       res.status(500).json({ message: "Error deleting review", error });
//     }
//   };