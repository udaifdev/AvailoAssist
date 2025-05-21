"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinaryConfig_1 = __importDefault(require("./cloudinaryConfig"));
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinaryConfig_1.default,
    params: {
        folder: 'user-profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
});
const upload = (0, multer_1.default)({ storage });
exports.default = upload;
