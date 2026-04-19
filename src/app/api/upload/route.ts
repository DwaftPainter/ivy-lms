import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import {
    uploadAudioToCloudinary,
    uploadImageToCloudinary,
    uploadDocumentToCloudinary
} from "@/lib/cloudinary";

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload file to Cloudinary
 *     description: Uploads audio, image, or document files to Cloudinary
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               type:
 *                 type: string
 *                 enum: [audio, image, document]
 *                 description: Type of file being uploaded
 *               folder:
 *                 type: string
 *                 description: Optional folder path within ivy-lms bucket
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     publicId:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Upload failed
 */

// Helper to parse multipart form data
async function parseFormData(request: NextRequest): Promise<{
    file: { buffer: Buffer; type: string; name: string } | null;
    type: string;
    folder?: string;
}> {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
        throw new Error("Content-Type must be multipart/form-data");
    }

    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "document";
    const folder = (formData.get("folder") as string) || undefined;

    if (!file) {
        return { file: null, type, folder };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return {
        file: {
            buffer,
            type: file.type,
            name: file.name
        },
        type,
        folder
    };
}

export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const token = req.cookies.get("token");
        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        jwt.verify(token.value, process.env.JWT_SECRET_KEY!);

        // Parse the multipart form data
        const { file, type, folder } = await parseFormData(req);

        if (!file) {
            return NextResponse.json(
                { success: false, message: "No file provided" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        let result;

        // Upload based on file type
        switch (type) {
            case "audio":
                result = await uploadAudioToCloudinary(
                    file.buffer,
                    folder || "student-audio"
                );
                break;

            case "image":
                result = await uploadImageToCloudinary(
                    file.buffer,
                    folder || "assignments"
                );
                break;

            case "document":
                result = await uploadDocumentToCloudinary(
                    file.buffer,
                    folder || "assignments/documents",
                    file.name
                );
                break;

            default:
                return NextResponse.json(
                    { success: false, message: "Invalid upload type. Must be audio, image, or document" },
                    { status: StatusCodes.BAD_REQUEST }
                );
        }

        return NextResponse.json(
            {
                success: true,
                message: "File uploaded successfully",
                data: {
                    url: result.url,
                    publicId: result.publicId,
                    type,
                    originalName: file.name
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Upload failed"
            },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// Set config to handle large file uploads
export const config = {
    api: {
        bodyParser: false
    }
};
