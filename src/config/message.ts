export const MESSAGES = {
    validation: {
        format: {
            email: "Please enter a valid email address",
            phone: "Invalid phone number!",
            password:
                "Password must be at least 6 characters long and include at least one uppercase letter and one number."
        },

        required: {
            phone: "Phone is required!",
            firstName: "First name is required!",
            lastName: "Last name is required!",
            email: "Email is required!",
            password: "Password is required!"
        }
    },

    auth: {
        getInfoSuccess: "Get user info successfully",
        registerSuccess: "Register successfully",
        emailAlreadyExists: "Email already exists",
        emailNotFound: "Email not found",
        wrongPasswordRemaining: (params?: { remaining?: number }) => {
            const remaining = params?.remaining ?? 0;

            return `Wrong password. You have ${remaining} attempt(s) left.`;
        },
        useGoogleLogin: "Please login with Google",
        emailLinkedGoogle: "This email is already linked to Google. Please log in with Google!",
        loginSuccess: "Login successfully",
        tooManyAttempt:
            "You have entered the wrong password 5 times. Your account is temporarily locked. Please try again later."
    },

    user: {
        userNotFound: "User not found"
    },

    common: {
        serverError: "Internal server error"
    },

    course: {
        createSuccess: "Course created successfully",
        updateSuccess: "Course updated successfully",
        deleteSuccess: "Course deleted successfully",
        notFound: "Course not found",
        invalidSkill: "Invalid skill value",
        invalidLevel: "Invalid level value",
        missingRequired: "Missing required fields"
    },

    teacher: {
        createSuccess: "Teacher created successfully",
        dashboardSuccess: "Teacher dashboard data retrieved successfully",
        notFound: "Teacher not found",
        accessDenied: "Access denied. Teachers only.",
        gradingSuccess: "Assignment graded successfully",
        commentAdded: "Comment added successfully",
        classSessionCreated: "Class session created successfully",
        classSessionUpdated: "Class session updated successfully",
        classSessionDeleted: "Class session deleted successfully",
        attendanceUpdated: "Attendance updated successfully",
        submissionNotFound: "Submission not found or access denied",
        assignmentNotFound: "Assignment not found or access denied"
    },

    enrollment: {
        createSuccess: "Enrolled successfully",
        alreadyEnrolled: "You are already enrolled in this course",
        notFound: "Enrollment not found",
        courseNotFound: "Course not found",
        missingCourseId: "Course ID is required",
        invalidStatus: "Invalid enrollment status. Must be STUDYING, DONE, or UPCOMING"
    },

    assignment: {
        submitSuccess: "Assignment submitted successfully",
        notFound: "Assignment not found",
        alreadySubmitted: "Assignment already submitted",
        missingContent: "Submission content is required",
        notEnrolled: "Not enrolled in this course",
        submissionError: "Failed to submit assignment"
    },

    notification: {
        fetchSuccess: "Notifications fetched successfully",
        markAsReadSuccess: "Notification marked as read",
        markAllAsReadSuccess: "All notifications marked as read",
        notFound: "Notification not found",
        unauthorized: "Unauthorized to access this notification"
    }
};
