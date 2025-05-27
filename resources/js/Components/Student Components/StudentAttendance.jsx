import React, { useState, useEffect } from "react";
import axios from "axios";
import Timetable from "../TableComponent";
import { toast } from "react-toastify";

const StudentAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  });

  // Fetch attendance data from backend
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construct query params based on filters
      let url = "/student/attendance/report?";
      
      if (selectedDate) {
        url += `date=${selectedDate}&`;
      }
      
      if (selectedCourse) {
        url += `course_id=${selectedCourse}&`;
      }
      
      // Add pagination params
      url += `page=${currentPage}&perPage=${rowsPerPage}`;
      
      console.log("Fetching data from:", url);
      const response = await axios.get(url);
      
      if (response.data && Array.isArray(response.data.data)) {
        setAttendanceData(response.data.data);
        setTotalPages(Math.ceil((response.data.total || 0) / rowsPerPage));
        console.log("Attendance data received:", response.data.data);
        
        // Calculate attendance statistics
        calculateAttendanceStats(response.data.data);
      } else {
        console.error("Invalid data format:", response.data);
        toast.error("Invalid data format received from server");
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      
      // Get more detailed error information
      let errorMessage = "Failed to load attendance data";
      if (error.response) {
        console.error("Error response data:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = (data) => {
    if (!data || data.length === 0) {
      setAttendanceStats({
        present: 0,
        absent: 0,
        late: 0,
        total: 0
      });
      return;
    }

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      total: data.length
    };

    data.forEach(item => {
      if (item.courseAttendances && item.courseAttendances.length > 0) {
        const status = item.courseAttendances[0].status?.toLowerCase();
        if (status === 'present') stats.present++;
        else if (status === 'absent') stats.absent++;
        else if (status === 'late') stats.late++;
      }
    });

    setAttendanceStats(stats);
  };

  // Fetch courses from the backend
  const fetchCourses = async () => {
    try {
      const response = await axios.get("/student/getStudentCourses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    }
  };

  // Fetch student's overall attendance statistics
  const fetchAttendanceStats = async () => {
    try {
      const response = await axios.get("/student/attendance/stats");
      if (response.data) {
        setAttendanceStats({
          present: response.data.present || 0,
          absent: response.data.absent || 0,
          late: response.data.late || 0,
          total: response.data.total || 0
        });
      }
    } catch (error) {
      console.error("Error fetching attendance statistics:", error);
      toast.error("Failed to load attendance statistics");
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCourses();
    fetchAttendanceStats();
  }, []);

  // Fetch attendance data when filters or pagination changes
  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, selectedCourse, currentPage, rowsPerPage]);

  // Format the attendance data for table display
  useEffect(() => {
    if (attendanceData.length === 0) {
      setFilteredData([]);
      return;
    }

    // Apply search filter locally
    let filtered = [...attendanceData];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        // Check if courseAttendances exists and has items with course data
        if (!item.courseAttendances || 
            item.courseAttendances.length === 0 || 
            !item.courseAttendances[0].course) {
          return false;
        }
        
        const courseId = item.courseAttendances[0].course.course_id || '';
        const courseName = item.courseAttendances[0].course.course_name || '';
        
        return courseId.toLowerCase().includes(query) || 
              courseName.toLowerCase().includes(query);
      });
    }

    // Format data for table display
    const formattedData = filtered.map(item => {
      // Check if courseAttendances exists and has items with valid course data
      const hasCourseData = item.courseAttendances && 
                         item.courseAttendances.length > 0 && 
                         item.courseAttendances[0].course;
      
      // Get course info with better null checking
      const courseAttendance = item.courseAttendances && item.courseAttendances.length > 0 ? 
                              item.courseAttendances[0] : null;
      const course = courseAttendance && courseAttendance.course ? courseAttendance.course : null;
      
      // Use null coalescing for safer property access
      const courseId = course ? course.course_id : 'No Course ID';
      const courseName = course ? course.course_name : 'No Course Name';
      
      // Format dates and times
      const attendanceDate = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
      
      // Format time
      const checkInTime = item.check_in_time 
        ? new Date(item.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        : "Not checked in";
        
      const checkOutTime = item.check_out_time 
        ? new Date(item.check_out_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        : "Not checked out";
      
      // Format status with better handling of missing values
      let status = "Not Marked";
      if (courseAttendance && courseAttendance.status) {
        status = courseAttendance.status;
      }
      
      // Handle status styling
      let statusClass = "";
      switch (status.toLowerCase()) {
        case "present":
          statusClass = "inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800";
          break;
        case "absent":
          statusClass = "inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800";
          break;
        case "late":
          statusClass = "inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800";
          break;
        default:
          statusClass = "inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800";
      }
      
      // Create row data
      return {
        Date: attendanceDate,
        Course: hasCourseData ? `${courseId} - ${courseName}` : "No Course Assigned",
        "Check-In Time": checkInTime,
        "Check-Out Time": checkOutTime,
        Status: <span className={statusClass}>{status}</span>,
      };
    });

    setFilteredData(formattedData);
  }, [attendanceData, searchQuery]);

  // Define columns
  const columns = [
    "Date",
    "Course",
    "Check-In Time",
    "Check-Out Time",
    "Status",
  ];

  // Handle search
  function handleSearch(e) {
    setSearchQuery(e.target.value);
  }

  // Handle rows per page change
  function handleRowsPerPageChange(e) {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  }

  // Handle pagination navigation
  function handlePreviousPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function handleNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  // Handle export to CSV
  function handleExportCSV() {
    try {
      // Create exportable data
      const exportableData = filteredData.map(item => {
        const { ...exportItem } = item;
        
        // Convert status element to string if it's a React element
        if (React.isValidElement(exportItem.Status)) {
          exportItem.Status = exportItem.Status.props.children;
        }
        
        return exportItem;
      });
      
      // Create CSV headers
      const headers = columns;
      let csvContent = headers.join(',') + '\n';
      
      // Add rows
      exportableData.forEach(item => {
        const values = headers.map(header => {
          const value = item[header] || '';
          // Wrap in quotes to handle commas in values
          return `"${value}"`;
        });
        csvContent += values.join(',') + '\n';
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `my_attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV file exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV file");
    }
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">My Attendance</h1>
        
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Present</p>
                <p className="text-lg font-bold">{attendanceStats.present}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Absent</p>
                <p className="text-lg font-bold">{attendanceStats.absent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Late</p>
                <p className="text-lg font-bold">{attendanceStats.late}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Attendance Rate</p>
                <p className="text-lg font-bold">
                  {attendanceStats.total > 0 
                    ? Math.round(((attendanceStats.present + attendanceStats.late) / attendanceStats.total) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by course..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-[250px]"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col">
              <label htmlFor="date-picker" className="text-sm text-gray-600 mb-1">Date</label>
              <input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full sm:w-[200px] focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="course-select" className="text-sm text-gray-600 mb-1">Course</label>
              <select
                id="course-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full sm:w-[200px] focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.subject || course.course_id} - {course.course_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error display if there's an error */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4 border border-red-300">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap justify-end items-center mb-20">
        <div className="flex items-center gap-2">
          <label htmlFor="rows-select" className="text-sm text-gray-600">Rows:</label>
          <select
            id="rows-select"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border border-gray-300 rounded-lg p-1 w-20 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          
          <button 
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        /* Timetable Component */
        <div className="rounded-lg border">
          <Timetable columns={columns} data={filteredData} />
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredData.length > 0 && (
        <div className="flex justify-end mt-4">
          <div className="flex items-center gap-2">
            <button 
              className="p-2 border rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:hover:bg-white"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <button 
              className="p-2 border rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:hover:bg-white"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;