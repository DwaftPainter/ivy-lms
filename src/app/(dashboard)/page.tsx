import UpcomingAssignments from "@/components/dashboard/upcoming-assignments";
import UpcomingClasses from "@/components/dashboard/upcoming-classes";
import { useAuthStore } from "@/store/auth.store";

const Dashboard = () => {
    const { user } = useAuthStore();

    return (
        <div className="p-8 w-full">
            {/* Greeting */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-text-primary">
                    Welcome, {user?.firstName + " " + user?.lastName}
                </h2>
            </div>

            {/* Content Grid */}
            <div className="space-y-6 w-full">
                <UpcomingClasses />
                <UpcomingAssignments />
            </div>
        </div>
    );
};

export default Dashboard;
