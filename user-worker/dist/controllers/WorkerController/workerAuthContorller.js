"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker_logout = exports.worker_login = exports.worker_resendOtp = exports.worker_verifyOtp = exports.worker_Signup = void 0;
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const generateToken_1 = __importDefault(require("../../utilits/generateToken"));
const workerCollection_1 = __importDefault(require("../../models/workerModel/workerCollection"));
require('dotenv').config();
// Function to generate an OTP using otp-generator
const generateOtp = () => {
    return otpGenerator.generate(4, {
        upperCaseAlphabets: false, // No uppercase letters
        specialChars: false, // No special characters
        lowerCaseAlphabets: false, // No lowercase letters
    });
};
// Function to send an email with OTP
const sendEmail = (to, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to,
            subject: 'Your OTP for Signup',
            text: `Your OTP is: ${otp}`,
        };
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error worker sending email: ---> ", error); // Log email errors
        throw error;
    }
});
// Temporary storage for OTPs (in-memory object for simplicity)
const otpStore = {};
// Signup User Function
const worker_Signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, mobile } = req.body;
        // Check if the user already exists by email
        const existingUser = yield workerCollection_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Worker already exists with this email' });
        }
        // Check if the user already exists by phone number
        const existingMobileNumber = yield workerCollection_1.default.findOne({ phone: mobile });
        if (existingMobileNumber) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }
        // Generate OTP and store it
        const otp = generateOtp();
        otpStore[email] = {
            otp,
            timestamp: Date.now(),
            attempts: 0
        };
        // Send OTP to the user's email
        yield sendEmail(email, otp);
        res.status(201).json({ message: 'OTP sent to your email.', email });
    }
    catch (error) {
        console.error("Error during worker signup:---> ", error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.worker_Signup = worker_Signup;
// Worker Verify OTP Function
const worker_verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp, fullName, password, mobile, category, streetAddress, city, zipCode, workRadius, workExperience, profilePicture, governmentId, governmentIdNo, } = req.body;
        console.log(email, otp, fullName, password, mobile, category, streetAddress, city, zipCode, workRadius, workExperience, profilePicture, governmentId, governmentIdNo);
        // Validate required fields
        if (!fullName || !streetAddress || !workExperience || !password || !email || !otp) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        // Validate `governmentId` and other optional fields
        // if (governmentId && typeof governmentId !== 'string') {
        //     res.status(400).json({ message: 'Invalid governmentId format' });
        //     return;
        // }
        // Validate OTP
        const otpData = otpStore[email];
        if (!otpData) {
            res.status(400).json({ message: 'OTP not found. Please request a new one.' });
            return;
        }
        if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
            delete otpStore[email];
            res.status(400).json({ message: 'OTP expired. Please request a new one.' });
            return;
        }
        if (otpData.otp !== otp) {
            otpData.attempts += 1;
            if (otpData.attempts >= 4) {
                delete otpStore[email];
                res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
                return;
            }
            res.status(400).json({ message: 'Invalid OTP' });
            return;
        }
        // Hash password and save the worker
        const hashedPassword = yield bcrypt.hash(password, 10);
        const newWorker = yield workerCollection_1.default.create({
            fullName,
            email,
            mobile,
            password: hashedPassword,
            category,
            streetAddress,
            city,
            zipCode,
            workRadius,
            workExperience,
            profilePicture,
            governmentId: governmentId || null,
            governmentIdNo,
        });
        // Clean up OTP data
        delete otpStore[email];
        // Generate JWT and send a response
        const token = (0, generateToken_1.default)(res, newWorker.id.toString(), 'RoleWorker');
        console.log('Generated Token Otp side --> ', token);
        res.status(201).json({
            _id: newWorker._id,
            fullName: newWorker.fullName,
            email: newWorker.email,
            mobile: newWorker.mobile,
            token,
            message: 'Worker successfully registered',
        });
    }
    catch (error) {
        console.error("Error during OTP verification:", error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.worker_verifyOtp = worker_verifyOtp;
// Resend OTP Endpoint
const worker_resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Generate new OTP
        const otp = generateOtp();
        otpStore[email] = {
            otp,
            timestamp: Date.now(),
            attempts: 0
        };
        // Send new OTP
        yield sendEmail(email, otp);
        res.status(200).json({ message: 'New OTP sent successfully' });
    }
    catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.worker_resendOtp = worker_resendOtp;
// Login Controller
const worker_login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const worker = yield workerCollection_1.default.findOne({ email });
        if (!worker) {
            res.status(400).json({ message: 'Email Invalid credentials' });
            return;
        }
        const isPasswordValid = yield bcrypt.compare(password, worker.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Password Invalid credentials' });
            return;
        }
        // Generate JWT token
        const token = (0, generateToken_1.default)(res, worker.id.toString(), 'RoleWorker');
        console.log('Generated login Token: ---->', token);
        res.status(201).json({ username: worker.fullName, email: worker.email, token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in worker' });
    }
});
exports.worker_login = worker_login;
// Logout User
const worker_logout = (res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logout worker succsus' });
});
exports.worker_logout = worker_logout;
