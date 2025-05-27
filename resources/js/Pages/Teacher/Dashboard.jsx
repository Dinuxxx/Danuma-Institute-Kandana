import React, { useState, useEffect } from 'react';
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
  ComposedChart
} from 'recharts';
import { 
  Users, 
  BookOpen, 
  Award, 
  Bell, 
  Clock, 
  FileText, 
  CheckCircle,
  TrendingUp,
  Calendar,
  GraduationCap
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DatePicker from '@/Components/Admin Components/DatePicker';
import { Head } from '@inertiajs/react';
import axios from 'axios';

const Dashboard = ({ auth }) => {
  // State for dashboard data
  const [totalStudents, setTotalStudents] = useState({ value: '0', growth: 0 });
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ value: '0%', growth: 0 });
  const [gradeStats, setGradeStats] = useState({ value: '0%', growth: 0 });
  const [assignmentStats, setAssignmentStats] = useState({ value: '0/0', growth: 0 });
  const [classPerformance, setClassPerformance] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Parallel fetch all dashboard data
        const [
          studentsResponse,
          attendanceStatsResponse,
          attendanceResponse,
          gradeStatsResponse,
          assignmentStatsResponse,
          classPerformanceResponse,
          scheduleResponse
        ] = await Promise.all([
          axios.get('/teacher/dashboard/total-students'),
          axios.get('/teacher/dashboard/attendance-stats'),
          axios.get('/teacher/dashboard/class-attendance'),
          axios.get('/teacher/dashboard/grade-stats'),
          axios.get('/teacher/dashboard/assignment-stats'),
          axios.get('/teacher/dashboard/class-performance'),
          axios.get('/teacher/dashboard/today-schedule')
        ]);

        // Set all the state with received data
        setTotalStudents({
          value: studentsResponse.data.value.toString(),
          growth: studentsResponse.data.growth
        });
        setAttendanceStats(attendanceStatsResponse.data);
        setAttendanceData(attendanceResponse.data);
        setGradeStats(gradeStatsResponse.data);
        setAssignmentStats(assignmentStatsResponse.data);
        setClassPerformance(classPerformanceResponse.data);
        setTodaySchedule(scheduleResponse.data);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use fallback data if API calls fail
        setAttendanceData([
          { month: 'Jan', attendance: 92 },
          { month: 'Feb', attendance: 95 },
          { month: 'Mar', attendance: 90 },
          { month: 'Apr', attendance: 93 },
          { month: 'May', attendance: 91 },
          { month: 'Jun', attendance: 88 }
        ]);
        setAttendanceStats({ value: '92%', growth: 1.5 });
        setGradeStats({ value: '83%', growth: 3.2 });
        setAssignmentStats({ value: '18/25', growth: 5.4 });
        setTotalStudents({ value: '145', growth: 4.2 });
        setClassPerformance([
          { class: 'Grade 11 - Mathematics', averageGrade: 85 },
          { class: 'Grade 10 - Science', averageGrade: 78 },
          { class: 'Grade 9 - English', averageGrade: 92 },
          { class: 'Grade 12 - Physics', averageGrade: 88 },
          { class: 'Grade 11 - Chemistry', averageGrade: 81 }
        ]);
        setTodaySchedule([
          { time: '08:00 - 09:30', class: 'Mathematics', room: 'Room 205', grade: 'Grade 11A' },
          { time: '09:45 - 11:15', class: 'Advanced Physics', room: 'Lab 103', grade: 'Grade 12A' },
          { time: '14:15 - 15:45', class: 'Mathematics', room: 'Room 202', grade: 'Grade 10B' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Sample data for assignments (this would eventually come from backend)
  const upcomingAssignments = [
    { id: 1, title: 'Math Problem Set', dueDate: '2025-05-20', class: 'Grade 11 - Mathematics', status: 'Assigned' },
    { id: 2, title: 'Physics Lab Report', dueDate: '2025-05-18', class: 'Grade 12 - Physics', status: 'Draft' },
    { id: 3, title: 'Literature Essay', dueDate: '2025-05-25', class: 'Grade 10 - English', status: 'Assigned' }
  ];

  // Stats with growth indicators
  const stats = [
    { 
      title: 'Total Students', 
      value: totalStudents.value, 
      icon: Users, 
      growth: totalStudents.growth, 
      color: 'blue' 
    },
    { 
      title: 'Class Attendance', 
      value: attendanceStats.value, 
      icon: Calendar, 
      growth: attendanceStats.growth, 
      color: 'green' 
    },
    { 
      title: 'Average Grade', 
      value: gradeStats.value, 
      icon: Award, 
      growth: gradeStats.growth, 
      color: 'orange' 
    },
    { 
      title: 'Assignment Status', 
      value: assignmentStats.value, 
      icon: FileText, 
      growth: assignmentStats.growth, 
      color: 'purple' 
    },
  ];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <AuthenticatedLayout>
      <Head title="Teacher Dashboard" />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-orange-500">
                  Welcome Back, {auth?.user?.name || "Teacher"}
                </h1>
                <p className="text-gray-600 mt-2">Here's your teaching overview dashboard</p>
              </div>
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg px-4 py-2 text-white shadow-lg">
                <div className="flex space-x-2 items-center">
                  <Calendar className="h-5 w-5" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">2025</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 flex items-center transition-all duration-300 hover:shadow-lg">
                  <div className={`bg-${stat.color}-100 p-3 rounded-full mr-4`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`flex items-center ${stat.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendingUp className={`h-4 w-4 mr-1 ${stat.growth >= 0 ? '' : 'transform rotate-180'}`} />
                    <span className="text-sm font-medium">{stat.growth >= 0 ? '+' : ''}{stat.growth}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Attendance Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Class Attendance Overview</h2>
              <div className="h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Attendance']}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="attendance" fill="#10B981" fillOpacity={0.2} stroke="#10B981" />
                      <Line type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Class Performance Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Class Performance</h2>
              <div className="h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classPerformance}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="class" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Average Grade']}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="averageGrade" fill="#8884D8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Assignments and Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Assignments */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Assignments</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                  <span>View All</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">{assignment.class}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          new Date(assignment.dueDate) < new Date() ? 'text-red-600' : 'text-green-600'
                        }`}>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          assignment.status === 'Assigned' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Preview */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-300 hover:shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Today's Schedule</h2>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : todaySchedule.length > 0 ? (
                todaySchedule.map((session, index) => (
                  <div key={index} className="flex items-center p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <p className="font-semibold text-gray-800">{session.class}</p>
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <p>{session.time}</p>
                        <p>{session.room}</p>
                        <p>{session.grade}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No classes scheduled for today</p>
                </div>
              )}
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