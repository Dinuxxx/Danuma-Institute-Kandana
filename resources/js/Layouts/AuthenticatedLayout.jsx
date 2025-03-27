import { useState } from 'react';
import Header from '@/Components/Header';
import Sidebar from '@/Components/Sidebar';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    const { props } = usePage();
    const user = props.auth.user;
    const userRole = user?.role || 'admin'; // Default to 'admin' if role is undefined
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-white flex">
            <Header />
            <div className="fixed top-16 md:top-20 left-0 transition-all duration-300">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                    role={userRole} // Pass role to Sidebar
                />
            </div>

            {/* Main Content Area */}
            <div
                className={`transition-all duration-300 ${
                    isSidebarOpen ? 'ml-64' : 'ml-20'
                } flex-1 mt-20 md:mt-24`}
            >
                {/* Main Content */}
                <div className="transition-all duration-300">{children}</div>
            </div>
        </div>
    );
}
