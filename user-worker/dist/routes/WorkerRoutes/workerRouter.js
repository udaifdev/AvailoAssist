"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workerAuthContorller_1 = require("../../controllers/WorkerController/workerAuthContorller");
const workerProfileController_1 = require("../../controllers/WorkerController/workerProfileController");
const userAuth_1 = require("../../middleware/userMiddleware/userAuth");
const router = express_1.default.Router();
router.post('/signup', workerAuthContorller_1.worker_Signup);
router.post('/worker-verify-otp', workerAuthContorller_1.worker_verifyOtp);
router.post('/worker-resend-otp', workerAuthContorller_1.worker_resendOtp);
router.post('/worker-login', workerAuthContorller_1.worker_login);
router.post('/worker-logout', workerAuthContorller_1.worker_logout);
router.get('/worker-profile/:workerId', workerProfileController_1.getWorkerProfile); // --------------- call proctect make sure ---------------------------------
router.put('/worker-profile-Update/:workerId', (0, userAuth_1.protect)('RoleWorker'), workerProfileController_1.worker_update_Profile);
exports.default = router;
