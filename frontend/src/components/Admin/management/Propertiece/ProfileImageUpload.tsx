import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dailog';
import { Button } from '../../../ui/dailog';
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { adminAxios } from '../../../../API/axios';

interface ProfileImageUploadProps {
    onImageSave: (blob: Blob) => void;
    isOpen: boolean;
    onClose: () => void;
}

interface CropState extends Crop {
    unit: 'px' | '%';
    x: number;
    y: number;
    width: number;
    height: number;
    aspect?: number;
}

interface ButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

const CustomButton: React.FC<ButtonProps> = ({ children, className, onClick, disabled }) => (
    <button
        className={`px-4 py-2 rounded-md transition-colors ${className}`}
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </button>
);

interface ProfileImageUploadProps {
    onImageSave: (blob: Blob) => void;
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;  //  imageUrl prop
    userId: string | null;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ onImageSave, isOpen, onClose, imageUrl, userId }) => {
    const [src, setSrc] = useState<string>(imageUrl);  // Initialize with the passed image URL
    const [crop, setCrop] = useState<CropState>({
        unit: '%',
        x: 0,
        y: 0,
        width: 90,
        height: 90,
        aspect: 1
    });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        setSrc(imageUrl); // Update the image source when the imageUrl prop changes
    }, [imageUrl]);

    const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSrc(reader.result?.toString() || '');
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const getCroppedImg = (image: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        // Draw the cropped image
        ctx.drawImage(
            image,
            pixelCrop.x * scaleX,
            pixelCrop.y * scaleY,
            pixelCrop.width * scaleX,
            pixelCrop.height * scaleY,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    resolve(blob);
                },
                'image/jpeg',
                1
            );
        });
    };

    const handleSave = async () => {
        try {
            if (!imageRef.current || !completedCrop || !userId) {
                return;
            }
      
          // Get the cropped image as a Blob
          const croppedImage = await getCroppedImg(imageRef.current, completedCrop);
          
          // Create FormData to send the image and any other profile data
          const formData = new FormData();
          formData.append('profilePic', croppedImage, 'profile.jpg');  // Append the cropped image to the form
          formData.append('userId', userId);

          // Send the cropped image and data to the backend
          await updateUserProfile(userId, formData);  // Send to the backend
      
          // Reset the image source and close the dialog
          setSrc('');
          onClose();
        } catch (error) {
          console.error('Error saving image:', error);
        }
      };
      
      // Function to handle the API call for updating the profile
      const updateUserProfile = async (userId: string, formData: FormData) => {
        try {
            // Specify the route.........................
          const response = await adminAxios.put(` /${userId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',  
            },
          });
      
          if (response.data.success) {
            console.log('Profile Cropping successfully', response.data);
          } else {
            console.error('Profile Cropping failed', response.data.message);
          }
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      };
      

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1,
                width,
                height
            ),
            width,
            height
        );
        setCrop(crop);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} className="fixed justify-center flex inset-0 z-50 backdrop-blur-md bg-black bg-opacity-50">
            <DialogContent className="sm:max-w-xl mt-8 bg-white p-4">
                <DialogHeader>
                    <DialogTitle className='text-center bg-teal-600 rounded-xl font-bold text-white'>Crop User Profile Picture</DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <div className="mb-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onSelectFile}
                            className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-teal-50 file:text-teal-700
                  hover:file:bg-teal-100"
                        />
                    </div>

                    {src && (
                        <div className="max-h-[400px] overflow-auto">
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c as CropState)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    ref={imageRef}
                                    src={src}
                                    onLoad={onImageLoad}
                                    className="max-w-full h-auto"
                                    alt="Crop me"
                                />
                            </ReactCrop>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                    <CustomButton
                        className="bg-red-600 text-white border border-gray-300 hover:bg-red-400"
                        onClick={onClose}
                    >
                        Cancel
                    </CustomButton>
                    <CustomButton
                        className="bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSave}
                        disabled={!completedCrop || !src}
                    >
                        Save
                    </CustomButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileImageUpload;
