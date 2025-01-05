import { useState } from 'react';
import Header from '@/Components/Comp/Header';
import DashboardWidgets from '@/Components/Admin Components/DashboardWidgets';
import DatePicker from '@/Components/Admin Components/DatePicker';
import Sidebar from '@/Components/Sidebar';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const widgetData = [
        { title: "Teachers", value: 8 },
        { title: "Students", value: 120 },
        { title: "Fees", value: "$9,000" },
        { title: "Courses", value: 12 },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Header />
            <div className="fixed top-16 md:top-20 left-0 transition-all duration-300">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>

            {/* Main Content Area */}
            <div
                className={`transition-all duration-300 ${
                    isSidebarOpen ? 'ml-64' : 'ml-20'
                } flex-1 mt-20 md:mt-24`}
            >
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-orange-500 md:mb-16 mb-8">
                        Welcome Back
                    </h1>

                    <DashboardWidgets data={widgetData} />
                    <div className="md:mt-20">
                        <DatePicker />
                    </div>
                </div>

                {/* Main Content */}
                <div className="transition-all duration-300 mt-16 p-4">{children}</div>
            </div>
        </div>
    );
}
