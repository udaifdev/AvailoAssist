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
exports.user_updateProfile = exports.user_Profile = void 0;
const userCollection_1 = __importDefault(require("../../models/userModel/userCollection"));
const generateToken_1 = __importDefault(require("../../utilits/generateToken"));
const user_Profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId; // Get worker ID from request params
    // console.log('worker Id ---> ', userId)
    // Check if req.user is defined
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized: No user found' });
        return;
    }
    try {
        // Ensure that the userId from the token matches the one in the request
        if (req.user._id.toString() !== userId) {
            res.status(403).json({ message: 'Forbidden: You can only view your own profile' });
            return;
        }
        // Find the user by ID and exclude sensitive data like password
        const user = yield userCollection_1.default.findById(userId).select('-password');
        // console.log('user collections ---> ', user)
        if (!user) {
            res.status(404).json({ message: 'user not found' });
            return;
        }
        // Return the worker data
        res.json(user); // Send the full worker data including availability and notifications
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.user_Profile = user_Profile;
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
// Update Profile
const user_updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const { name } = req.body; // Destructure name from request body
    console.log('user update profile data Received Data: -----> ', { userId, name });
    try {
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: 'Invalid name provided' });
            return;
        }
        const user = yield userCollection_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Update the name
        user.name = name.trim();
        const updatedUser = yield user.save();
        console.log('Updated User:', updatedUser);
        // Generate token
        const token = (0, generateToken_1.default)(res, user._id.toString(), 'RoleUser');
        res.json({
            message: 'User profile updated successfully',
            user: updatedUser,
            token,
        });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});
exports.user_updateProfile = user_updateProfile;
