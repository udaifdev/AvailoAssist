import express, { Request, Response } from 'express';
import upload from '../../middleware/cloudinary/upload';

const uploadsRoutesrouter = express.Router();

uploadsRoutesrouter.post('/upload', upload.single('file'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  res.status(200).json({
    message: 'File uploaded successfully',
    url: (req.file as Express.Multer.File & { path: string }).path, // Cloudinary secure URL
  });
});

export default uploadsRoutesrouter;
