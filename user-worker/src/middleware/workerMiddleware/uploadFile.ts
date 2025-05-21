// import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import cloudinary from '../cloudinary/cloudinaryConfig'; // Import Cloudinary configuration

// // Configure Cloudinary storage for Multer
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'worker-folder', // Specify Cloudinary folder
//     allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], // Allowed file formats
//   } as Record<string, unknown>, // TypeScript workaround to handle 'folder'
// });

// const uploadFile = multer({ storage });

// export default uploadFile;



// ../middleware/workerMiddleware/uploadFile.ts
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../cloudinary/cloudinaryConfig';
import { Request, Response, NextFunction } from 'express';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req: Express.Request, file: Express.Multer.File) => {
      console.log(`Processing file: ${file.fieldname}, mimetype: ${file.mimetype}`);
      if (file.fieldname === 'profilePicture') {
        return 'worker_profile_pics';
      } else if (file.fieldname === 'governmentId') {
        return 'worker_government_ids';
      }
      return 'misc';
    },    
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'], // Added WebP support
    transformation: (req: Express.Request, file: Express.Multer.File) => {
      console.log(`Applying transformation for: ${file.fieldname}`);
      return file.fieldname === 'profilePicture' 
        ? [
            { width: 500, height: 500, crop: 'limit' },
            { format: 'jpeg' }  // Convert WebP to JPEG for consistency
          ] 
        : [];
    }
  } as Record<string, any>
});

const uploadFile = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log(`Filtering file: ${file.fieldname}, mimetype: ${file.mimetype}`);
    
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (file.fieldname === 'profilePicture') {
      if (!allowedImageTypes.includes(file.mimetype)) {
        console.log('Profile picture validation failed: invalid mime type');
        return cb(new Error('Profile picture must be a JPEG, PNG, or WebP image'));
      }
    }
    
    if (file.fieldname === 'governmentId') {
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype)) {
        console.log('Government ID validation failed: invalid mime type');
        return cb(new Error('Government ID must be a JPEG, PNG image or PDF'));
      }
    }
    
    console.log(`File ${file.fieldname} passed validation`);
    cb(null, true);
  }
});

const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('Starting file upload process');
  console.log('Content-Type:', req.headers['content-type']);
  
  uploadFile.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ 
        message: err.message,
        code: 'FILE_UPLOAD_ERROR',
        details: err
      });
    }
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    console.log('Successfully uploaded files:', Object.keys(files || {}));
    
    next();
  });
};

export default uploadMiddleware;