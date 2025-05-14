import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Clock, LogIn, LogOut, UserCheck, ArrowLeft, FileCheck, DollarSign, CreditCard, CheckCircle, ChevronRight } from 'lucide-react';

const ManualAttendance = () => {
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [course, setCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Payment-related states
  const [selectedPaymentCourses, setSelectedPaymentCourses] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedTimeTable, setSelectedTimeTable] = useState(null);
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);
  
  // Track attendance for each course
  const [courseAttendance, setCourseAttendance] = useState({});

  useEffect(() => {
    // Get the current date
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);
    
    // Set current time as default check-in time
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    setCheckInTime(`${hours}:${minutes}`);
  }, []);

  const fetchStudentData = async () => {
    if (!studentId) return;
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await axios.get(`/admin/students/${studentId}`);
      setStudentData(response.data.student);
      
      // Setup courses with their attendance status
      const coursesData = response.data.courses || [];
      setCourses(coursesData);
      
      // Initialize course attendance tracking
      const attendanceMap = {};
      coursesData.forEach(course => {
        attendanceMap[course.course_id] = {
          checkedIn: false,
          checkedOut: false,
          checkInTime: '',
          checkOutTime: '',
          attendanceId: null,
        };
      });
      setCourseAttendance(attendanceMap);
      
      // Fetch today's attendance for this student to populate attendance status
      if (response.data.student) {
        fetchTodayAttendance(response.data.student.student_id);
        fetchStudentPaymentData(response.data.student.student_id);
        fetchPaymentHistory(response.data.student.student_id);
      }
      
      setLoading(false);

      // Clear course selection if there are no courses
      if (coursesData.length === 0) {
        setCourse('');
        setSelectedTimeTable(null);
      }
      
      // Check if there are scheduled classes today
      if (response.data.hasSchedule === false) {
        setMessage({ 
          text: 'This student has no scheduled classes today', 
          type: 'warning' 
        });
      }
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      
      let errorMessage = 'Student not found or error fetching data';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Student not found. Please check the ID and try again.';
        } else {
          errorMessage = `Error: ${error.response.data.message || 'Server error'}`;
        }
      }
      
      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
      setStudentData(null);
      setLoading(false);
    }
  };

  // New function to fetch today's attendance records
  const fetchTodayAttendance = async (studentId) => {
    try {
      const response = await axios.get(`/admin/attendance/today/${studentId}`);
      
      if (response.data.attendance) {
        const newAttendanceMap = {...courseAttendance};
        
        // Update attendance map with today's data
        response.data.attendance.forEach(record => {
          if (record.course_id && newAttendanceMap[record.course_id]) {
            newAttendanceMap[record.course_id] = {
              checkedIn: !!record.check_in_time,
              checkedOut: !!record.check_out_time,
              checkInTime: record.check_in_time ? record.check_in_time.substring(11, 16) : '',
              checkOutTime: record.check_out_time ? record.check_out_time.substring(11, 16) : '',
              attendanceId: record.att_id,
              status: record.status || 'present' // Store the attendance status
            };
          }
        });
        
        setCourseAttendance(newAttendanceMap);
      }
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    }
  };

  const fetchStudentPaymentData = async (studentId) => {
    try {
      const response = await axios.get(`/admin/attendance/registered-courses`, {
        params: { student_id: studentId }
      });
      
      const paymentCourses = (response.data?.courses || []).map(course => ({
        ...course,
        selected: false
      }));
      
      setSelectedPaymentCourses(paymentCourses);
      setTotalDue(response.data?.totalDue || 0);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setMessage({ 
        text: 'Unable to fetch payment information', 
        type: 'error' 
      });
    }
  };

  const handleStudentIdChange = (e) => {
    setStudentId(e.target.value);
    if (e.target.value === '') {
      setStudentData(null);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      // Convert "HH:MM:SS" to "HH:MM AM/PM"
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };

  const handleCheckIn = async () => {
    if (!studentData || !course || !checkInTime || !selectedTimeTable) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
  
    try {
      const response = await axios.post('/admin/attendance/check-in', {
        student_id: studentData.student_id,
        course_id: course,
        check_in_time: checkInTime,
        ttable_id: selectedTimeTable
      });
      
      // Show attendance status in message
      const status = response.data.status || 'present';
      let statusMessage = 'Student checked in successfully';
      let statusType = 'success';
      
      if (status === 'late') {
        statusMessage = 'Student checked in as LATE';
        statusType = 'warning';
      }
      
      setMessage({ 
        text: statusMessage, 
        type: statusType 
      });
      
      // Update the course attendance tracking
      setCourseAttendance(prev => ({
        ...prev,
        [course]: {
          ...prev[course],
          checkedIn: true,
          checkInTime: checkInTime,
          attendanceId: response.data.attendance_id,
          status: status // Store the attendance status
        }
      }));
      
    } catch (error) {
      console.error('Error checking in:', error);
      let errorMsg = 'Failed to check in student';
      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
      }
      setMessage({ 
        text: errorMsg, 
        type: 'error' 
      });
    }
  };

  const handleCheckOut = async () => {
    if (!studentData || !course || !checkOutTime) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }

    try {
      const response = await axios.post('/admin/attendance/check-out', {
        student_id: studentData.student_id,
        course_id: course,
        check_out_time: checkOutTime
      });
      
      setMessage({ 
        text: 'Student checked out successfully', 
        type: 'success' 
      });
      
      // Update the course attendance tracking
      setCourseAttendance(prev => ({
        ...prev,
        [course]: {
          ...prev[course],
          checkedOut: true,
          checkOutTime: checkOutTime
        }
      }));
      
    } catch (error) {
      console.error('Error checking out:', error);
      setMessage({ 
        text: 'Failed to check out student', 
        type: 'error' 
      });
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setCourse(courseId);
    
    // Find the selected course to get its time table ID
    if (courseId) {
      const selectedCourse = courses.find(c => c.course_id === courseId);
      if (selectedCourse) {
        setSelectedTimeTable(selectedCourse.ttable_id);
        
        // Set the check-in and check-out times from attendance data if available
        if (courseAttendance[courseId]) {
          if (courseAttendance[courseId].checkInTime) {
            setCheckInTime(courseAttendance[courseId].checkInTime);
          }
          if (courseAttendance[courseId].checkOutTime) {
            setCheckOutTime(courseAttendance[courseId].checkOutTime);
          } else {
            // Reset check-out time if not set
            const today = new Date();
            const hours = String(today.getHours()).padStart(2, '0');
            const minutes = String(today.getMinutes()).padStart(2, '0');
            setCheckOutTime(`${hours}:${minutes}`);
          }
        }
      }
    } else {
      setSelectedTimeTable(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchStudentData();
    }
  };

  const togglePaymentPortal = () => {
    setShowPaymentPortal(!showPaymentPortal);
  };

  const fetchPaymentHistory = async (studentId) => {
    try {
      const response = await axios.get(`/admin/payments/student/${studentId}`);
      
      const formattedPayments = (response.data?.payments || []).map(payment => ({
        ...payment,
        amount: parseFloat(payment.amount || 0)
      }));
      
      setPaymentHistory(formattedPayments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setMessage({ 
        text: 'Unable to fetch payment history', 
        type: 'error' 
      });
    }
  };

  const toggleCourseSelection = (courseId) => {
    const updatedCourses = selectedPaymentCourses.map(course => {
      if (course.course_id === courseId) {
        return { ...course, selected: !course.selected };
      }
      return course;
    });
    
    setSelectedPaymentCourses(updatedCourses);
    
    // Calculate total amount based on selected courses
    const selectedAmount = updatedCourses
      .filter(course => course.selected)
      .reduce((sum, course) => sum + parseFloat(course.monthly_fees || 0), 0);
    
    setPaymentAmount(selectedAmount);
  };
  
  const handlePayment = async () => {
    if (!studentData || paymentAmount <= 0) {
      setMessage({ text: 'Please select at least one course to pay for', type: 'error' });
      return;
    }
  
    setPaymentProcessing(true);
    
    try {
      // Get selected course IDs
      const courseIds = selectedPaymentCourses
        .filter(course => course.selected)
        .map(course => course.course_id);
      
      if (courseIds.length === 0) {
        setMessage({ text: 'Please select at least one course', type: 'error' });
        setPaymentProcessing(false);
        return;
      }
      
      // Create payload for cash payment
      const paymentData = {
        method: 'Cash', // For admin interface, hardcode as cash
        amount: paymentAmount,
        student_id: studentData.student_id,
        course_ids: courseIds
      };
      
      // Use the endpoint from the PaymentController
      const response = await axios.post('/admin/attendance/process-payment', paymentData);
      
      setMessage({ 
        text: 'Cash payment processed successfully', 
        type: 'success' 
      });
      
      // Reset payment form
      setSelectedPaymentCourses(prevCourses => 
        prevCourses.map(course => ({ ...course, selected: false }))
      );
      setPaymentAmount(0);
      
      // Refresh payment data to show updated balances
      fetchStudentPaymentData(studentData.student_id);
      fetchPaymentHistory(studentData.student_id);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      let errorMsg = 'Failed to process payment';
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      }
      setMessage({ 
        text: errorMsg, 
        type: 'error' 
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header with Search Section */}
          <div className="bg-white rounded-t-xl py-5 px-6 shadow-sm relative overflow-hidden border-b border-gray-200">
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 relative z-10">
              <div className="w-full md:w-auto flex flex-col md:flex-row items-end gap-3">
                <div className="w-full md:w-64 relative group">
                  <label htmlFor="studentId" className="block text-gray-700 font-medium mb-1 flex items-center">
                    <span className="mr-2">Student ID</span>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">Required</span>
                  </label>
                  <div className="relative transition-all duration-300 transform group-hover:scale-[1.01]">
                    <input
                      type="text"
                      id="studentId"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all duration-300"
                      value={studentId}
                      onChange={handleStudentIdChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter Student ID"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    fetchStudentData();
                    setStudentId(''); // Clear the student ID field after searching
                  }}
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium flex-shrink-0 transform hover:-translate-y-0.5 hover:shadow-lg group"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span className="group-hover:scale-105 transition-transform duration-300">Find Student</span>
                      <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Message Section */}
          {message.text && (
            <div className={`px-6 py-3 ${message.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : message.type === 'warning' ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-500' : 'bg-green-50 text-green-700 border-l-4 border-green-500'}`}>
              <div className="flex items-center">
                <div className={`h-8 w-8 flex items-center justify-center rounded-full ${message.type === 'error' ? 'bg-red-100' : message.type === 'warning' ? 'bg-amber-100' : 'bg-green-100'} mr-4`}>
                  {message.type === 'error' ? (
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : message.type === 'warning' ? (
                    <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="font-medium">{message.text}</p>
              </div>
            </div>
          )}

          {/* Student Details and Main Content Section */}
          <div className="p-6">
            {studentData ? (
              <>
                {/* Student Info Card - Improved design */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg shadow-sm mb-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-md bg-white flex items-center justify-center border-2 border-amber-200">
                        {studentData.image ? (
                          <img
                            src={studentData.image}
                            alt="Student profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-amber-500">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-grow space-y-1">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <h2 className="text-2xl font-bold text-gray-800">{`${studentData.first_name} ${studentData.last_name}`}</h2>
                        <div className="flex items-center gap-3">
                          <span className="bg-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full font-medium">{currentDate}</span>
                          {!showPaymentPortal && (
                            <button 
                              onClick={togglePaymentPortal}
                              className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1 rounded-full font-medium flex items-center gap-1 transition-colors shadow-sm"
                            >
                              <DollarSign className="h-4 w-4" />
                              <span>Payments</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <p className="text-gray-600 flex items-center">
                          <span className="font-medium mr-2">ID:</span> 
                          <span className="bg-gray-100 px-3 py-1 rounded">{studentData.student_id}</span>
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <span className="font-medium mr-2">Grade:</span> 
                          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded font-medium">{studentData.grade}</span>
                        </p>
                        {!showPaymentPortal && (
                          <p className="text-gray-600 flex items-center">
                            <span className="font-medium mr-2">Balance:</span> 
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded font-medium">Rs.{totalDue.toFixed(2)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex gap-6 ${showPaymentPortal ? 'flex-col lg:flex-row' : 'justify-center'}`}>
                  <div className={`${showPaymentPortal ? 'lg:w-3/5' : 'max-w-2xl w-full'} bg-white border border-gray-200 rounded-lg shadow-sm p-5 transition-all duration-300`}>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-6 w-6 text-amber-600" />
                        <h3 className="text-xl font-semibold text-gray-800">Attendance Management</h3>
                      </div>
                      {showPaymentPortal && (
                        <button 
                          onClick={togglePaymentPortal} 
                          className="text-amber-600 hover:text-amber-800 transition-colors"
                          title="Hide payment portal"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                          Select Course <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="course"
                          className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors ${courses.length === 0 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                          value={course}
                          onChange={handleCourseChange}
                          disabled={courses.length === 0}
                        >
                          <option value="">Select a course</option>
                          {courses.map((c) => (
                            <option key={c.course_id} value={c.course_id}>
                              {c.course_name} ({formatTime(c.start_time)} - {formatTime(c.end_time)})
                            </option>
                          ))}
                        </select>
                        
                        {courses.length === 0 && studentData && (
                          <p className="mt-2 text-sm text-amber-600">
                            No active classes remaining for today
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-2">
                            Check-In Time <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="time"
                              id="checkInTime"
                              className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none bg-white"
                              value={checkInTime}
                              onChange={(e) => setCheckInTime(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 mb-2">
                            Check-Out Time <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="time"
                              id="checkOutTime"
                              className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none bg-white"
                              value={checkOutTime}
                              onChange={(e) => setCheckOutTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                          onClick={handleCheckIn}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                          <LogIn className="h-5 w-5" />
                          <span>Check-In</span>
                        </button>
                        <button 
                          onClick={handleCheckOut}
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Check-Out</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section - Only shown when toggled */}
                  {showPaymentPortal && (
                    <div className="lg:w-2/5 bg-white border border-gray-200 rounded-lg shadow-sm p-5 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-6 w-6 text-green-600" />
                          <h3 className="text-xl font-semibold text-gray-800">Payment Portal</h3>
                        </div>
                        <button 
                          onClick={togglePaymentPortal}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          title="Close payment portal"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-700 font-medium">Available Balance</span>
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium">
                          Due: Rs.{totalDue.toFixed(2)}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-5">
                        <h4 className="font-medium text-gray-700 mb-3">Select courses to pay for:</h4>
                        
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                          {selectedPaymentCourses.length > 0 ? (
                            selectedPaymentCourses.map((course) => (
                              <div 
                                key={course.course_id} 
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${course.selected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-amber-300'}`}
                                onClick={() => toggleCourseSelection(course.course_id)}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${course.selected ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                      {course.selected && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                    <div>
                                      <p className="font-medium">{course.course_name}</p>
                                      <p className="text-xs text-gray-500">Grade: {course.grade}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-green-700">
                                    Rs.{parseFloat(course.monthly_fees || 0).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              No pending payments found for this student
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg mb-4 flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-700">Cash Payment Only</span>
                        </div>

                        <div>
                          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                            Amount to Pay <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500">Rs.</span>
                            </div>
                            <input
                              type="number"
                              id="paymentAmount"
                              className="w-full pl-8 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none bg-white"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4">
                        <button 
                          onClick={handlePayment}
                          disabled={paymentAmount <= 0 || paymentProcessing}
                          className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 font-medium ${(paymentAmount <= 0 || paymentProcessing) ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {paymentProcessing ? (
                            <>
                              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-5 w-5" />
                              <span>Process Payment (Rs.{paymentAmount.toFixed(2)})</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Payment History */}
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-700 mb-3">Recent Payments</h4>
                        <div className="space-y-2">
                          {paymentHistory.length > 0 ? (
                            paymentHistory.map((payment) => (
                              <div key={payment.payment_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                                <div>
                                  <p className="font-medium">{payment.courses?.map(c => c.course_name).join(', ') || 'Multiple courses'}</p>
                                  <p className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-green-600">Rs.{payment.amount.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">{payment.method}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No payment history available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <div className="mx-auto bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">Enter Student ID to Begin</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Enter a valid Student ID in the search box above and press Enter or click Find to display student information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Back Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-white text-amber-800 h-12 w-12 rounded-full flex items-center justify-center shadow-lg hover:bg-amber-50 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

export default ManualAttendance;