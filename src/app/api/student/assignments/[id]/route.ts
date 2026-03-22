import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { SubmissionStatus } from "@/generated/prisma/enums";

// GET /api/student/assignments/[id] - Get assignment details
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as any;
        const userId = payload.userId;

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId },
            include: {
                enrollments: {
                    select: { courseId: true, status: true }
                }
            }
        });

        if (!studentProfile) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        const enrolledCourseIds = studentProfile.enrollments.map((e) => e.courseId);

        // Get assignment details
        const assignment = await prisma.assignment.findUnique({
            where: { id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                        teacher: {
                            select: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                },
                submissions: {
                    where: { studentId: studentProfile.id },
                    include: {
                        criteriaScores: {
                            include: {
                                criterion: true
                            }
                        },
                        comments: {
                            include: {
                                author: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        role: true
                                    }
                                }
                            },
                            orderBy: { createdAt: "asc" }
                        }
                    }
                },
                rubric: {
                    include: {
                        criteria: {
                            orderBy: { id: "asc" }
                        }
                    }
                }
            }
        });

        if (!assignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Check if student is enrolled in this course
        if (!enrolledCourseIds.includes(assignment.courseId)) {
            return NextResponse.json(
                { success: false, message: "Not enrolled in this course" },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        const submission = assignment.submissions[0];
        const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && !submission;

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: assignment.id,
                    title: assignment.title,
                    description: assignment.description,
                    type: assignment.type,
                    skill: assignment.skill,
                    dueDate: assignment.dueDate,
                    maxScore: assignment.maxScore,
                    instructions: assignment.instructions,
                    attachmentUrl: assignment.attachmentUrl,
                    isPublished: assignment.isPublished,
                    createdAt: assignment.createdAt,
                    course: assignment.course,
                    isOverdue,
                    rubric: assignment.rubric,
                    submission: submission ? {
                        id: submission.id,
                        status: submission.status,
                        content: submission.content,
                        fileUrl: submission.fileUrl,
                        audioUrl: submission.audioUrl,
                        score: submission.score,
                        bandScore: submission.bandScore,
                        feedback: submission.feedback,
                        submittedAt: submission.submittedAt,
                        gradedAt: submission.gradedAt,
                        criteriaScores: submission.criteriaScores,
                        comments: submission.comments
                    } : null
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get assignment details error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// POST /api/student/assignments/[id] - Submit an assignment
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: assignmentId } = await params;
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as any;
        const userId = payload.userId;

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId },
            include: {
                enrollments: {
                    select: { courseId: true, status: true }
                }
            }
        });

        if (!studentProfile) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Get assignment details
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { course: true }
        });

        if (!assignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Check if student is enrolled
        const enrollment = studentProfile.enrollments.find(e => e.courseId === assignment.courseId);
        if (!enrollment) {
            return NextResponse.json(
                { success: false, message: "Not enrolled in this course" },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        // Parse submission data
        const body = await req.json();
        const { content, fileUrl, audioUrl } = body;

        if (!content && !fileUrl && !audioUrl) {
            return NextResponse.json(
                { success: false, message: "Submission content is required" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Check if already submitted
        const existingSubmission = await prisma.assignmentSubmission.findFirst({
            where: {
                assignmentId,
                studentId: studentProfile.id
            }
        });

        let submission;
        const now = new Date();

        if (existingSubmission) {
            // Update existing submission
            submission = await prisma.assignmentSubmission.update({
                where: { id: existingSubmission.id },
                data: {
                    content,
                    fileUrl,
                    audioUrl,
                    status: SubmissionStatus.SUBMITTED,
                    submittedAt: now
                }
            });
        } else {
            // Create new submission
            submission = await prisma.assignmentSubmission.create({
                data: {
                    assignmentId,
                    studentId: studentProfile.id,
                    content,
                    fileUrl,
                    audioUrl,
                    status: SubmissionStatus.SUBMITTED,
                    submittedAt: now
                }
            });
        }

        // Update enrollment status to STUDYING if it was UPCOMING
        if (enrollment.status === "UPCOMING") {
            await prisma.enrollment.update({
                where: {
                    studentId_courseId: {
                        studentId: studentProfile.id,
                        courseId: assignment.courseId
                    }
                },
                data: { status: "STUDYING" }
            });
        }

        // Calculate progress for this course
        const [totalAssignments, completedAssignments] = await Promise.all([
            prisma.assignment.count({
                where: { courseId: assignment.courseId, isPublished: true }
            }),
            prisma.assignmentSubmission.count({
                where: {
                    studentId: studentProfile.id,
                    assignment: { courseId: assignment.courseId },
                    status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED, SubmissionStatus.RETURNED] }
                }
            })
        ]);

        const progressPercentage = totalAssignments > 0
            ? Math.round((completedAssignments / totalAssignments) * 100)
            : 0;

        // If all assignments completed, mark enrollment as DONE
        if (progressPercentage === 100 && enrollment.status !== "DONE") {
            await prisma.enrollment.update({
                where: {
                    studentId_courseId: {
                        studentId: studentProfile.id,
                        courseId: assignment.courseId
                    }
                },
                data: {
                    status: "DONE",
                    completedAt: now
                }
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: "Assignment submitted successfully",
                data: {
                    submission: {
                        id: submission.id,
                        status: submission.status,
                        submittedAt: submission.submittedAt,
                        content: submission.content,
                        fileUrl: submission.fileUrl,
                        audioUrl: submission.audioUrl
                    },
                    progress: {
                        completed: completedAssignments,
                        total: totalAssignments,
                        percentage: progressPercentage
                    }
                }
            },
            { status: StatusCodes.CREATED }
        );
    } catch (error) {
        console.error("Submit assignment error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
