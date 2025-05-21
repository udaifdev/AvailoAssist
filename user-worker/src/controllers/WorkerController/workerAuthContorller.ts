import { Request, Response } from 'express';
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
import generateToken from '../../utilits/generateToken';
import workerModel from '../../models/workerModel/workerCollection'
import { v2 as cloudinary } from 'cloudinary';
require('dotenv').config()
import webpush from 'web-push';

import mongoose from 'mongoose';
import { ServiceSchema } from '../../../../admin/src/service/entities/service.entity'; // Import the schema

// Check if the model already exists, otherwise create it
const ServiceModel = mongoose.models.Service || mongoose.model('Service', ServiceSchema);




// Function to generate an OTP using otp-generator
const generateOtp = (): string => {
    return otpGenerator.generate(4, {
        upperCaseAlphabets: false, // No uppercase letters
        specialChars: false, // No special characters
        lowerCaseAlphabets: false, // No lowercase letters
    });
};


// Function to send an email with OTP
const sendEmail = async (to: string, otp: string): Promise<void> => {
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

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error worker sending email: ---> ", error); // Log email errors
        throw error;
    }
};

export const get_categoires_name = async (req: Request, res: Response): Promise<any> => {
    try {
        const services = await ServiceModel.find({ status: { $regex: /^active$/i } }).select('categoryName');
        return res.status(200).json(services)
    } catch (error) {
        console.error("Error during worker signup getting service name ---> ", error);
        res.status(500).json({ message: 'Server error' });
    }
}


// Temporary storage for OTPs (in-memory object for simplicity)
const otpStore: { [key: string]: { otp: string; timestamp: number; attempts: number } } = {};

// Signup worker Function
export const worker_Signup = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, mobile } = req.body;
        console.log('email and mobile number....... ', email, mobile)

        // Check if the user already exists by email
        const existingUser = await workerModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Worker already exists with this email' });
        }

        // Check if the user already exists by phone number
        const existingMobileNumber = await workerModel.findOne({ phone: mobile });
        if (existingMobileNumber) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        // Generate OTP and store it
        const otp = generateOtp();
        console.log('Generated OTP for worker ----> ', otp)

        otpStore[email] = {
            otp,
            timestamp: Date.now(),
            attempts: 0
        };

        // Send OTP to the user's email
        await sendEmail(email, otp);

        res.status(201).json({ message: 'OTP sent to your email.', email });
    } catch (error) {
        console.error("Error during worker signup:---> ", error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Worker Verify OTP Function
export const worker_verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("Files received: ----> ", req.files);

        const { email, otp, fullName, password, mobile, category, streetAddress, city, zipCode,
            workRadius, workExperience, profilePicture, governmentId, governmentIdNo } = req.body;

        // console.log("Received data:", { email, otp });

        // When checking files
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (!files || !files.profilePicture || !files.governmentId) {
            console.error('Missing files:', {
                hasFiles: !!files,
                hasProfilePicture: !!files?.profilePicture,
                hasGovernmentId: !!files?.governmentId
            });
            res.status(400).json({
                message: 'Both profile picture and government ID are required',
                debug: {
                    receivedFiles: Object.keys(files || {})
                }
            });
            return
        }

        // Log the files received to debug
        console.log("Uploaded files:---> ", files);

        // Get Cloudinary URLs from the uploaded files
        const profilePicUrl = files?.profilePicture?.[0]?.path || null;
        const governmentIdUrl = files?.governmentId?.[0]?.path || null;

        console.log("profile URLs..... ", { profilePicUrl }, 'document urls..... ', { governmentIdUrl });

        // At the start of the controller
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);



        // Validate required fields
        if (!email || !otp || !fullName || !password) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Validate file uploads if required
        if (!profilePicUrl || !governmentIdUrl) {
            res.status(400).json({ message: 'Both profile picture and government ID are required' });
            return;
        }

        // Validate OTP
        const otpData = otpStore[email];
        if (!otpData) {
            res.status(400).json({ message: 'OTP not found. Please request a new one.' });
            return;
        }

        if (Date.now() - otpData.timestamp > 5 * 60 * 1000) { // OTP valid for 5 minutes
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

        // Create worker with file URLs
        const hashedPassword = await bcrypt.hash(password, 10);
        const newWorker = await workerModel.create({
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
            profilePicture: profilePicUrl, // Cloudinary URL
            governmentId: governmentIdUrl, // Cloudinary URL
            governmentIdNo,
        });

        // Verify that the worker was created with the file URLs
        console.log("Created worker ------>", {
            id: newWorker._id,
            profilePicture: newWorker.profilePicture,
            governmentId: newWorker.governmentId
        });


        // Clean up OTP data
        delete otpStore[email];

        // Generate JWT and respond
        const workerToken = generateToken(res, newWorker.id.toString(), 'RoleWorker', 'jwt_worker');

        res.status(201).json({
            _id: newWorker._id,
            fullName: newWorker.fullName,
            email: newWorker.email,
            mobile: newWorker.mobile,
            profilePicture: newWorker.profilePicture, // Include URLs in response
            governmentId: newWorker.governmentId,
            serviceStatus: newWorker.serviceStatus,
            workerToken,
            message: 'Worker successfully registered',
        });
    } catch (error) {
        console.error("Error during OTP verification -------> ", error);
        // Log more detailed error information
        if (error instanceof Error) {
            console.error("Error details:", {
                message: error.message,
                stack: error.stack
            });
        }
        res.status(500).json({ message: 'Server error' });
    }
};


// export const worker_verifyOtp = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { email, otp, fullName, password, mobile, category, streetAddress, city, zipCode,
//             workRadius, workExperience, profilePicture, governmentId, governmentIdNo, } = req.body;

//         console.log(email, otp, fullName, password, mobile, category, streetAddress, city, zipCode,
//             workRadius, workExperience, profilePicture, governmentId, governmentIdNo,)

//         // Validate required fields
//         if (!fullName || !streetAddress || !workExperience || !password || !email || !otp) {
//             res.status(400).json({ message: 'Missing required fields' });
//             return;
//         }

//         // Validate `governmentId` and other optional fields
//         // if (governmentId && typeof governmentId !== 'string') {
//         //     res.status(400).json({ message: 'Invalid governmentId format' });
//         //     return;
//         // }

//         // Validate OTP
//         const otpData = otpStore[email];
//         if (!otpData) {
//             res.status(400).json({ message: 'OTP not found. Please request a new one.' });
//             return;
//         }

//         if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
//             delete otpStore[email];
//             res.status(400).json({ message: 'OTP expired. Please request a new one.' });
//             return;
//         }

//         if (otpData.otp !== otp) {
//             otpData.attempts += 1;
//             if (otpData.attempts >= 4) {
//                 delete otpStore[email];
//                 res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
//                 return;
//             }
//             res.status(400).json({ message: 'Invalid OTP' });
//             return;
//         }

//         // Hash password and save the worker
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newWorker = await workerModel.create({
//             fullName,
//             email,
//             mobile,
//             password: hashedPassword,
//             category,
//             streetAddress,
//             city,
//             zipCode,
//             workRadius,
//             workExperience,
//             profilePicture,
//             governmentId: governmentId || null,
//             governmentIdNo,
//         });

//         // Clean up OTP data
//         delete otpStore[email];

//         // Generate JWT and send a response
//         const token = generateToken(res, newWorker.id.toString(), 'RoleWorker');
//         console.log('Generated Token Otp side --> ', token)

//         res.status(201).json({
//             _id: newWorker._id,
//             fullName: newWorker.fullName,
//             email: newWorker.email,
//             mobile: newWorker.mobile,
//             token,
//             message: 'Worker successfully registered',
//         });
//     } catch (error) {
//         console.error("Error during OTP verification:", error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };


// Resend OTP Endpoint



export const worker_resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        // Generate new OTP
        const otp = generateOtp();
        console.log('resend worker otp...........', otp)
            
        otpStore[email] = {
            otp,
            timestamp: Date.now(),
            attempts: 0
        };

        // Send new OTP
        await sendEmail(email, otp);

        res.status(200).json({ message: 'New OTP sent successfully' });
    } catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Login Controller
export const worker_login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const worker = await workerModel.findOne({ email });
        if (!worker) {
            res.status(400).json({ message: 'Email Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, worker.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Password Invalid credentials' });
            return;
        }

        // Generate JWT token
        const workerToken = generateToken(res, worker.id.toString(), 'RoleWorker', 'jwt_worker');
        console.log('Generated login worker Token: ---->', workerToken);


        res.status(201).json({ id: worker._id, username: worker.fullName, email: worker.email, workerToken, serviceStatus: worker.serviceStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in worker' });
    }
};


// Forgot Password Worker Function
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
    const { email, newPassword} = req.body;

    if (!email || !newPassword ) {
        res.status(400).json({ success: false, message: 'Email, new password, and confirm password are required' });
        return;
    }

    if (newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        return;
    }
    try {
        // Find the user by email
        const user = await workerModel.findOne({ email });
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



// Logout worker
export const worker_logout = async (req: Request, res: Response): Promise<void> => {
    res.cookie('jwt_worker', '', {  // Clear the jwt_worker cookie
        httpOnly: true,
        expires: new Date(0)  // Expire the cookie immediately
    });
    res.status(200).json({ message: 'Worker logged out successfully' });
};






 