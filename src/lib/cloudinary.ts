import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export { cloudinary };

// Upload file to Cloudinary
export async function uploadToCloudinary(
    fileBuffer: Buffer,
    folder: string,
    resourceType: "image" | "video" | "raw" = "image",
    options?: Record<string, unknown>
): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: `ivy-lms/${folder}`,
            resource_type: resourceType,
            ...options
        };

        cloudinary.uploader
            .upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                } else {
                    reject(new Error("Upload failed - no result"));
                }
            })
            .end(fileBuffer);
    });
}

// Upload audio file specifically
export async function uploadAudioToCloudinary(
    fileBuffer: Buffer,
    folder: string = "student-audio",
    options?: Record<string, unknown>
): Promise<{ url: string; publicId: string }> {
    return uploadToCloudinary(fileBuffer, folder, "video", {
        // Audio files are treated as video in Cloudinary
        ...options
    });
}

// Upload image file
export async function uploadImageToCloudinary(
    fileBuffer: Buffer,
    folder: string = "assignments",
    options?: Record<string, unknown>
): Promise<{ url: string; publicId: string }> {
    return uploadToCloudinary(fileBuffer, folder, "image", {
        transformation: [
            { width: 1920, height: 1080, crop: "limit" }, // Limit max dimensions
            { quality: "auto:good" }, // Auto-optimize quality
            { fetch_format: "auto" } // Auto-select best format
        ],
        ...options
    });
}

// Upload assignment attachment/document
export async function uploadDocumentToCloudinary(
    fileBuffer: Buffer,
    folder: string = "assignments/documents",
    filename?: string,
    options?: Record<string, unknown>
): Promise<{ url: string; publicId: string }> {
    return uploadToCloudinary(fileBuffer, folder, "raw", {
        ...(filename && { public_id: filename }),
        ...options
    });
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

// Generate signed upload preset for client-side uploads (optional)
export function generateUploadSignature(
    timestamp: number,
    folder: string
): string {
    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: `ivy-lms/${folder}` },
        process.env.CLOUDINARY_API_SECRET!
    );
    return signature;
}
