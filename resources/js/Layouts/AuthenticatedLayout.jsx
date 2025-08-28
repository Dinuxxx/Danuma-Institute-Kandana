import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import Header from "@/Components/Header";
import Sidebar from "@/Components/Sidebar";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function AuthenticatedLayout({ children, title }) {
    const { props } = usePage();
    const user = props.auth.user;
    // Fix: Get user role properly from the UserRegistration relationship
    const getUserRole = () => {
        try {
            // The HandleInertiaRequests middleware already provides the role as a direct property
            if (user?.role) {
                console.log("Found role in user object:", user.role);
                return user.role.toLowerCase();
            }

            // Fallback: try to get role from the direct relationship
            if (user?.role?.role_name) {
                console.log(
                    "Found role in direct relationship:",
                    user.role.role_name
                );
                return user.role.role_name.toLowerCase();
            }

            // Fallback: try to get from registration relationship
            if (user?.registration?.role?.role_name) {
                console.log(
                    "Found role in registration relationship:",
                    user.registration.role.role_name
                );
                return user.registration.role.role_name.toLowerCase();
            }

            console.log("No role found, user object:", user);
            return "guest";
        } catch (error) {
            console.error("Error getting user role:", error);
            return "guest";
        }
    };
    const userRole = getUserRole();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Check if device is mobile/tablet
    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = window.innerWidth < 1024;
            setIsMobile(isMobileDevice);

            // On mobile/tablet, sidebar should be closed by default
            // On desktop, maintain the current state (default open)
            if (isMobileDevice) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Check on initial load
        checkMobile();

        // Add resize event listener
        window.addEventListener("resize", checkMobile);

        // Cleanup
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Helper function to check if the current path matches the user's role or is exempt
    const isValidPath = () => {
        const currentPath = window.location.pathname;
        const rolePrefix = `/${userRole}`;

        // List of paths exempt from role-based path checking
        const exemptPaths = ["/profile", "/test-profile", "/settings"];

        if (userRole === "guest") {
            return false;
        }

        // Return true if path starts with role prefix OR is in the exempt paths list
        return (
            currentPath.startsWith(rolePrefix) ||
            exemptPaths.some((path) => currentPath.startsWith(path))
        );
    };

    // Redirect if user is accessing a path not meant for their role
    useEffect(() => {
        if (!isValidPath() && userRole !== "guest") {
            const dashboardPath = `/${userRole}/dashboard`;
            window.location.href = dashboardPath;
        }
    }, [userRole]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Header */}
            <Header
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            {/* Sidebar - Hidden on mobile, positioned differently on desktop */}
            <div
                className={`${
                    isMobile
                        ? ""
                        : "fixed top-16 md:top-20 left-0 transition-all duration-300"
                }`}
            >
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    role={userRole}
                />
            </div>

            {/* Main Content Area */}
            <div
                className={`transition-all duration-300 flex-1 ${
                    // On mobile, no margin adjustments needed (sidebar is overlay)
                    // On desktop, maintain original margin logic
                    isMobile
                        ? "mt-20 md:mt-24"
                        : isSidebarOpen
                        ? "ml-64 mt-20 md:mt-24"
                        : "ml-20 mt-20 md:mt-24"
                } p-6`}
            >
                {/* Display Flash Messages */}
                {props.flash?.message && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                        {props.flash.message}
                    </div>
                )}

                {props.flash?.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {props.flash.error}
                    </div>
                )}

                {props.flash?.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {props.flash.success}
                    </div>
                )}

                {/* Main Content */}
                <div className="transition-all duration-300">{children}</div>
            </div>
        </div>
    );
}
