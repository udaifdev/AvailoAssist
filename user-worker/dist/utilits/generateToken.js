"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function generateToken(res, userId, role) {
    // Include the role in the payload of the token
    const token = jsonwebtoken_1.default.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expiration
    });
    res.cookie('jwt', token, {
        httpOnly: true, // Secure cookie
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies outside development
        sameSite: 'strict', // Protect against CSRF
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return token;
}
exports.default = generateToken;
