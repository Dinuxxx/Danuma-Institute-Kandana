import React, { useState, useEffect } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUserCheck, 
  FaUserTimes, 
  FaExclamationTriangle, 
  FaMedal, 
  FaAngleLeft, 
  FaAngleRight, 
  FaAngleDoubleLeft, 
  FaAngleDoubleRight, 
  FaSearch, 
  FaFilter,
  FaUser
} from 'react-icons/fa'
import axios from 'axios'
import { format } from 'date-fns'

const Attendance = () => {
  // State variables for attendance data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attendanceData, setAttendanceData] = useState([])
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    attendance_rate: 0
  })
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  
  // Dummy data for monthly chart in case API fails
  const defaultMonthlyData = [
    { name: 'Week 1', present: 12, absent: 3, late: 2 },
    { name: 'Week 2', present: 15, absent: 4, late: 1 },
    { name: 'Week 3', present: 10, absent: 2, late: 3 },
    { name: 'Week 4', present: 14, absent: 5, late: 2 },
    { name: 'Week 5', present: 8, absent: 2, late: 1 }
  ]
  
  // Monthly chart data state
  const [monthlyChartData, setMonthlyChartData] = useState(defaultMonthlyData)
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Format date to display
  const currentDate = format(new Date(), 'MMMM dd, yyyy')

  // Load attendance data
  useEffect(() => {
    fetchAttendanceData()
    fetchCourses()
    fetchAttendanceStats()
    fetchMonthlyStats()
  }, [])

  // Reload data when filters change
  useEffect(() => {
    fetchAttendanceData()
    fetchAttendanceStats()
    fetchMonthlyStats()
  }, [selectedDate, selectedCourse, selectedStudent, currentPage, perPage])

  // Load students when course changes
  useEffect(() => {
    fetchStudents()
  }, [selectedCourse])

  // Fetch attendance data with filters
  const fetchAttendanceData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build query parameters
      const params = new URLSearchParams()
      
      if (selectedDate) {
        params.append('date', selectedDate)
      }
      
      if (selectedCourse) {
        params.append('course_id', selectedCourse)
      }
      
      if (selectedStudent) {
        params.append('student_id', selectedStudent)
      }
      
      params.append('page', currentPage)
      params.append('perPage', perPage)
      
      const response = await axios.get(`/teacher/attendance/report?${params.toString()}`)
      
      setAttendanceData(response.data.data || [])
      setTotalItems(response.data.total || 0)
      setTotalPages(response.data.last_page || 1)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching attendance data:', err)
      setError('Failed to load attendance data')
      setAttendanceData([])
      setTotalItems(0)
      setTotalPages(1)
      setLoading(false)
    }
  }

  // Fetch teacher courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get('/teacher/attendance/courses')
      setCourses(response.data || [])
    } catch (err) {
      console.error('Error fetching courses:', err)
      setCourses([])
    }
  }

  // Fetch students for the selected course
  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCourse) {
        params.append('course_id', selectedCourse)
      }
      
      const response = await axios.get(`/teacher/attendance/students?${params.toString()}`)
      setStudents(response.data || [])
    } catch (err) {
      console.error('Error fetching students:', err)
      setStudents([])
    }
  }

  // Fetch attendance statistics
  const fetchAttendanceStats = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCourse) {
        params.append('course_id', selectedCourse)
      }
      if (selectedStudent) {
        params.append('student_id', selectedStudent)
      }
      
      const response = await axios.get(`/teacher/attendance/stats?${params.toString()}`)
      setAttendanceStats(response.data || {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        attendance_rate: 0
      })
    } catch (err) {
      console.error('Error fetching attendance stats:', err)
      setAttendanceStats({
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        attendance_rate: 0
      })
    }
  }

  // Fetch monthly statistics data
  const fetchMonthlyStats = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCourse) {
        params.append('course_id', selectedCourse)
      }
      if (selectedStudent) {
        params.append('student_id', selectedStudent)
      }
      
      const response = await axios.get(`/teacher/attendance/monthly-stats?${params.toString()}`)
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setMonthlyChartData(response.data)
      } else {
        // Use default data if API returns empty data
        setMonthlyChartData(defaultMonthlyData)
      }
    } catch (err) {
      console.error('Error fetching monthly statistics:', err)
      // Fallback to default data if the API call fails
      setMonthlyChartData(defaultMonthlyData)
    }
  }

  // Handle page changes
  const goToPage = (page) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Apply filters
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    setCurrentPage(1) // Reset to first page when filter changes
  }
  
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value)
    setSelectedStudent('') // Reset student when course changes
    setCurrentPage(1) // Reset to first page when filter changes
  }
  
  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value)
    setCurrentPage(1) // Reset to first page when filter changes
  }
  
  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when rows per page changes
  }

  return (
    <AuthenticatedLayout>
      <Head title="Student Attendance" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-500">Student Attendance</h1>
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="h-5 w-5 text-gray-600" />
            <span className="font-medium">{currentDate}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow p-4 flex items-center border-l-4 border-green-500 transition-transform hover:scale-105">
            <div className="p-3 rounded-full bg-green-100 mr-4 shadow-inner">
              <FaUserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700">Present</p>
              <p className="text-2xl font-bold text-green-800">{attendanceStats.present}</p>
              <p className="text-xs text-green-600">
                {attendanceStats.total > 0 ? 
                  Math.round((attendanceStats.present/attendanceStats.total)*100) + '%' : 
                  '0%'}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow p-4 flex items-center border-l-4 border-red-500 transition-transform hover:scale-105">
            <div className="p-3 rounded-full bg-red-100 mr-4 shadow-inner">
              <FaUserTimes className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">Absent</p>
              <p className="text-2xl font-bold text-red-800">{attendanceStats.absent}</p>
              <p className="text-xs text-red-600">
                {attendanceStats.total > 0 ? 
                  Math.round((attendanceStats.absent/attendanceStats.total)*100) + '%' : 
                  '0%'}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg shadow p-4 flex items-center border-l-4 border-yellow-500 transition-transform hover:scale-105">
            <div className="p-3 rounded-full bg-yellow-100 mr-4 shadow-inner">
              <FaClock className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-yellow-700">Late</p>
              <p className="text-2xl font-bold text-yellow-800">{attendanceStats.late}</p>
              <p className="text-xs text-yellow-600">
                {attendanceStats.total > 0 ? 
                  Math.round((attendanceStats.late/attendanceStats.total)*100) + '%' : 
                  '0%'}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow p-4 flex items-center border-l-4 border-purple-500 transition-transform hover:scale-105">
            <div className="p-3 rounded-full bg-purple-100 mr-4 shadow-inner">
              <FaMedal className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-700">Attendance Rate</p>
              <p className="text-2xl font-bold text-purple-800">{attendanceStats.attendance_rate}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${attendanceStats.attendance_rate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Monthly Attendance Trends</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: '#4B5563' }} />
                <YAxis tick={{ fill: '#4B5563' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    borderColor: '#E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }} 
                  iconType="circle"
                />
                <Bar dataKey="present" fill="#10B981" name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#EF4444" name="Absent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="#F59E0B" name="Late" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Attendance Records</h2>
            
            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              {/* Date Filter */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>
              
              {/* Course Filter */}
              <div className="w-full md:w-64">
                <select
                  value={selectedCourse}
                  onChange={handleCourseChange}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Student Filter */}
              <div className="w-full md:w-64">
                <select
                  value={selectedStudent}
                  onChange={handleStudentChange}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
                >
                  <option value="">All Students</option>
                  {students.map(student => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Rows per page */}
              <div className="w-full md:w-48 flex items-center">
                <span className="text-sm text-gray-600 mr-2">Rows:</span>
                <select 
                  value={perPage} 
                  onChange={handlePerPageChange}
                  className="border border-gray-300 rounded px-2 py-2 text-sm flex-1"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Table content remains the same */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="loader">Loading...</div>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 text-center">{error}</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((attendance) => (
                    <tr key={attendance.att_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {new Date(attendance.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {attendance.student?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {attendance.courseAttendances[0]?.course?.course_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {attendance.check_in_time || 'Not Recorded'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {attendance.check_out_time || 'Not Recorded'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(attendance.courseAttendances[0]?.status)}`}>
                          {attendance.courseAttendances[0]?.status 
                            ? attendance.courseAttendances[0].status.charAt(0).toUpperCase() + attendance.courseAttendances[0].status.slice(1) 
                            : 'Not Marked'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination section remains the same */}
          {!loading && attendanceData.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'text-gray-300 bg-gray-50' : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages ? 'text-gray-300 bg-gray-50' : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * perPage, totalItems)}
                    </span>{' '}
                    of <span className="font-medium">{totalItems}</span> records
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">First Page</span>
                      <FaAngleDoubleLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <FaAngleLeft className="h-5 w-5" />
                    </button>
                    
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages || totalPages === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <FaAngleRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages || totalPages === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Last Page</span>
                      <FaAngleDoubleRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default Attendance