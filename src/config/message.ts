type MessageFn<T = any> = (params?: T) => string;

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
        wrongPasswordRemaining: ((params?: { remaining?: number }) => {
            const remaining = params?.remaining ?? 0;

            return `Wrong password. You have ${remaining} attempt(s) left.`;
        }) as MessageFn<{ remaining?: number }>,
        useGoogleLogin: "Please login with Google",
        emailLinkedGoogle: "This email is already linked to Google. Please log in with Google!",
        loginSuccess: "Login successfully",
        tooManyAttempt:
            "You have entered the wrong password 5 times. Your account is temporarily locked. Please try again later."
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
        createSuccess: "Teacher created successfully"
    }
};
