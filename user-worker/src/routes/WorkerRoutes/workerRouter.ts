import express from 'express';
import { get_categoires_name, worker_Signup, worker_verifyOtp, worker_resendOtp, worker_login, worker_logout, forgotPass_sendOtp, forgotPass_verifyOtp, reset_FrogotPassword } from '../../controllers/WorkerController/workerAuthContorller'
import { protect } from '../../middleware/workerMiddleware/workerAuth';
import { get_worker_dashboard, get_worker_metrics, get_worker_ratings } from '../../controllers/WorkerController/workerDashboadController';
import uploadMiddleware from '../../middleware/workerMiddleware/uploadFile';
import { getWorkerBookingHistory, updateBooking_Status } from '../../controllers/WorkerController/workerBookingController';
import { getWorkerProfile, worker_update_Profile, deleteTimeSlot, getWorkerAvailability, worker_change_password, deleteDate, addDateAvailability, addTimeSlot } from '../../controllers/WorkerController/workerProfileController';
import { sendNotificationToUser } from '../../controllers/notificationController';
import { addFixedSlots, deleteFixedSlot, getFixedSlots } from '../../controllers/WorkerController/workerFixedSlotController';
import { getWorkerPayments, withdrawBalance } from '../../controllers/WorkerController/workerPaymentController';



const router = express.Router();

router.get('/allCategoriesName', get_categoires_name)
router.post('/worker-signup', worker_Signup);

// Add error handling middleware for file upload
router.post('/worker-verify-otp', uploadMiddleware, worker_verifyOtp);

router.post('/worker-resend-otp', worker_resendOtp);
router.post('/worker-login', worker_login);
router.post('/worker-logout', worker_logout);

router.post('/forgotPass-send-otp', forgotPass_sendOtp)
router.post('/forgotPass-verify-otp', forgotPass_verifyOtp)
router.post('/worker-reset-password', reset_FrogotPassword)



router.get('/workerDashboard/:workerEmail', get_worker_dashboard);
router.get('/metrics/:workerId', get_worker_metrics);
router.get('/ratings/:workerId', get_worker_ratings);


router.get('/worker-profile/:workerId', protect('RoleWorker'), getWorkerProfile);
router.put('/worker-profile-Update/:workerId', protect('RoleWorker'), worker_update_Profile)

// availability routes
router.delete('/availability/:workerId', deleteDate);
router.delete('/availability/slot/:workerId', protect('RoleWorker'), deleteTimeSlot);
router.get('/availability/:workerId', protect('RoleWorker'), getWorkerAvailability);
router.post('/availability/date/:workerId', protect('RoleWorker'), addDateAvailability);
router.post('/availability/slot/:workerId', protect('RoleWorker'), addTimeSlot);

router.post('/fixed-slot/:workerId', addFixedSlots);
router.delete('/fixed-slot/:workerId', deleteFixedSlot);
router.get('/fixed-slot/:workerId', getFixedSlots);

router.put('/worker-ChengePassword/:id', protect('RoleWorker'), worker_change_password)


router.get('/worker-bookingHistory/:workerId', getWorkerBookingHistory);
router.put('/booking/update-status', updateBooking_Status);


// Notification Routes both user 
router.post('/notifications/send-to-user', sendNotificationToUser);

// Wallet
router.get('/worker-payments/:workerId',  getWorkerPayments);
router.post('/withdraw/:workerId', withdrawBalance);


export default router