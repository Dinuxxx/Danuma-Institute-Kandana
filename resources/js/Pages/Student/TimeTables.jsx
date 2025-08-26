import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TableComponent from '@/Components/TableComponent';

const TimeTables = ({ timetables = [], courses = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(timetables);
  const [dayFilter, setDayFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Sort by Day');
  
  const columns = ["Subject Code", "Subject Name", "Day", "Start Time", "End Time", "Classroom"];
  
  // Format timetable data for the table component
  const formatTimetableData = (data) => {
    return data.map(item => {
      const course = courses.find(c => c.course_id === item.course_id) || {};
      
      // Format times to remove seconds
      const startTime = item.start_time.substring(0, 5); // Extract only HH:MM
      const endTime = item.end_time.substring(0, 5);     // Extract only HH:MM
      
      return {
        "Subject Code": course.course_id || "Unknown",
        "Subject Name": course.course_name || "Unknown Course",
        "Day": item.day_of_week,
        "Start Time": startTime,
        "End Time": endTime,
        "Classroom": item.classroom_no || "TBA"
      };
    });
  };

  // Filter timetables based on search term and day filter
  useEffect(() => {
    let filtered = timetables;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const course = courses.find(c => c.course_id === item.course_id) || {};
        return (
          (course.course_id && course.course_id.toLowerCase().includes(term)) ||
          (course.course_name && course.course_name.toLowerCase().includes(term)) ||
          item.day_of_week.toLowerCase().includes(term) ||
          (item.classroom_no && item.classroom_no.toLowerCase().includes(term))
        );
      });
    }
    
    // Apply day filter
    if (dayFilter !== 'All') {
      filtered = filtered.filter(item => item.day_of_week === dayFilter);
    }
    
    // Apply sorting
    if (sortBy === 'Sort by Day') {
      const dayOrder = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 
        'Friday': 5, 'Saturday': 6, 'Sunday': 7
      };
      filtered = [...filtered].sort((a, b) => 
        (dayOrder[a.day_of_week] || 8) - (dayOrder[b.day_of_week] || 8)
      );
    } else if (sortBy === 'Sort by Name') {
      filtered = [...filtered].sort((a, b) => {
        const courseA = courses.find(c => c.course_id === a.course_id) || {};
        const courseB = courses.find(c => c.course_id === b.course_id) || {};
        return (courseA.course_name || '').localeCompare(courseB.course_name || '');
      });
    } else if (sortBy === 'Sort by Time') {
      filtered = [...filtered].sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) {
          const dayOrder = {
            'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 
            'Friday': 5, 'Saturday': 6, 'Sunday': 7
          };
          return (dayOrder[a.day_of_week] || 8) - (dayOrder[b.day_of_week] || 8);
        }
        return a.start_time.localeCompare(b.start_time);
      });
    }
    
    setFilteredData(filtered);
  }, [searchTerm, dayFilter, sortBy, timetables, courses]);

  // Handle print functionality
  const handlePrint = () => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'print-style';
    
    const css = `
      @media print {
        body * {
          visibility: hidden;
          margin-top: 40px;
        }
        .print-section, .print-section * {
          visibility: visible;
        }
        .print-section {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .print-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        /* Force background colors to be printed */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Preserve the exact colors from TableComponent */
        .print-section table {
          min-width: full;
          border-collapse: collapse;
          border: 1px solid #d1d5db;
        }
        
        .print-section th {
          background-color: #FC9C02 !important;
          color: white !important;
          border: 1px solid #d1d5db;
          padding: 0.5rem 1rem;
          text-align: left;
        }
        
        .print-section td {
          border: 1px solid #d1d5db;
          padding: 0.5rem 1rem;
        }
        
        .print-section tr:nth-child(odd) {
          background-color: #FEF8F7 !important;
        }
        
        .print-section tr:nth-child(even) {
          background-color: #EBE5E5 !important;
        }
      }
    `;
    
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
    
    window.print();
    
    document.head.removeChild(style);
  };

  // Define days of the week for the dropdown
  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <AuthenticatedLayout>
      <Head title="My Timetable" />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#FC9C02] mb-6">My Timetable</h1>
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-4">
                <div className="flex flex-wrap gap-2">
                  {/* Search input */}
                  <div className="relative w-auto md:w-auto">
                    <input
                      type="text"
                      placeholder="Search subjects, days, rooms..."
                      className="pl-3 pr-10 py-2 border border-gray-300 rounded w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Filter by day dropdown */}
                  <select
                    className="border border-gray-300 rounded py-2 px-3 w-32"
                    value={dayFilter}
                    onChange={(e) => setDayFilter(e.target.value)}
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  
                  {/* Sort dropdown */}
                  <select
                    className="border border-gray-300 rounded py-2 px-3 w-40"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Sort by Day">Sort by Day</option>
                    <option value="Sort by Name">Sort by Name</option>
                    <option value="Sort by Time">Sort by Time</option>
                  </select>
                </div>
                
                <div className="flex gap-4 w-auto md:w-auto">
                  {/* Print button */}
                  <button
                    onClick={handlePrint}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-8 rounded-lg w-full md:w-auto flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>
              </div>
              
              {filteredData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No timetable entries found for your enrolled courses. Please check your course enrollments or contact administration.</p>
                </div>
              ) : (
                <div className="print-section">
                  <div className="print-header" style={{ display: 'none' }}>
                    <h2>My Timetable</h2>
                  </div>
                  <TableComponent
                    columns={columns}
                    data={formatTimetableData(filteredData)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default TimeTables;