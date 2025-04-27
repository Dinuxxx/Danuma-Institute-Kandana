import React, { useState, useEffect } from "react";
import axios from "axios";
import Timetable from "../TableComponent";
import { toast } from "react-toastify";

const AttendanceList = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [courses, setCourses] = useState([]); 
  const [grades, setGrades] = useState(["A", "B", "C", "D", "F"]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Modal state for edit/delete
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  
  // Form data for editing
  const [editForm, setEditForm] = useState({
    checkInTime: "",
    checkOutTime: "",
    status: "Present"
  });

  // Fetch attendance data from backend
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construct query params based on filters
      let url = "/admin/attendance/report?";
      
      if (selectedDate) {
        url += `date=${selectedDate}&`;
      }
      
      if (selectedCourse) {
        url += `course_id=${selectedCourse}&`;
      }
      
      if (selectedGrade) {
        url += `grade=${selectedGrade}&`;
      }
      
      // Add pagination params
      url += `page=${currentPage}&perPage=${rowsPerPage}`;
      
      console.log("Fetching data from:", url);
      const response = await axios.get(url);
      
      if (response.data && Array.isArray(response.data.data)) {
        setAttendanceData(response.data.data);
        setTotalPages(Math.ceil((response.data.total || 0) / rowsPerPage));
        console.log("Attendance data received:", response.data.data);
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

  // Fetch courses from the backend
  const fetchCourses = async () => {
    try {
      const response = await axios.get("/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch attendance data when filters or pagination changes
  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, selectedCourse, selectedGrade, currentPage, rowsPerPage]);

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
        // Safely access properties with optional chaining
        const studentId = item?.student?.student_id?.toString() || '';
        const firstName = item?.student?.user?.registration?.first_name || '';
        const lastName = item?.student?.user?.registration?.last_name || '';
        
        return studentId.toLowerCase().includes(query) || 
               `${firstName} ${lastName}`.toLowerCase().includes(query);
      });
    }
  
    // Format data for table display
    const formattedData = filtered.map(item => {
      // Safely access properties with optional chaining
      const firstName = item?.student?.user?.registration?.first_name || 'Unknown';
      const lastName = item?.student?.user?.registration?.last_name || '';
      const grade = item?.student?.grade || 'N/A';
      const studentId = item?.student?.student_id || 'N/A';
      
      // Format dates and times
      const attendanceDate = item?.date ? new Date(item.date).toLocaleDateString() : 'N/A';
      
      // Format time
      const checkInTime = item?.check_in_time 
        ? new Date(item.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        : "Not checked in";
        
      const checkOutTime = item?.check_out_time 
        ? new Date(item.check_out_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        : "Not checked out";
      
      // Get course info with better handling for missing data
      let courseDisplay = "Not enrolled";
      let status = "N/A";
      let statusClass = "inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800";
      
      // First check if we have formatted course info from backend
      if (item?.formatted_course_info) {
        courseDisplay = `${item.formatted_course_info.course_id} - ${item.formatted_course_info.course_name}`;
        status = item.formatted_course_info.status;
      } else {
        // Fallback to original method if needed
        const courseAttendance = item?.courseAttendances?.[0];
        if (courseAttendance && courseAttendance.course) {
          const course = courseAttendance.course;
          if (course.course_id && course.course_name) {
            courseDisplay = `${course.course_id} - ${course.course_name}`;
            status = courseAttendance.status || "N/A";
          }
        }
      }
      
      // Handle status styling
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
        case "excused":
          statusClass = "inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800";
          break;
        default:
          statusClass = "inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800";
      }
      
      // Create row data
      return {
        S_id: studentId,
        Name: `${firstName} ${lastName}`,
        Grade: grade,
        Date: attendanceDate,
        Course: courseDisplay,
        "Check-In Time": checkInTime,
        "Check-Out Time": checkOutTime,
        Status: <span className={statusClass}>{status}</span>,
        att_id: item?.att_id, // Store original ID for edit/delete operations
        select: (
          <input 
            type="checkbox" 
            checked={selectedRows.includes(item?.att_id)}
            onChange={() => handleSelectRow(item?.att_id)}
            className="w-4 h-4 rounded border-gray-300"
          />
        ),
        Option: (
          <div className="flex gap-2">
            <button 
              className="text-red-500 hover:text-red-700 transition-colors" 
              onClick={() => handleDeleteClick(item)}
              title="Delete"
            >
              🗑️
            </button>
            <button 
              className="text-blue-500 hover:text-blue-700 transition-colors" 
              onClick={() => handleEditClick(item)}
              title="Edit"
            >
              ✏️
            </button>
          </div>
        )
      };
    });
  
    setFilteredData(formattedData);
  }, [attendanceData, searchQuery, selectedRows]);

  // Define columns
  const columns = [
    "select",
    "S_id",
    "Name",
    "Grade",
    "Date",
    "Course",
    "Check-In Time",
    "Check-Out Time",
    "Status",
    "Option",
  ];

  // Handle select all checkbox
  function handleSelectAll() {
    if (!selectAll) {
      // Select all rows
      const allIds = attendanceData.map(row => row.att_id).filter(Boolean);
      setSelectedRows(allIds);
    } else {
      // Deselect all rows
      setSelectedRows([]);
    }
    setSelectAll(!selectAll);
  }

  // Handle individual row selection
  function handleSelectRow(id) {
    if (!id) return;
    
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
      setSelectAll(false);
    } else {
      setSelectedRows([...selectedRows, id]);
      // Check if all rows are now selected
      if (selectedRows.length + 1 === attendanceData.length) {
        setSelectAll(true);
      }
    }
  }

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

  // Handle edit button click
  function handleEditClick(record) {
    if (!record) return;
    
    setCurrentRecord(record);
    
    // Format times for the form - improve time parsing
    const formatTimeForInput = (timeString) => {
      if (!timeString) return '';
      
      try {
        // Handle various time formats that might come from the API
        const time = typeof timeString === 'string' 
          ? new Date(timeString) 
          : timeString;
          
        if (time instanceof Date && !isNaN(time)) {
          return time.toTimeString().slice(0, 5); // HH:MM format for input[type="time"]
        }
      } catch (e) {
        console.error("Error parsing time:", e);
      }
      return '';
    };
    
    // Get status with better handling
    let status = "Present";
    if (record.courseAttendances && record.courseAttendances.length > 0) {
      status = record.courseAttendances[0].status || "Present";
    } else if (record.formatted_course_info) {
      status = record.formatted_course_info.status || "Present";
    }
    
    // Set form data with better time parsing
    setEditForm({
      checkInTime: formatTimeForInput(record["Check-In Time"] !== "Not checked in" ? record["Check-In Time"] : ''),
      checkOutTime: formatTimeForInput(record["Check-Out Time"] !== "Not checked out" ? record["Check-Out Time"] : ''),
      status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() // Normalize capitalization
    });
    
    setShowEditModal(true);
  }

  // Handle delete button click
  function handleDeleteClick(record) {
    if (!record) return;
    setCurrentRecord(record);
    setShowDeleteModal(true);
  }

  function validateForm(form) {
    const errors = {};
    
    // Check if check-out time is after check-in time if both are provided
    if (form.checkInTime && form.checkOutTime) {
      const checkIn = new Date(`2000-01-01T${form.checkInTime}`);
      const checkOut = new Date(`2000-01-01T${form.checkOutTime}`);
      
      if (checkOut < checkIn) {
        errors.checkOutTime = "Check-out time must be after check-in time";
      }
    }
    
    return errors;
  }
  
  async function handleEditSave() {
    if (!currentRecord?.att_id) {
      toast.error("Invalid record ID");
      return;
    }
    
    const errors = validateForm(editForm);
    if (Object.keys(errors).length > 0) {
      // Show validation errors
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }
    
    try {
      setLoading(true);
      
      // Get course ID with better handling
      let courseId = null;
      if (currentRecord.formatted_course_info) {
        courseId = currentRecord.formatted_course_info.course_id;
      } else if (currentRecord.courseAttendances?.[0]?.course_id) {
        courseId = currentRecord.courseAttendances[0].course_id;
      }
      
      // Format data for submission
      const formData = {
        check_in_time: editForm.checkInTime,
        check_out_time: editForm.checkOutTime,
        status: editForm.status
      };
      
      // Only include course_id if we have one
      if (courseId) {
        formData.course_id = courseId;
      }
      
      console.log("Updating attendance with data:", formData);
      
      // Make API call to update
      await axios.put(`/admin/attendance/${currentRecord.att_id}`, formData);
      
      toast.success("Attendance record updated successfully");
      setShowEditModal(false);
      fetchAttendanceData(); // Refresh data
    } catch (error) {
      console.error("Error updating attendance:", error);
      
      let errorMessage = "Failed to update attendance record";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleEditFormChange(e) {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  // Handle delete confirmation
  async function handleDeleteConfirm() {
    if (!currentRecord?.att_id) {
      toast.error("Invalid record ID");
      return;
    }
    
    try {
      setLoading(true);
      
      // Make API call to delete
      await axios.delete(`/admin/attendance/${currentRecord.att_id}`);
      
      toast.success("Attendance record deleted successfully");
      setShowDeleteModal(false);
      fetchAttendanceData(); // Refresh data
    } catch (error) {
      console.error("Error deleting attendance:", error);
      
      let errorMessage = "Failed to delete attendance record";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Handle bulk actions
  async function handleBulkAction(action) {
    if (selectedRows.length === 0) {
      toast.warning("No records selected");
      return;
    }
    
    try {
      setLoading(true);
      
      // Make API call for bulk actions
      await axios.post(`/admin/attendance/bulk/${action}`, { ids: selectedRows });
      
      toast.success(`Bulk ${action} successful for ${selectedRows.length} records`);
      setSelectedRows([]);
      setSelectAll(false);
      fetchAttendanceData(); // Refresh data
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      
      let errorMessage = `Failed to perform bulk ${action}`;
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Handle print function
  function handlePrint() {
    try {
      // Create a printable version of the data
      const printContent = filteredData.map(item => {
        const { select, Option, ...printableItem } = item;
        return printableItem;
      });
      
      // Store the data to print in localStorage
      localStorage.setItem('printData', JSON.stringify(printContent));
      localStorage.setItem('printColumns', JSON.stringify(columns.filter(col => col !== 'select' && col !== 'Option')));
      
      // Open print window
      const printWindow = window.open('/print-attendance', '_blank');
      
      if (!printWindow) {
        toast.error("Pop-up blocked! Please allow pop-ups for printing.");
      }
    } catch (e) {
      console.error("Error preparing print data:", e);
      toast.error("Failed to prepare print data");
    }
  }

  // Handle export to CSV
  function handleExportCSV() {
    try {
      // Filter out columns we don't want in the export
      const exportableData = filteredData.map(item => {
        const { select, Option, ...exportItem } = item;
        
        // Convert status element to string if it's a React element
        if (React.isValidElement(exportItem.Status)) {
          exportItem.Status = exportItem.Status.props.children;
        }
        
        return exportItem;
      });
      
      // Create CSV headers
      const headers = columns.filter(col => col !== 'select' && col !== 'Option');
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
      link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
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
    <div className="p-4 pt-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Student Attendance Management</h1>
        
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
              placeholder="Search by ID or name..."
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
            
            <div className="flex flex-col">
              <label htmlFor="grade-select" className="text-sm text-gray-600 mb-1">Grade</label>
              <select
                id="grade-select"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full sm:w-[200px] focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Grades</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
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

      {/* Action buttons and bulk actions */}
      <div className="flex flex-wrap justify-between items-center mb-24">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <input 
            type="checkbox" 
            checked={selectAll} 
            onChange={handleSelectAll}
            className="w-4 h-4 rounded border-gray-300"
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm text-gray-600">Select All</label>
          
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-red-500 font-semibold">{selectedRows.length} selected</span>
              <div className="flex gap-2">
                <button 
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete Selected
                </button>
                <button 
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={() => handleBulkAction('markPresent')}
                >
                  Mark Present
                </button>
              </div>
            </div>
          )}
        </div>
        
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
          
          <button 
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
            onClick={handlePrint}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print
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
        <div className="rounded-lg border ">
          <Timetable columns={columns} data={filteredData} />
        </div>
      )}

      {/* Pagination */}
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

      {/* Edit Modal */}
      {showEditModal && currentRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Attendance Record</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Student:
              </label>
              <p>{currentRecord.student?.user?.registration?.first_name} {currentRecord.student?.user?.registration?.last_name}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Check-in Time:
              </label>
              <input 
                type="time" 
                name="checkInTime"
                className="border rounded w-full py-2 px-3" 
                value={editForm.checkInTime}
                onChange={handleEditFormChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Check-out Time:
              </label>
              <input 
                type="time" 
                name="checkOutTime"
                className={`border rounded w-full py-2 px-3 ${formErrors.checkOutTime ? 'border-red-500' : ''}`}
                value={editForm.checkOutTime}
                onChange={handleEditFormChange}
              />
              {formErrors.checkOutTime && (
                <p className="text-red-500 text-xs italic">{formErrors.checkOutTime}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Status:
              </label>
              <select 
                className="border rounded w-full py-2 px-3"
                name="status"
                value={editForm.status}
                onChange={handleEditFormChange}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center ${loading ? 'opacity-75' : ''}`}
                onClick={handleEditSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            
            <p className="mb-6">
              Are you sure you want to delete the attendance record for 
              <span className="font-bold"> {currentRecord.student.user.registration.first_name} {currentRecord.student.user.registration.last_name}</span> 
              on <span className="font-bold">{new Date(currentRecord.date).toLocaleDateString()}</span>?
            </p>
            
            <div className="flex justify-end gap-2">
              <button 
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;