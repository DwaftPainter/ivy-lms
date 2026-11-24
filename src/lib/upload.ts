export type UploadType = "audio" | "image" | "document";

export interface UploadResult {
    url: string;
    publicId: string;
    type: string;
    originalName: string;
}

/**
 * Upload a file to Cloudinary via the API
 */
export async function uploadFile(
    file: File,
    type: UploadType,
    folder?: string,
    _onProgress?: (progress: number) => void
): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (folder) {
        formData.append("folder", folder);
    }

    // Note: apiFetch sets Content-Type to application/json by default
    // For FormData, we need to let the browser set the Content-Type with boundary
    const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Upload failed");
    }

    return data.data;
}

/**
 * Upload audio recording (e.g., for speaking assignments)
 */
export async function uploadAudio(
    audioBlob: Blob,
    filename: string = `recording-${Date.now()}.webm`,
    folder: string = "student-audio",
    onProgress?: (progress: number) => void
): Promise<UploadResult> {
    const file = new File([audioBlob], filename, { type: "audio/webm" });
    return uploadFile(file, "audio", folder, onProgress);
}

/**
 * Upload image (e.g., for assignment images)
 */
export async function uploadImage(
    imageFile: File,
    folder: string = "assignments",
    onProgress?: (progress: number) => void
): Promise<UploadResult> {
    return uploadFile(imageFile, "image", folder, onProgress);
}

/**
 * Upload document (e.g., PDF attachments)
 */
export async function uploadDocument(
    documentFile: File,
    folder: string = "assignments/documents",
    onProgress?: (progress: number) => void
): Promise<UploadResult> {
    return uploadFile(documentFile, "document", folder, onProgress);
}

/**
 * Convert a base64 data URL to a File object
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "audio/wav";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

/**
 * Convert a Blob URL to a File object
 */
export async function blobURLtoFile(blobUrl: string, filename: string): Promise<File> {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
}

/**
 * Get file extension from mime type
 */
export function getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
        "audio/webm": "webm",
        "audio/wav": "wav",
        "audio/mp3": "mp3",
        "audio/mpeg": "mp3",
        "audio/mp4": "m4a",
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "application/pdf": "pdf",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"
    };

    return mimeToExt[mimeType] || "bin";
}
