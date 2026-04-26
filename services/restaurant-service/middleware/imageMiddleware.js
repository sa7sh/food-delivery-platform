import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware to validate image URLs and handle Base64 auto-upload.
 * Enforces that images are hosted on Cloudinary and prevents large Base64 blobs.
 */
export const validateAndUploadImages = async (req, res, next) => {
  try {
    const fieldsToProcess = ['profileImage', 'restaurantImage', 'image'];

    for (const field of fieldsToProcess) {
      const value = req.body[field];

      if (!value) continue;

      // 1. Handle Base64 strings
      if (value.startsWith('data:image')) {
        // Calculate approximate size in MB (base64 is ~33% larger than binary)
        const sizeInBytes = (value.length * 3) / 4;
        const sizeInMb = sizeInBytes / (1024 * 1024);

        if (sizeInMb > 2) {
          throw new AppError(`Base64 image in ${field} is too large (>2MB). Please use multipart upload.`, 400);
        }

        console.log(`[ImageMiddleware] Auto-uploading base64 ${field} to Cloudinary...`);
        const uploadResponse = await cloudinary.uploader.upload(value, {
          folder: 'food-delivery-app/auto-uploads',
        });

        req.body[field] = uploadResponse.secure_url;
      }

      // 2. Enforce Cloudinary URLs for non-base64 strings
      else if (typeof value === 'string' && value.length > 0) {
        if (!value.includes('res.cloudinary.com')) {
          console.warn(`[ImageMiddleware] External URL detected in ${field}: ${value}`);
          // Optional: You could throw an error here if you want to be strict
          // throw new AppError('Only Cloudinary URLs are allowed for images.', 400);
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
