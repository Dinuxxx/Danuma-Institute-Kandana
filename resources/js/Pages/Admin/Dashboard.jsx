import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DatePicker from "@/Components/Admin Components/DatePicker";
import DashboardWidgets from "@/Components/Admin Components/DashboardWidgets";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, 
  ComposedChart, Area
} from "recharts";

export default function Dashboard({ auth }) {
  // Widget data state
  const [widgetData, setWidgetData] = useState([
    { title: "Teachers", value: 0, icon: "👨‍🏫", bgColor: "bg-blue-100" },
    { title: "Students", value: 0, icon: "👨‍🎓", bgColor: "bg-green-100" },
    { title: "Revenue", value: "Rs.0", icon: "💰", bgColor: "bg-yellow-100" },
    { title: "Courses", value: 0, icon: "📚", bgColor: "bg-purple-100" },
  ]);

  // Chart data states
  const [studentRegistrationData, setStudentRegistrationData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [courseDistributionData, setCourseDistributionData] = useState([]);
  const [monthlyPaymentTableData, setMonthlyPaymentTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch widget data
        const [teachersRes, studentsRes, coursesRes, paymentsRes] = await Promise.all([
          axios.get("/teachers/count"),
          axios.get("/students/count"),
          axios.get("/courses/count"),
          axios.get("/payments/total")
        ]);

        // Get previous month's data
        // In a real application, you would fetch this from the backend
        // This is a simplified example
        const prevMonth = {
          teachersCount: teachersRes.data.count * 0.9, // Sample calculation
          studentsCount: studentsRes.data.count * 0.85,
          revenue: paymentsRes.data.total * 0.92,
          coursesCount: coursesRes.data.count * 0.95
        };

        // Calculate growth percentages
        const teachersGrowth = prevMonth.teachersCount ? 
          ((teachersRes.data.count - prevMonth.teachersCount) / prevMonth.teachersCount) * 100 : 0;
        const studentsGrowth = prevMonth.studentsCount ? 
          ((studentsRes.data.count - prevMonth.studentsCount) / prevMonth.studentsCount) * 100 : 0;
        const revenueGrowth = prevMonth.revenue ? 
          ((paymentsRes.data.total - prevMonth.revenue) / prevMonth.revenue) * 100 : 0;
        const coursesGrowth = prevMonth.coursesCount ? 
          ((coursesRes.data.count - prevMonth.coursesCount) / prevMonth.coursesCount) * 100 : 0;

        setWidgetData([
          { 
            title: "Teachers", 
            value: teachersRes.data.count, 
            icon: "👨‍🏫", 
            bgColor: "bg-blue-100",
            growth: teachersGrowth
          },
          { 
            title: "Students", 
            value: studentsRes.data.count, 
            icon: "👨‍🎓", 
            bgColor: "bg-green-100",
            growth: studentsGrowth
          },
          { 
            title: "Revenue", 
            value: `Rs.${paymentsRes.data.total.toLocaleString()}`, 
            icon: "💰", 
            bgColor: "bg-yellow-100",
            growth: revenueGrowth
          },
          { 
            title: "Courses", 
            value: coursesRes.data.count, 
            icon: "📚", 
            bgColor: "bg-purple-100",
            growth: coursesGrowth
          },
        ]);

        // Fetch student registration data (monthly)
        const studentRegRes = await axios.get("/students/monthly-registrations");
        setStudentRegistrationData(studentRegRes.data);

        // Fetch payment data (monthly)
        const paymentRes = await axios.get("/payments/monthly");
        setPaymentData(paymentRes.data);
        
        // Create monthly payment table data
        setMonthlyPaymentTableData(formatPaymentTableData(paymentRes.data));

        // Fetch course distribution data
        const courseDistRes = await axios.get("/courses/distribution");
        setCourseDistributionData(courseDistRes.data);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        
        // Use mock data if API calls fail
        const mockStudentData = getMockStudentRegistrationData();
        const mockPaymentData = getMockPaymentData();
        setStudentRegistrationData(mockStudentData);
        setPaymentData(mockPaymentData);
        setCourseDistributionData(getMockCourseDistributionData());
        setMonthlyPaymentTableData(formatPaymentTableData(mockPaymentData));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format the payment data for the table display
  const formatPaymentTableData = (data) => {
    return data.map(item => ({
      month: item.month,
      amount: item.amount,
      formattedAmount: `Rs.${item.amount.toLocaleString()}`,
      growth: calculateGrowth(data, item)
    }));
  };

  // Calculate monthly growth percentage
  const calculateGrowth = (data, currentItem) => {
    const currentIndex = data.findIndex(item => item.month === currentItem.month);
    if (currentIndex <= 0 || currentIndex >= data.length) return 0;
    
    const prevAmount = data[currentIndex - 1].amount;
    if (prevAmount === 0) return 0;
    
    return ((currentItem.amount - prevAmount) / prevAmount) * 100;
  };

  // Mock data functions
  const getMockStudentRegistrationData = () => {
    return [
      { month: "Jan", registrations: 45 },
      { month: "Feb", registrations: 38 },
      { month: "Mar", registrations: 52 },
      { month: "Apr", registrations: 70 },
      { month: "May", registrations: 65 },
      { month: "Jun", registrations: 58 },
      { month: "Jul", registrations: 80 },
      { month: "Aug", registrations: 95 },
      { month: "Sep", registrations: 110 },
      { month: "Oct", registrations: 125 },
      { month: "Nov", registrations: 100 },
      { month: "Dec", registrations: 85 }
    ];
  };

  const getMockPaymentData = () => {
    return [
      { month: "Jan", amount: 12500 },
      { month: "Feb", amount: 11000 },
      { month: "Mar", amount: 15000 },
      { month: "Apr", amount: 17500 },
      { month: "May", amount: 16200 },
      { month: "Jun", amount: 18900 },
      { month: "Jul", amount: 22000 },
      { month: "Aug", amount: 24500 },
      { month: "Sep", amount: 27800 },
      { month: "Oct", amount: 31000 },
      { month: "Nov", amount: 28500 },
      { month: "Dec", amount: 21000 }
    ];
  };

  const getMockCourseDistributionData = () => {
    return [
      { name: "Web Development", students: 120 },
      { name: "Mobile App Dev", students: 85 },
      { name: "Data Science", students: 65 },
      { name: "UI/UX Design", students: 45 },
      { name: "Digital Marketing", students: 35 }
    ];
  };

  return (
    <AuthenticatedLayout>
      <Head title="Admin Dashboard" />
      <div className="p-6">
        <div className="flex justify-between items-center md:mb-12 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-orange-500">
              Welcome Back, {auth?.user?.name || "Admin"}
            </h1>
            <p className="text-gray-600 mt-2">Here's what's happening today</p>
          </div>
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg px-4 py-2 text-white shadow-lg">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Dashboard Widgets */}
        <DashboardWidgets data={widgetData} />

        {/* Charts Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analytics Overview</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {/* First row of charts */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Student Registration Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Student Registrations</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentRegistrationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} Students`, 'Registrations']}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="registrations" fill="#FF8042" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Payment Growth Chart - Enhanced */}
                <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Payment Collection</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={paymentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`Rs.${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="amount" fill="#0088FE" fillOpacity={0.2} stroke="#0088FE" />
                      <Line type="monotone" dataKey="amount" stroke="#0088FE" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Payments Table */}
              <div className="mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Payment Collection Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Growth
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {monthlyPaymentTableData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.month}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.formattedAmount}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${item.growth > 0 ? 'text-green-600' : item.growth < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {item.growth > 0 ? '+' : ''}{item.growth.toFixed(1)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Second row of charts */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Course Distribution Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Course Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={courseDistributionData}
                        dataKey="students"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        paddingAngle={2}
                      >
                        {courseDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Students`, 'Enrolled']} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Date Picker at the bottom of the page */}
        <div className="mt-8">
          <DatePicker />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}