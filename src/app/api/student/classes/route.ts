import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { AttendanceStatus } from "@/generated/prisma/enums";

// GET /api/student/classes - Get upcoming class sessions for the logged-in student
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

        // Get student profile with enrollments
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

        const enrollmentIds = studentProfile.enrollments.map((e) => e.id);
        const enrolledCourseIds = studentProfile.enrollments.map((e) => e.courseId);

        if (enrolledCourseIds.length === 0) {
            return NextResponse.json({ success: true, data: [] }, { status: StatusCodes.OK });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get upcoming class sessions from enrolled courses
        const upcomingClassSessions = await prisma.classSession.findMany({
            where: {
                courseId: { in: enrolledCourseIds },
                isPublished: true,
                scheduledDate: {
                    gte: today
                }
            },
            include: {
                course: {
                    select: {
                        title: true,
                        skill: true,
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
                assignments: {
                    include: {
                        submissions: {
                            where: {
                                studentId: studentProfile.id
                            },
                            select: {
                                status: true
                            }
                        }
                    }
                },
                attendances: {
                    where: {
                        enrollmentId: { in: enrollmentIds }
                    },
                    select: {
                        id: true,
                        status: true
                    }
                }
            },
            orderBy: {
                scheduledDate: "asc"
            },
            take: 10
        });

        // Format the response with actual schedule data
        const formattedClasses = upcomingClassSessions.map((session) => {
            const sessionDate = new Date(session.scheduledDate);
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const month = sessionDate.getMonth() + 1;
            const date = sessionDate.getDate();
            const day = dayNames[sessionDate.getDay()];

            const attendance = session.attendances[0];

            const totalAssignments = session.assignments.length;

            let completedAssignments = 0;
            for (const a of session.assignments) {
                if (a.submissions.length > 0) {
                    completedAssignments++;
                }
            }

            const assignmentStatus =
                totalAssignments === 0
                    ? null
                    : completedAssignments === totalAssignments
                      ? `${completedAssignments}/${totalAssignments} completed`
                      : `${completedAssignments}/${totalAssignments} pending`;

            return {
                id: session.id,
                title: session.title,
                course: session.course.title,
                skill: session.course.skill,
                date: `${month}/${date}`,
                day: day,
                fullDate: sessionDate.toISOString(),
                time: `${session.startTime} - ${session.endTime}`,
                duration: session.durationMins,
                instructor: `${session.course.teacher.user.firstName} ${session.course.teacher.user.lastName}`,
                description: session.description,
                meetingUrl: session.meetingUrl,
                sessionType: session.sessionType,

                attendanceStatus: attendance?.status || AttendanceStatus.SCHEDULED,
                attendanceId: attendance?.id,

                assignmentStatus
            };
        });

        return NextResponse.json(
            {
                success: true,
                data: formattedClasses
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get student classes error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
