import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { Role } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/class-sessions/{id}/materials/{materialId}:
 *   patch:
 *     summary: Update a material
 *     description: Updates an existing material for a class session
 *     tags:
 *       - Teacher
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class Session ID
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Material updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Material not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a material
 *     description: Deletes a material from a class session
 *     tags:
 *       - Teacher
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class Session ID
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Material not found
 *       500:
 *         description: Internal server error
 */

// PATCH /api/teacher/class-sessions/[id]/materials/[materialId] - Update a material
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; materialId: string }> }
) {
    try {
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as { userId: string };
        const userId = payload.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { teacherProfile: true }
        });

        if (!user || user.role !== Role.TEACHER) {
            return NextResponse.json(
                { success: false, message: "Access denied. Teachers only." },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        const teacherProfileId = user.teacherProfile?.id;
        if (!teacherProfileId) {
            return NextResponse.json(
                { success: false, message: "Teacher profile not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        const { id: sessionId, materialId } = await params;
        const body = await req.json();

        // Verify the material belongs to this teacher's session
        const material = await prisma.sessionMaterial.findFirst({
            where: {
                id: materialId,
                sessionId,
                classSession: {
                    teacherId: teacherProfileId
                }
            }
        });

        if (!material) {
            return NextResponse.json(
                { success: false, message: "Material not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Update the material
        const updatedMaterial = await prisma.sessionMaterial.update({
            where: { id: materialId },
            data: {
                ...(body.name !== undefined && { name: body.name }),
                ...(body.fileUrl !== undefined && { fileUrl: body.fileUrl }),
                ...(body.fileType !== undefined && { fileType: body.fileType })
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Material updated successfully",
                data: {
                    material: {
                        id: updatedMaterial.id,
                        name: updatedMaterial.name,
                        fileUrl: updatedMaterial.fileUrl,
                        fileType: updatedMaterial.fileType,
                        createdAt: updatedMaterial.createdAt.toISOString()
                    }
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Update material error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// DELETE /api/teacher/class-sessions/[id]/materials/[materialId] - Delete a material
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; materialId: string }> }
) {
    try {
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as { userId: string };
        const userId = payload.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { teacherProfile: true }
        });

        if (!user || user.role !== Role.TEACHER) {
            return NextResponse.json(
                { success: false, message: "Access denied. Teachers only." },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        const teacherProfileId = user.teacherProfile?.id;
        if (!teacherProfileId) {
            return NextResponse.json(
                { success: false, message: "Teacher profile not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        const { id: sessionId, materialId } = await params;

        // Verify the material belongs to this teacher's session
        const material = await prisma.sessionMaterial.findFirst({
            where: {
                id: materialId,
                sessionId,
                classSession: {
                    teacherId: teacherProfileId
                }
            }
        });

        if (!material) {
            return NextResponse.json(
                { success: false, message: "Material not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Delete the material
        await prisma.sessionMaterial.delete({
            where: { id: materialId }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Material deleted successfully"
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Delete material error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
