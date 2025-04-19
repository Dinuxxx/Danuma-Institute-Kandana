import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import TableComponent from '@/Components/TableComponent';
import axios from 'axios';

const Notices = ({ auth, initialNotices = [], error: serverError = null }) => {
  const [notices, setNotices] = useState(initialNotices || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(serverError);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [registeredGrades, setRegisteredGrades] = useState([]);
  const [debugMode, setDebugMode] = useState(false);

  // Fetch notices, registered courses, and grades on component mount
  useEffect(() => {
    // If we already have notices from server-side props, just stop loading
    if (Array.isArray(initialNotices) && initialNotices.length > 0) {
      setLoading(false);
    } else {
      fetchStudentNotices();
    }
    
    // Fetch student's registered courses and grades
    fetchRegisteredCourses();
    fetchRegisteredGrades();
  }, []);

  const fetchStudentNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timestamp to prevent caching
      const response = await axios.get(`/student/notices?_=${new Date().getTime()}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });
      
      console.log('API Response:', response);
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          setNotices(response.data);
        } else if (typeof response.data === 'object') {
          // Try to find any array in the response
          const possibleNotices = Object.values(response.data).find(val => Array.isArray(val));
          if (possibleNotices) {
            setNotices(possibleNotices);
          } else {
            console.error('No array found in response:', response.data);
            setError('Response format not recognized.');
            setNotices([]);
          }
        } else {
          console.error('Unexpected response type:', typeof response.data);
          setError('Unexpected response format.');
          setNotices([]);
        }
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      
      let errorMessage = 'Failed to load notices';
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        errorMessage += `: Server returned ${error.response.status}`;
        
        if (error.response.data && error.response.data.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage += ': No response received from server';
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      setError(errorMessage);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch student's registered courses
  const fetchRegisteredCourses = async () => {
    try {
      const response = await axios.get('/student/registered-courses', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });
      
      console.log('Courses Response:', response.data);
      
      if (response.data && response.data.success && response.data.courses) {
        setRegisteredCourses(response.data.courses);
      } else {
        console.warn('Unexpected courses response format:', response.data);
        setRegisteredCourses([]);
      }
    } catch (error) {
      console.error('Error fetching registered courses:', error);
      setRegisteredCourses([]);
    }
  };

  // Fetch student's registered grades/classes
  const fetchRegisteredGrades = async () => {
    try {
      const response = await axios.get('/student/registered-grades', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });
      
      console.log('Grades Response:', response.data);
      
      if (response.data && response.data.success && response.data.grades) {
        setRegisteredGrades(response.data.grades);
      } else {
        console.warn('Unexpected grades response format:', response.data);
        setRegisteredGrades([]);
      }
    } catch (error) {
      console.error('Error fetching registered grades:', error);
      setRegisteredGrades([]);
    }
  };

  // Function to safely access nested properties
  const getNestedValue = (obj, path, defaultValue = '') => {
    if (!obj) return defaultValue;
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : defaultValue;
    }, obj);
  };

  // Format visibility to check if notice is relevant to the student
  const isNoticeForStudent = (visibility) => {
    if (!visibility) return false;
    
    // If in debug mode, accept all notices
    if (debugMode) return true;
    
    let visibilityArray = [];
    
    // Handle different data formats
    if (Array.isArray(visibility)) {
      visibilityArray = visibility;
    } else if (typeof visibility === 'string') {
      try {
        const parsed = JSON.parse(visibility);
        if (Array.isArray(parsed)) {
          visibilityArray = parsed;
        } else if (typeof parsed === 'object') {
          visibilityArray = Object.values(parsed);
        } else {
          visibilityArray = [visibility];
        }
      } catch {
        visibilityArray = [visibility];
      }
    } else if (typeof visibility === 'object') {
      visibilityArray = Object.values(visibility);
    }
    
    // Log for debugging
    if (debugMode) {
      console.log('Visibility check:', { original: visibility, processed: visibilityArray });
    }
    
    // Check if the notice is for all students
    const isForAllStudents = visibilityArray.some(v => 
      ['All Students', 'Students', 'All'].includes(v)
    );
    
    if (isForAllStudents) return true;
    
    // Check if the notice is for one of the student's grades
    const isForStudentGrade = registeredGrades.some(grade => 
      visibilityArray.includes(grade)
    );
    
    return isForAllStudents || isForStudentGrade;
  };

  // Determine notice source (Admin, Teacher + Course, or Grade)
  const determineSource = (notice) => {
    // First check if the notice already has course information added by the backend
    if (notice.course_id && notice.course_name) {
      return {
        type: 'teacher',
        course_id: notice.course_id,
        course_name: notice.course_name
      };
    }
    
    // If notice has no user information
    if (!notice.user) {
      if (debugMode) console.log('Notice has no user information:', notice);
      return { type: 'unknown' };
    }
    
    // Check visibility for grade-specific notices
    let visibilityArray = [];
    
    if (Array.isArray(notice.visibility)) {
      visibilityArray = notice.visibility;
    } else if (typeof notice.visibility === 'string') {
      try {
        const parsed = JSON.parse(notice.visibility);
        if (Array.isArray(parsed)) {
          visibilityArray = parsed;
        } else if (typeof parsed === 'object') {
          visibilityArray = Object.values(parsed);
        } else {
          visibilityArray = [notice.visibility];
        }
      } catch {
        visibilityArray = [notice.visibility];
      }
    } else if (typeof notice.visibility === 'object') {
      visibilityArray = Object.values(notice.visibility);
    }
    
    // Check if this is a grade-specific notice
    const matchingGrades = registeredGrades.filter(grade => 
      visibilityArray.includes(grade) && 
      !['All Students', 'Students', 'All'].includes(grade)
    );
    
    if (matchingGrades.length > 0) {
      return {
        type: 'grade',
        grade_name: matchingGrades.join(', ')
      };
    }
    
    // Find if this notice is from a teacher of one of the student's registered courses
    let teacherId = null;
    
    // Try different ways to get teacher_id
    if (notice.user.teacher && notice.user.teacher.tea_id) {
      teacherId = notice.user.teacher.tea_id;
    } else if (notice.user.tea_id) {
      teacherId = notice.user.tea_id;
    }
    
    if (teacherId) {
      const courseMatch = registeredCourses.find(course => 
        course.teacher_id === teacherId
      );
      
      if (courseMatch) {
        return {
          type: 'teacher',
          course_id: courseMatch.course_id,
          course_name: courseMatch.course_name
        };
      }
    }
    
    // Check user roles
    const isAdmin = 
      (notice.user.roles && notice.user.roles.some(role => role.name === 'Admin')) ||
      notice.user.role_name === 'Admin';
    
    if (isAdmin) {
      return { type: 'admin' };
    }
    
    if (debugMode) console.log('Notice source undetermined:', notice);
    return { type: 'other' };
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  const columns = ['#', 'Title', 'Description', 'Attachment', 'Source'];
  
  // If in debug mode, show all notices, otherwise filter
  const relevantNotices = debugMode 
    ? notices 
    : notices.filter(notice => isNoticeForStudent(notice.visibility));
  
  // Pagination calculation
  const totalPages = Math.ceil(relevantNotices.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, relevantNotices.length);
  const paginatedNotices = relevantNotices.slice(startIndex, endIndex);
  
  const tableData = paginatedNotices.map((notice, index) => {
    const source = determineSource(notice);
    let sourceDisplay;
    
    if (source.type === 'admin') {
      sourceDisplay = (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Admin Notice
        </span>
      );
    } else if (source.type === 'teacher') {
      sourceDisplay = (
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {source.course_id} - {source.course_name}
          </span>
        </div>
      );
    } else if (source.type === 'grade') {
      sourceDisplay = (
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Class: {source.grade_name}
          </span>
        </div>
      );
    } else {
      sourceDisplay = (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {source.type}
        </span>
      );
    }
    
    return {
      '#': startIndex + index + 1,
      'Title': getNestedValue(notice, 'title', 'Untitled'),
      'Description': getNestedValue(notice, 'details', 'No description'),
      'Attachment': notice.attachment ? (
        <a href={`/storage/${notice.attachment}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          View Attachment
        </a>
      ) : 'No attachment',
      'Source': sourceDisplay
    };
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  return (
    <AuthenticatedLayout auth={auth}>
      <Head title="Notices" />
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Notices Board</h2>
            
            {/* Debug button (for developers only) */}
            {/* <button 
              onClick={toggleDebugMode}
              className={`px-3 py-1 text-xs rounded ${debugMode ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {debugMode ? 'Debug Mode ON' : 'Debug Mode'}
            </button> */}
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="font-bold">Error:</p>
                  <p>{error}</p>
                  <button 
                    className="bg-red-700 text-white px-2 py-1 rounded mt-2"
                    onClick={() => fetchStudentNotices()}
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {/* {debugMode && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded my-4">
                  <p className="font-bold">Debug Information:</p>
                  <p>Raw notice count: {notices.length}</p>
                  <p>Filtered notice count: {relevantNotices.length}</p>
                  <p>Registered courses: {registeredCourses.length}</p>
                  <p>Registered grades: {registeredGrades.length}</p>
                  <button 
                    className="bg-yellow-700 text-white px-2 py-1 rounded mt-2 mr-2"
                    onClick={() => console.log('Notices:', notices)}
                  >
                    Log Notices
                  </button>
                  <button 
                    className="bg-yellow-700 text-white px-2 py-1 rounded mt-2 mr-2"
                    onClick={() => console.log('Registered Courses:', registeredCourses)}
                  >
                    Log Courses
                  </button>
                  <button 
                    className="bg-yellow-700 text-white px-2 py-1 rounded mt-2"
                    onClick={() => console.log('Registered Grades:', registeredGrades)}
                  >
                    Log Grades
                  </button>
                </div>
              )} */}
              
              {loading ? (
                <div className="text-center py-4">Loading notices...</div>
              ) : relevantNotices.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-20 mt-4">
                    <div className="text-sm text-gray-600">
                      <span className="inline-flex items-center mr-4">
                        <span className="w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
                        <span>Admin notices</span>
                      </span>
                      <span className="inline-flex items-center mr-4">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                        <span>Course notices</span>
                      </span>
                      <span className="inline-flex items-center">
                        <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                        <span>Class notices</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <label className="mr-2 text-sm text-gray-600">Rows per page:</label>
                      <select 
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                        className="border rounded px-2 py-1 bg-white text-gray-700 w-16"
                      >
                        {[5, 10, 25].map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <TableComponent columns={columns} data={tableData} />
                  
                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {endIndex} of {relevantNotices.length} entries
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border rounded bg-white text-gray-700 disabled:bg-gray-200 disabled:text-gray-400"
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 border rounded ${
                              page === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border rounded bg-white text-gray-700 disabled:bg-gray-200 disabled:text-gray-400"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No notices available for you at this time.
                  {debugMode && (
                    <div className="mt-3">
                      <button 
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={fetchStudentNotices}
                      >
                        Refresh Data
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Notices;