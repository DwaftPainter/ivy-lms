import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import {
  uploadAudioToCloudinary,
  uploadImageToCloudinary,
  uploadDocumentToCloudinary
} from "@/lib/cloudinary";

// ✅ Required for Buffer / Cloudinary / large uploads
export const runtime = "nodejs";
export const maxDuration = 60;

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES: Record<string, string[]> = {
  image: ["image/png", "image/jpeg", "image/webp"],
  audio: ["audio/mpeg", "audio/wav"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]
};

// Parse multipart form data
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
    // ========================
    // 🔐 AUTHENTICATION
    // ========================
    const token = req.cookies.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED }
      );
    }

    try {
      jwt.verify(token.value, process.env.JWT_SECRET_KEY!);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: StatusCodes.UNAUTHORIZED }
      );
    }

    // ========================
    // 📦 PARSE FORM DATA
    // ========================
    const { file, type, folder } = await parseFormData(req);

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // ========================
    // 🛡 VALIDATION
    // ========================

    // File size check
    if (file.buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File too large (max 10MB)" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // File type check
    if (!ALLOWED_TYPES[type]?.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid file type for ${type}`
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // ========================
    // ☁️ UPLOAD TO CLOUDINARY
    // ========================
    let result;

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
          {
            success: false,
            message: "Invalid upload type (audio, image, document only)"
          },
          { status: StatusCodes.BAD_REQUEST }
        );
    }

    // ========================
    // ✅ RESPONSE
    // ========================
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
        message:
          error instanceof Error ? error.message : "Upload failed"
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}