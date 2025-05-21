import express from 'express';
import { sendMessage, getBookingMessages } from '../../controllers/ChatController/chatController';
import uploadMiddleware from '../Uploads/uploadChatRoute';  
import { protect } from '../../middleware/chatMiddleware/chatAuth';

const router = express.Router();

router.post('/send-message', protect('RoleUser'), uploadMiddleware.single('media'), sendMessage);
router.post('/chat/send-message', protect('RoleWorker'), uploadMiddleware.single('media'), sendMessage);
router.get('/booking-messages/:bookingId', protect('RoleUser'), getBookingMessages);
router.get('/booking-messages/:bookingId', protect('RoleWorker'), getBookingMessages);


export default router;