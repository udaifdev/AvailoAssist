import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig'; // Import Cloudinary configuration

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user-profiles', // Specify Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'Webp'], // Allowed file formats
  } as Record<string, unknown>, // TypeScript workaround to handle 'folder'
});

const upload = multer({ storage });

export default upload;
