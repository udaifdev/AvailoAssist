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
const bcrypt_1 = __importDefault(require("bcrypt"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const multer_1 = __importDefault(require("multer"));
const userCollection_1 = __importDefault(require("../../models/userModel/userCollection"));
const generateToken_1 = __importDefault(require("../../utilits/generateToken"));
require('dotenv').config();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const generateOtp = () => {
    return otp_generator_1.default.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });
};
const sendEmail = (to, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!to || !to.includes('@')) {
            throw new Error('Invalid recipient email address');
        }
        const transporter = nodemailer_1.default.createTransport({
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
        console.error('Error sending email:', error.message);
        throw error;
    }
});
const otpStore = {};
const signupUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, email, password, mobile } = req.body;
        if (!email || !password || !firstName || !mobile) {
            return res.status(400).json({
                message: 'Please provide all required fields',
            });
        }
        const existingMobileNumber = yield userCollection_1.default.findOne({ phone: mobile });
        if (existingMobileNumber) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }
        const existing_email = yield userCollection_1.default.findOne({ email: email });
        if (existing_email) {
            return res.status(400).json({ message: 'email already registered' });
        }
        const otp = generateOtp();
        otpStore[email] = {
            otp,
            timestamp: Date.now(),
            attempts: 0,
        };
        yield sendEmail(email, otp);
        res.status(201).json({ message: 'OTP sent to your email.', email });
    }
    catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.signupUser = signupUser;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp, firstName, password, mobile } = req.body;
        const profilePic = req.file;
        console.log('Received file:---> ', req.file);
        if (!profilePic || !profilePic.path) {
            res.status(400).json({ message: 'Profile picture is missing or invalid' });
            return;
        }
        const otpData = otpStore[email];
        if (!otpData) {
            res.status(400).json({ message: 'OTP not found. Please request a new one.' });
            return;
        }
        if (otpData.otp !== otp) {
            otpData.attempts++;
            if (otpData.attempts >= 4) {
                delete otpStore[email];
                res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
                return;
            }
            res.status(400).json({ message: 'Invalid OTP' });
            return;
        }
        if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
            delete otpStore[email];
            res.status(400).json({ message: 'OTP expired. Please request a new one.' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const imageUrl = profilePic.path;
        const newUser = yield userCollection_1.default.create({
            name: firstName,
            email,
            password: hashedPassword,
            phone: mobile,
            image: imageUrl,
        });
        delete otpStore[email];
        const token = (0, generateToken_1.default)(res, newUser._id.toString(), 'User');
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
        console.error('Error during OTP verification:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.verifyOtp = verifyOtp;
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const otp = generateOtp();
        otpStore[email] = {
            otp,
            timestamp: Date.now(),
            attempts: 0,
        };
        yield sendEmail(email, otp);
        res.status(200).json({ message: 'New OTP sent successfully' });
    }
    catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.resendOtp = resendOtp;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log('login function reached -------->');
    try {
        const user = yield userCollection_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = (0, generateToken_1.default)(res, user._id.toString(), 'RoleUser');
        res.status(200).json({ username: user.name, email: user.email, token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in user' });
    }
});
exports.login = login;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'User logged out successfully' });
});
exports.logoutUser = logoutUser;
