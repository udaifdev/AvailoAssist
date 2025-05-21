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
    const userId = req.params.userId;
    console.log('profile worker Id ---> ', userId);
    try {
        const user = yield userCollection_1.default.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'user not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.user_Profile = user_Profile;
const user_updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const { name } = req.body;
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
        user.name = name.trim();
        const updatedUser = yield user.save();
        console.log('Updated User:', updatedUser);
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
