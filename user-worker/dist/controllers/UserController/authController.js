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
exports.logoutUser = exports.login = exports.resendOtp = exports.verifyOtp = exports.signupUser = void 0;
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const generateToken_1 = __importDefault(require("../../utilits/generateToken"));
const userCollection_1 = __importDefault(require("../../models/userModel/userCollection"));
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
        console.error("Error sending email:", error); // Log email errors
        throw error;
    }
});
// Temporary storage for OTPs (in-memory object for simplicity)
const otpStore = {};
// Signup User Function
const signupUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, mobile } = req.body;
        // Check if the user already exists by email
        const existingUser = yield userCollection_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        // Check if the user already exists by phone number
        const existingMobileNumber = yield userCollection_1.default.findOne({ phone: mobile });
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
        console.error("Error during signup:", error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.signupUser = signupUser;
// Verify OTP Function
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp, firstName, password, mobile, profilePic } = req.body;
        // Check if OTP exists for the email
        const otpData = otpStore[email];
        if (!otpData) {
            res.status(400).json({ message: 'OTP not found. Please request a new one.' });
            return;
        }
        // Check if OTP is expired
        if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
            delete otpStore[email];
            res.status(400).json({ message: 'OTP expired. Please request a new one.' });
            return;
        }
        // Validate OTP
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
        // OTP verified; create user
        const hashedPassword = yield bcrypt.hash(password, 10);
        const newUser = yield userCollection_1.default.create({
            name: firstName,
            email,
            password: hashedPassword,
            phone: mobile,
            image: profilePic,
        });
        // Clean up OTP
        delete otpStore[email];
        // Generate JWT and send response
        const token = (0, generateToken_1.default)(res, newUser._id.toString(), 'RoleUser');
        console.log(newUser._id);
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            image: newUser.image,
            token,
            message: 'Signup successful',
        });
    }
    catch (error) {
        console.error("Error during OTP verification:", error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.verifyOtp = verifyOtp;
// Resend OTP Endpoint
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.resendOtp = resendOtp;
// Login Controller
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield userCollection_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isPasswordValid = yield bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        // Generate JWT token
        const token = (0, generateToken_1.default)(res, user._id.toString(), 'RoleUser');
        res.status(200).json({ username: user.name, email: user.email, token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in user' });
    }
});
exports.login = login;
// Logout User
const logoutUser = (res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logout User succsus' });
});
exports.logoutUser = logoutUser;
