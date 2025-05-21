import express, { Request, Response, NextFunction } from 'express';
import { signupUser, verifyOtp, login, resendOtp, logoutUser, forgotPass_sendOtp, forgotPass_verifyOtp, reset_FrogotPassword } from '../../controllers/UserController/authController';
import { getUserHome, searchServices } from '../../controllers/UserController/homeController';
import { user_Profile, user_updateProfile, List_All_BookingHistory, change_password, cancelBooking, createReview, reviews, review_Delete } from '../../controllers/UserController/profileController';
import { getAll_services } from '../../controllers/UserController/serviceController';
import { protect } from '../../middleware/userMiddleware/userAuth';
import { available_Worker_list, getWorkerReviews, selected_worker_data, booking_confirmation, getBookingHistory, payment_Create, confirm_Payment } from '../../controllers/UserController/BookingController';
import upload from '../../middleware/cloudinary/upload';
import { saveSubscription, sendNotificationToWorker, sendNotificationToUser } from '../../controllers/notificationController';


const router = express.Router();

router.post('/signup', signupUser);
router.post('/verify-otp', upload.single('profilePic'), verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login as (req: Request, res: Response) => Promise<void>);

// router.post('/login', async (req, res) => {
//     console.log('Login request received............', req.body);
// });

router.post('/logout', logoutUser);

router.post('/forgotPass-send-otp', forgotPass_sendOtp)
router.post('/forgotPass-verify-otp', forgotPass_verifyOtp)
router.post('/reset-password', reset_FrogotPassword)

router.get('/home', getUserHome);
router.get('/services/search', searchServices)



router.get('/profile/:userId', protect('RoleUser'), user_Profile)
router.put('/profileUpdate/:userId', protect('RoleUser'), upload.single('profilePic'), user_updateProfile)
router.put('/change-password/:userId', protect('RoleUser'), change_password)
router.get('/bookingsHistoryPage/:userId', List_All_BookingHistory)
router.put('/cancelBooking/:bookingId', cancelBooking)
router.post('/addReview', createReview)
router.get('/review/:bookingId', reviews)
router.delete('/review/:bookingId', review_Delete)


router.get('/allServicesList', getAll_services)

router.get('/taskers/available', available_Worker_list)
router.get('/worker/reviews/:workerId', getWorkerReviews);
router.get('/selectedTasker/:id', selected_worker_data)
router.get('/booking/:bookingId', getBookingHistory);

router.post('/bookings', booking_confirmation)
router.post('/payment/create-payment-intent', payment_Create)
router.post('/payment/confirm', confirm_Payment);


// Notification Routes  user 
router.post('/userOrworker-save-subscription', saveSubscription);
router.post('/notifications/send-to-worker', sendNotificationToWorker);

// **Centralized Error-Handling Middleware**
router.use((err: any, req: Request, res: Response, next: NextFunction): void => {
    if (err.status === 403) {
        res.status(403).json({ message: err.message });
        return
    }
    if (err.status === 401) {
        res.status(401).json({ message: 'Not Authorized.' });
        return
    }
    console.error('Unhandled Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
});

export default router;
