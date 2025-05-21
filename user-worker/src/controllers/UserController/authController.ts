import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import userModel from '../../models/userModel/userCollection';
// import { PassThrough } from 'stream';  
import generateToken from '../../utilits/generateToken';
require('dotenv').config();

// Setup multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });


// OTP Generation
const generateOtp = (): string => {
    return otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });
};

// Email sending function
const sendEmail = async (to: string, otp: string): Promise<void> => {
    try {
        if (!to || !to.includes('@')) {
            throw new Error('Invalid recipient email address');
        }

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

        await transporter.sendMail(mailOptions);
    } catch (error: any) {
        console.error('Error sending email:', error.message);
        throw error;
    }
};

// Temporary in-memory store for OTPs
const otpStore: { [key: string]: { otp: string; timestamp: number; attempts: number } } = {};

// Signup User Function
export const signupUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { firstName, email, password, mobile } = req.body;

        if (!email || !password || !firstName || !mobile) {
            return res.status(400).json({
                message: 'Please provide all required fields',
            });
        }

        // Check if the user already exists by phone number
        const existingMobileNumber = await userModel.findOne({ phone: mobile });
        if (existingMobileNumber) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }
        const existing_email = await userModel.findOne({ email: email });
        if (existing_email) {
            return res.status(400).json({ message: 'email already registered' });
        }

        // Generate OTP and store it
        const otp = generateOtp();

        console.log('Generated OTP ---> ', otp)

        otpStore[email] = {
            otp,
            timestamp: Date.now(),
            attempts: 0,
        };

        // Send OTP to user's email
        await sendEmail(email, otp);

        res.status(201).json({ message: 'OTP sent to your email.', email });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



interface CloudinaryUploadResult {
    secure_url: string;
    public_id?: string;
    [key: string]: any;
}



// Verify OTP Function
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp, firstName, password, mobile } = req.body;
        const profilePic = req.file;

        // console.log('Received file:---> ', req.file);

        // Change this validation
        if (!profilePic || !profilePic.path) {  // Check for path instead of buffer
            res.status(400).json({ message: 'Profile picture is missing or invalid' });
            return;
        }

        const otpData = otpStore[email];
        if (!otpData) {
            res.status(400).json({ message: 'OTP not found. Please request a new one.' });
            return
        }

        if (otpData.otp !== otp) {
            otpData.attempts++;
            if (otpData.attempts >= 4) {
                delete otpStore[email];
                res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
                return
            }
            res.status(400).json({ message: 'Invalid OTP' });
            return
        }

        // Check OTP expiration
        if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
            delete otpStore[email];
            res.status(400).json({ message: 'OTP expired. Please request a new one.' });
            return
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const imageUrl = profilePic.path;  // This is already the Cloudinary URL

        // Save user to the database
        const newUser = await userModel.create({
            name: firstName,
            email,
            password: hashedPassword,
            phone: mobile,
            image: imageUrl,
        });

        // Clean up OTP
        delete otpStore[email];

        // Generate JWT token
        const userToken = generateToken(res, newUser._id.toString(), 'RoleUser', 'jwt_user');

        res.status(201).json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            image: newUser.image,
            userToken,
            message: 'Signup successful',
        });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Resend OTP Function
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        console.log('email resend otp..........', email)
        
        const otp = generateOtp();
        otpStore[email] = {
            otp,
            timestamp: Date.now(),
            attempts: 0,
        };

        await sendEmail(email, otp);

        res.status(200).json({ message: 'New OTP sent successfully' });
    } catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Login Controller
export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    // console.log('email, password..........', email, password)
    
    // Check if email and password are provided
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    try {
        // Find user by email
        const user = await userModel.findOne({ email });

        // If user doesn't exist
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        // Check if user is blocked
        if (user.status === false) {
            res.status(403).json({ message: 'You are not able to login. Admin has blocked your account due to some issue.' });
            return;
        }
        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT token
        try {
            const userToken = generateToken(res, user._id.toString(), 'RoleUser', 'jwt_user');
            res.status(200).json({ username: user.name, email: user.email, id: user._id, userToken });
        } catch (tokenError) {
            console.error('JWT generation error:', tokenError);
            res.status(500).json({ message: 'Error generating token' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in user' });
    }
};


// Forgot Password User Function
export const forgotPass_sendOtp = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' });
        return
    }

    try {
        // Validate email format
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(email)) {
            res.status(400).json({ success: false, message: 'Invalid email format' });
            return
        }

        // Generate OTP and store it
        const otp = generateOtp();

        console.log('Generated OTP Forgot Password ------> ', otp)

        otpStore[email] = {
            otp,
            timestamp: Date.now(),
            attempts: 0,
        };
        await sendEmail(email, otp);

        res.status(200).json({success: true,message: 'OTP sent to your email',});

    } catch (error) {
        console.error('Error forgot password sending OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again later.', });
    }
}


// Forgot Password Verify OTP Function
export const forgotPass_verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp} = req.body;

        console.log('forgot pass verify data--------> ', email, otp);

        const otpData = otpStore[email];

        if (!otpData) {
            res.status(400).json({ message: 'OTP not found. Please request a new one.' });
            return
        }

        if (otpData.otp !== otp) {
            otpData.attempts++;
            if (otpData.attempts >= 5) {
                delete otpStore[email];
                res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
                return
            }
            res.status(400).json({ message: 'Invalid OTP' });
            return
        }

        // Check OTP expiration
        if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
            delete otpStore[email];
            res.status(400).json({ message: 'OTP expired. Please request a new one.' });
            return
        }

        // Clean up OTP
        delete otpStore[email];

        // Generate JWT token

        res.status(201).json({message: 'otp verification successful',});

    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Reset Forgot Password
export const reset_FrogotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
        res.status(400).json({ success: false, message: 'Email, new password, and confirm password are required' });
        return;
    }

    if (newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        return;
    }

    if (newPassword !== confirmPassword) {
        res.status(400).json({ success: false, message: 'Passwords do not match' });
        return;
    }

    try {
        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({success: true,message: 'Password reset successfully. You can now log in with your new password.',});
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};




// Logout User
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    res.cookie('jwt_user', '', {  // Clear the jwt_user cookie
        httpOnly: true,
        expires: new Date(0),  // Expire the cookie immediately
    });
    res.status(200).json({ message: 'User logged out successfully' });
};
