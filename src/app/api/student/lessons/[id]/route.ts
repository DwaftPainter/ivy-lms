import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { AttendanceStatus, SubmissionStatus } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/student/lessons/{id}:
 *   get:
 *     summary: Get lesson details for a student
 *     description: Returns detailed information about a class session including teacher info, materials, and assignments
 *     tags:
 *       - Student
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class session ID
 *     responses:
 *       200:
 *         description: Lesson details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Student not enrolled in this course
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Internal server error
 */

function getSessionStatus(scheduledDate: Date, startTime: string, endTime: string): string {
    const now = new Date();
    const sessionDate = new Date(scheduledDate);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const sessionStart = new Date(sessionDate);
    sessionStart.setHours(startHour, startMinute, 0, 0);

    const sessionEnd = new Date(sessionDate);
    sessionEnd.setHours(endHour, endMinute, 0, 0);

    if (now < sessionStart) {
        return "UPCOMING";
    } else if (now >= sessionStart && now <= sessionEnd) {
        return "ONGOING";
    } else {
        return "COMPLETED";
    }
}

// GET /api/student/lessons/{id} - Get lesson details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        const { id: lessonId } = await params;

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId },
            include: {
                enrollments: {
                    where: { status: { in: ["STUDYING", "DONE"] } },
                    select: { id: true, courseId: true }
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

        // Get the class session with all details
        const classSession = await prisma.classSession.findUnique({
            where: {
                id: lessonId,
                isPublished: true
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        skill: true,
                        teacher: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        avatarUrl: true
                                    }
                                }
                            }
                        }
                    }
                },
                materials: {
                    orderBy: {
                        createdAt: "asc"
                    }
                },
                assignments: {
                    include: {
                        submissions: {
                            where: {
                                studentId: studentProfile.id
                            },
                            select: {
                                id: true,
                                status: true,
                                submittedAt: true
                            }
                        }
                    },
                    orderBy: {
                        dueDate: "asc"
                    }
                },
                attendances: {
                    where: {
                        enrollmentId: { in: studentProfile.enrollments.map((e) => e.id) }
                    },
                    select: {
                        id: true,
                        status: true
                    }
                }
            }
        });

        if (!classSession) {
            return NextResponse.json(
                { success: false, message: "Lesson not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Check if student is enrolled in this course
        if (!enrolledCourseIds.includes(classSession.courseId)) {
            return NextResponse.json(
                { success: false, message: "You are not enrolled in this course" },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        // Calculate session status
        const sessionStatus = getSessionStatus(
            classSession.scheduledDate,
            classSession.startTime,
            classSession.endTime
        );

        // Format the response
        const sessionDate = new Date(classSession.scheduledDate);
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const formattedDate = `${dayNames[sessionDate.getDay()]}, ${monthNames[sessionDate.getMonth()]} ${sessionDate.getDate()}, ${sessionDate.getFullYear()}`;

        const attendance = classSession.attendances[0];

        // Format assignments with status
        const formattedAssignments = classSession.assignments.map((assignment) => {
            const submission = assignment.submissions[0];
            let status: string;

            if (!submission) {
                status = "NOT_STARTED";
            } else if (submission.status === SubmissionStatus.SUBMITTED) {
                status = "SUBMITTED";
            } else if (submission.status === SubmissionStatus.GRADED) {
                status = "GRADED";
            } else if (submission.status === SubmissionStatus.RETURNED) {
                status = "RETURNED";
            } else {
                status = "PENDING";
            }

            return {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description,
                type: assignment.type,
                skill: assignment.skill,
                dueDate: assignment.dueDate?.toISOString() || null,
                maxScore: assignment.maxScore,
                status,
                hasSubmission: !!submission
            };
        });

        const lessonDetail = {
            id: classSession.id,
            title: classSession.title,
            description: classSession.description,
            skill: classSession.course.skill,
            sessionType: classSession.sessionType,
            date: formattedDate,
            rawDate: classSession.scheduledDate.toISOString(),
            time: `${classSession.startTime} - ${classSession.endTime}`,
            duration: classSession.durationMins,
            status: sessionStatus,
            meetingUrl: classSession.meetingUrl,
            course: {
                id: classSession.course.id,
                title: classSession.course.title
            },
            teacher: {
                id: classSession.course.teacher.user.id,
                firstName: classSession.course.teacher.user.firstName,
                lastName: classSession.course.teacher.user.lastName,
                avatarUrl: classSession.course.teacher.user.avatarUrl
            },
            materials: classSession.materials.map((material) => ({
                id: material.id,
                name: material.name,
                fileUrl: material.fileUrl,
                fileType: material.fileType
            })),
            assignments: formattedAssignments,
            attendance: {
                id: attendance?.id,
                status: attendance?.status || AttendanceStatus.SCHEDULED
            }
        };

        return NextResponse.json(
            {
                success: true,
                data: lessonDetail
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get lesson detail error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
