"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../../middleware/cloudinary/upload"));
const uploadsRoutesrouter = express_1.default.Router();
uploadsRoutesrouter.post('/upload', upload_1.default.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    res.status(200).json({
        message: 'File uploaded successfully',
        url: req.file.path,
    });
});
exports.default = uploadsRoutesrouter;
