import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DatePicker from '@/Components/Admin Components/DatePicker';
import DashboardWidgets from '@/Components/Admin Components/DashboardWidgets';

export default function Dashboard() {

    const widgetData = [
        { title: "Teachers", value: 8 },
        { title: "Students", value: 120 },
        { title: "Fees", value: "$9,000" },
        { title: "Courses", value: 12 },
    ];

    return (
        <AuthenticatedLayout
        >
            <Head title="Dashboard" />
            <div className="p-6">
                <h1 className="text-3xl font-bold text-orange-500 md:mb-16 mb-8">
                    Welcome Back
                </h1>

                <DashboardWidgets data={widgetData} />
                <div className="md:mt-20 mt-16">
                    <DatePicker />
                </div>
            </div>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            You're logged in!
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
