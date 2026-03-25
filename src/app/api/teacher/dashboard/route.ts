import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { SubmissionStatus, Role } from "@/generated/prisma/enums";
import { getGreeting } from "@/lib/greeting";

/**
 * @swagger
 * /api/teacher/dashboard:
 *   get:
 *     summary: Get teacher dashboard data
 *     description: Returns dashboard overview for the logged-in teacher including greeting, upcoming classes, and pending grading assignments.
 *     tags:
 *       - Teacher
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     greeting:
 *                       type: string
 *                       example: "Good morning, John Smith"
 *                     upcomingClasses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           startTime:
 *                             type: string
 *                           endTime:
 *                             type: string
 *                           courseName:
 *                             type: string
 *                           classType:
 *                             type: string
 *                             enum: [LISTENING, READING, WRITING, SPEAKING]
 *                           enrolledStudents:
 *                             type: integer
 *                     pendingGrading:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           assignmentId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           courseName:
 *                             type: string
 *                           courseId:
 *                             type: string
 *                           pendingCount:
 *                             type: integer
 *                           deadline:
 *                             type: string
 *                             format: date-time
 *                           skill:
 *                             type: string
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden - User is not a teacher
 *       500:
 *         description: Internal server error
 */

// GET /api/teacher/dashboard - Get teacher dashboard data
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as any;
        const userId = payload.userId;

        // Get user with teacher profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacherProfile: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Verify user is a teacher
        if (user.role !== Role.TEACHER) {
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

        // Generate greeting with teacher's full name
        const greeting = `${getGreeting()}, ${user.firstName} ${user.lastName}`;

        // Get today's date for filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get upcoming class sessions (scheduled in the future)
        const upcomingClassSessions = await prisma.classSession.findMany({
            where: {
                teacherId: teacherProfileId,
                scheduledDate: {
                    gte: today
                },
                isPublished: true
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        skill: true
                    }
                },
                _count: {
                    select: {
                        attendances: true
                    }
                }
            },
            orderBy: {
                scheduledDate: "asc"
            },
            take: 10
        });

        // Format upcoming classes according to acceptance criteria
        const formattedUpcomingClasses = upcomingClassSessions.map((session) => {
            return {
                id: session.id,
                date: session.scheduledDate.toISOString(),
                startTime: session.startTime,
                endTime: session.endTime,
                courseName: session.course.title,
                classType: session.skill,
                enrolledStudents: session._count.attendances
            };
        });

        // Get pending grading assignments with detailed submission info
        const pendingGrading = await prisma.assignment.findMany({
            where: {
                course: {
                    teacherId: teacherProfileId
                },
                isPublished: true,
                submissions: {
                    some: {
                        status: {
                            in: [SubmissionStatus.SUBMITTED]
                        }
                    }
                }
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                submissions: {
                    where: {
                        status: SubmissionStatus.SUBMITTED
                    },
                    select: {
                        id: true,
                        submittedAt: true
                    }
                },
                _count: {
                    select: {
                        submissions: {
                            where: {
                                status: SubmissionStatus.SUBMITTED
                            }
                        }
                    }
                }
            },
            orderBy: [
                {
                    dueDate: "asc"
                },
                {
                    createdAt: "desc"
                }
            ]
        });

        // Format pending grading according to acceptance criteria
        const formattedPendingGrading = pendingGrading.map((assignment) => ({
            assignmentId: assignment.id,
            title: assignment.title,
            courseName: assignment.course.title,
            courseId: assignment.course.id,
            pendingCount: assignment._count.submissions,
            deadline: assignment.dueDate?.toISOString() || null,
            skill: assignment.skill
        }));

        // Get summary stats
        const [totalCourses, totalStudents, totalSubmissionsToGrade] = await Promise.all([
            // Total courses taught by teacher
            prisma.course.count({
                where: {
                    teacherId: teacherProfileId,
                    isPublished: true
                }
            }),
            // Total enrolled students across all teacher's courses
            prisma.enrollment.count({
                where: {
                    course: {
                        teacherId: teacherProfileId
                    },
                    status: {
                        in: ["STUDYING", "DONE"]
                    }
                }
            }),
            // Total submissions awaiting grading
            prisma.assignmentSubmission.count({
                where: {
                    assignment: {
                        course: {
                            teacherId: teacherProfileId
                        }
                    },
                    status: SubmissionStatus.SUBMITTED
                }
            })
        ]);

        return NextResponse.json(
            {
                success: true,
                data: {
                    greeting,
                    teacher: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        avatarUrl: user.avatarUrl
                    },
                    upcomingClasses: formattedUpcomingClasses,
                    pendingGrading: formattedPendingGrading,
                    summary: {
                        totalCourses,
                        totalStudents,
                        totalSubmissionsToGrade,
                        upcomingClassesCount: formattedUpcomingClasses.length
                    }
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get teacher dashboard error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
