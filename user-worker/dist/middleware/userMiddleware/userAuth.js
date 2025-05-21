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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userCollection_1 = __importDefault(require("../../models/userModel/userCollection")); // Update with your actual path
const protect = (requiredRole) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let token;
        //cookies are being parsed
        token = req.cookies.jwt;
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                if (decoded.role !== requiredRole) {
                    res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
                    return;
                }
                req.user = yield userCollection_1.default.findById(decoded.userId).select('-password');
                if (!req.user) {
                    res.status(404).json({ message: 'User not found' });
                    return;
                }
                next();
            }
            catch (error) {
                console.error('Token verification failed:', error);
                res.status(401).json({ message: 'Not Authorized, Invalid Token' });
            }
        }
        else {
            res.status(401).json({ message: 'Not Authorized, No Token' });
        }
    });
};
exports.protect = protect;
