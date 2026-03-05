/**
 * Image Upload Strategy Document & Service Stub
 *
 * 1. Upload Flow:
 *    - Admin selects images in the frontend (Admin Car Form).
 *    - Next.js frontend sends images to a dedicated Backend endpoint `POST /api/upload`.
 *    - The backend uses `multer` to handle multipart/form-data.
 *    - This `CloudinaryService` uploads the buffer/file directly to Cloudinary (or S3).
 *
 * 2. Storage as URL:
 *    - Cloudinary returns a secure URL (e.g., `https://res.cloudinary.com/.../image.jpg`).
 *    - The backend returns this URL to the frontend.
 *
 * 3. Saving in Car Model:
 *    - The frontend receives the uploaded URLs.
 *    - The frontend appends these URLs to the `images` array in the `POST /api/cars` payload.
 *    - The Car service saves the URLs natively as strings in the MongoDB Car document.
 */

// Example Cloudinary Configuration (Placeholder)
// import { v2 as cloudinary } from 'cloudinary';
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

export const UploadService = {
    /**
     * Uploads a single file buffer to Cloudinary/S3 and returns the secure URL
     */
    async uploadImage(fileBuffer: Buffer, mimetype: string): Promise<string> {
        // Implementation placeholder:
        // return new Promise((resolve, reject) => {
        //   cloudinary.uploader.upload_stream(
        //     { folder: "car-rental/vehicles" },
        //     (error, result) => {
        //       if (error) return reject(error);
        //       resolve(result.secure_url);
        //     }
        //   ).end(fileBuffer);
        // });

        console.log("Mock uploading image of type:", mimetype);
        return `https://mock-cloud-storage.com/image-${Date.now()}.jpg`;
    },

    /**
     * Uploads multiple files in parallel
     */
    async uploadMultiple(files: { buffer: Buffer; mimetype: string }[]): Promise<string[]> {
        const uploadPromises = files.map((f) => this.uploadImage(f.buffer, f.mimetype));
        return Promise.all(uploadPromises);
    },
};
