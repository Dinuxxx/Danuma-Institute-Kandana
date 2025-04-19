import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Header from '@/Components/Header';
import Sidebar from '@/Components/Sidebar';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function AuthenticatedLayout({ children, title }) {
    const { props } = usePage();
    const user = props.auth.user;
    const userRole = user?.role || 'guest'; // Using the role we added in HandleInertiaRequests
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Helper function to check if the current path matches the user's role
    const isValidPath = () => {
        const currentPath = window.location.pathname;
        const rolePrefix = `/${userRole}`;
        
        if (userRole === 'guest') {
            return false;
        }
        
        return currentPath.startsWith(rolePrefix);
    };
    
    // Redirect if user is accessing a path not meant for their role
    useEffect(() => {
        if (!isValidPath() && userRole !== 'guest') {
            const dashboardPath = `/${userRole}/dashboard`;
            window.location.href = dashboardPath;
        }
    }, [userRole]);
    
    return (
        <div className="min-h-screen bg-white flex">
            <Header />
            <div className="fixed top-16 md:top-20 left-0 transition-all duration-300">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                    role={userRole} 
                />
            </div>

            {/* Main Content Area */}
            <div
                className={`transition-all duration-300 ${
                    isSidebarOpen ? 'ml-64' : 'ml-20'
                } flex-1 mt-20 md:mt-24 p-6`}
            >
                {/* Display Flash Messages */}
                {props.flash.message && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                        {props.flash.message}
                    </div>
                )}
                
                {props.flash.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {props.flash.error}
                    </div>
                )}
                
                {props.flash.success && (
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