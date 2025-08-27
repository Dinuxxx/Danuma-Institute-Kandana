import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Area,
    ComposedChart,
} from "recharts";
import {
    Calendar,
    BookOpen,
    Award,
    Bell,
    Clock,
    FileText,
    CheckCircle,
    TrendingUp,
    DollarSign,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DatePicker from "@/Components/Admin Components/DatePicker";
import axios from "axios";

const Dashboard = ({ auth }) => {
    // State for dashboard data
    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({
        value: "0%",
        growth: 0,
    });
    const [gradeStats, setGradeStats] = useState({ value: "0%", growth: 0 });
    const [dueAmountStats, setDueAmountStats] = useState({
        value: "Rs. 0",
        growth: 0,
    });
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [performanceLoading, setPerformanceLoading] = useState(true);

    // Sample data for parts that don't need backend integration yet
    const upcomingAssignments = [
        {
            id: 1,
            title: "Math Problem Set",
            dueDate: "2025-05-20",
            subject: "Mathematics",
            status: "Pending",
        },
        {
            id: 2,
            title: "English Essay",
            dueDate: "2025-05-18",
            subject: "Literature",
            status: "In Progress",
        },
        {
            id: 3,
            title: "Science Lab Report",
            dueDate: "2025-05-25",
            subject: "Biology",
            status: "Not Started",
        },
    ];

    const announcements = [
        {
            id: 1,
            title: "End of Semester Exam Schedule",
            date: "2025-05-13",
            read: false,
        },
        {
            id: 2,
            title: "Summer Break Dates Announced",
            date: "2025-05-10",
            read: true,
        },
        {
            id: 3,
            title: "Career Counseling Workshop",
            date: "2025-05-08",
            read: false,
        },
    ];

    const [readAnnouncements, setReadAnnouncements] = useState(
        announcements.map((a) => a.read)
    );

    const markAsRead = (index) => {
        const newReadStatus = [...readAnnouncements];
        newReadStatus[index] = true;
        setReadAnnouncements(newReadStatus);
    };

    // Fetch data from the backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch monthly attendance data
                const attendanceResponse = await axios.get(
                    "/student/dashboard/monthly-attendance"
                );
                setAttendanceData(attendanceResponse.data);

                // Fetch attendance stats
                const attendanceStatsResponse = await axios.get(
                    "/student/dashboard/attendance-stats"
                );
                setAttendanceStats(attendanceStatsResponse.data);

                // Fetch grade stats
                const gradeStatsResponse = await axios.get(
                    "/student/dashboard/grade-stats"
                );
                setGradeStats(gradeStatsResponse.data);

                // Fetch due amount stats
                const dueAmountStatsResponse = await axios.get(
                    "/student/dashboard/due-amount-stats"
                );
                setDueAmountStats(dueAmountStatsResponse.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                // Use fallback data if API calls fail
                setAttendanceData([
                    { month: "Jan", attendance: 95 },
                    { month: "Feb", attendance: 98 },
                    { month: "Mar", attendance: 92 },
                    { month: "Apr", attendance: 96 },
                    { month: "May", attendance: 94 },
                ]);
                setAttendanceStats({ value: "95%", growth: 2.3 });
                setGradeStats({ value: "87%", growth: 5.2 });
                setDueAmountStats({ value: "Rs. 5,000", growth: -15.0 });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Fetch student performance data
    useEffect(() => {
        const fetchPerformanceData = async () => {
            setPerformanceLoading(true);
            try {
                const response = await axios.get(
                    "/student/dashboard/student-performance"
                );
                setPerformanceData(response.data);
            } catch (error) {
                console.error("Error fetching performance data:", error);
                // Use fallback data if API call fails
                setPerformanceData([
                    { subject: "Math", grade: 0 },
                    { subject: "Science", grade: 0 },
                    { subject: "English", grade: 0 },
                ]);
            } finally {
                setPerformanceLoading(false);
            }
        };

        fetchPerformanceData();
    }, []);

    // Stats with growth indicators
    const stats = [
        {
            title: "Average Grade",
            value: gradeStats.value,
            icon: Award,
            growth: gradeStats.growth,
            color: "blue",
        },
        {
            title: "Attendance",
            value: attendanceStats.value,
            icon: Calendar,
            growth: attendanceStats.growth,
            color: "green",
        },
        {
            title: "Due Amount",
            value: dueAmountStats.value,
            icon: DollarSign,
            growth: dueAmountStats.growth,
            color: "red",
        },
    ];

    // Colors for charts
    const COLORS = [
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#8884d8",
        "#82ca9d",
        "#ffc658",
    ];

    // Custom tooltip for performance chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{`Subject: ${label}`}</p>
                    <p className="text-blue-600">
                        {`Grade: ${payload[0].value}${
                            payload[0].value > 0 ? "%" : " (No exams yet)"
                        }`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <AuthenticatedLayout>
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-orange-500">
                                    Welcome Back,{" "}
                                    {auth?.user?.name || "Student"}
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Here's your academic progress overview
                                </p>
                            </div>
                            <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg px-4 py-2 text-white shadow-lg">
                                <div className="flex space-x-2 items-center">
                                    <Calendar className="h-5 w-5" />
                                    <span>
                                        {new Date().toLocaleDateString(
                                            "en-US",
                                            {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                2025
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                Grade 11
                            </span>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-md p-6 flex items-center transition-all duration-300 hover:shadow-lg"
                                >
                                    <div
                                        className={`bg-${stat.color}-100 p-3 rounded-full mr-4`}
                                    >
                                        <Icon
                                            className={`h-6 w-6 text-${stat.color}-600`}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-gray-600">
                                            {stat.title}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div
                                        className={`flex items-center ${
                                            stat.growth >= 0
                                                ? "text-green-500"
                                                : "text-red-500"
                                        }`}
                                    >
                                        <TrendingUp
                                            className={`h-4 w-4 mr-1 ${
                                                stat.growth >= 0
                                                    ? ""
                                                    : "transform rotate-180"
                                            }`}
                                        />
                                        <span className="text-sm font-medium">
                                            {stat.growth >= 0 ? "+" : ""}
                                            {stat.growth}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Attendance Chart */}
                        <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Monthly Attendance
                            </h2>
                            <div className="h-64">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <ComposedChart data={attendanceData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                opacity={0.3}
                                            />
                                            <XAxis dataKey="month" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip
                                                formatter={(value) => [
                                                    `${value}%`,
                                                    "Attendance",
                                                ]}
                                                contentStyle={{
                                                    backgroundColor:
                                                        "rgba(255, 255, 255, 0.9)",
                                                    borderRadius: "8px",
                                                    boxShadow:
                                                        "0 2px 5px rgba(0,0,0,0.1)",
                                                }}
                                            />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="attendance"
                                                fill="#3B82F6"
                                                fillOpacity={0.2}
                                                stroke="#3B82F6"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="attendance"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                                dot={{ r: 5 }}
                                                activeDot={{ r: 8 }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Student Performance Chart */}
                        <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Subject Performance
                            </h2>
                            <div className="h-64">
                                {performanceLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                                    </div>
                                ) : performanceData.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart data={performanceData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                opacity={0.3}
                                            />
                                            <XAxis
                                                dataKey="subject"
                                                tick={{ fontSize: 12 }}
                                                interval={0}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip
                                                content={<CustomTooltip />}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="grade"
                                                fill="#FF8042"
                                                radius={[4, 4, 0, 0]}
                                                name="Average Grade (%)"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center">
                                            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No performance data available</p>
                                            <p className="text-sm">
                                                Complete some exams to see your
                                                performance
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Date Picker */}
                    <div className="mb-6">
                        <DatePicker />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;
