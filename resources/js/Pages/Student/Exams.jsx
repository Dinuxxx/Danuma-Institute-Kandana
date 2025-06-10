import React, { useState, useEffect } from 'react';
import { Search, Download, TrendingUp, BookOpen, Award, Target } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TableComponent from '@/Components/TableComponent';
import { Head } from '@inertiajs/react';

const Exams = ({ exams: initialExams = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('exam_name');
  const [filteredExams, setFilteredExams] = useState([]);
  const [exams, setExams] = useState(initialExams);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialExams.length === 0) {
      fetchExams();
    } else {
      setExams(initialExams);
    }
  }, []);

  useEffect(() => {
    setFilteredExams(exams);
  }, [exams]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/student/exams/data');
      const data = await response.json();
      
      if (data.success) {
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = exams.filter(exam =>
      exam.exam_name.toLowerCase().includes(term)
    );
    
    setFilteredExams(filtered);
  };

  const handleSort = (value) => {
    setSortBy(value);
    
    const sorted = [...filteredExams].sort((a, b) => {
      switch (value) {
        case 'exam_name':
          return a.exam_name.localeCompare(b.exam_name);
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'marks':
          // Handle null marks by putting them at the end
          if (a.marks === null && b.marks === null) return 0;
          if (a.marks === null) return 1;
          if (b.marks === null) return -1;
          return b.marks - a.marks; // Descending order for marks
        default:
          return 0;
      }
    });
    
    setFilteredExams(sorted);
  };

  // Calculate grade distribution
  const getGradeDistribution = () => {
    const examsWithGrades = exams.filter(e => e.grade && e.grade !== null);
    const distribution = {};
    
    examsWithGrades.forEach(exam => {
      distribution[exam.grade] = (distribution[exam.grade] || 0) + 1;
    });
    
    return distribution;
  };

  const handleExportExcel = () => {
    // Prepare data for CSV export (which can be opened in Excel)
    const csvData = [
      ['Exam Name', 'Course', 'Date', 'Marks', 'Grade', 'Rank'], // Header
      ...exams.map(exam => [
        exam.exam_name,
        exam.course_name,
        new Date(exam.date).toLocaleDateString(),
        exam.marks !== null && exam.marks !== undefined ? Number(exam.marks).toFixed(2) : 'Not Available',
        exam.grade || '--',
        exam.rank || '--'
      ])
    ];

    // Convert to CSV format
    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `exam_results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Prepare table data
  const tableColumns = ['Exam Name', 'Course', 'Date', 'Marks', 'Grade', 'Rank'];
  
  const tableData = filteredExams.map(exam => ({
    'Exam Name': exam.exam_name,
    'Course': exam.course_name,
    'Date': new Date(exam.date).toLocaleDateString(),
    'Marks': exam.marks !== null && exam.marks !== undefined ? Number(exam.marks).toFixed(2) : '--',
    'Grade': exam.grade || '--',
    'Rank': exam.rank || '--'
  }));

  if (loading) {
    return (
      <AuthenticatedLayout>
        <Head title="My Exams" />
        <div className="p-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading exam results...</div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const gradeDistribution = getGradeDistribution();
  const gradeColors = {
    'A+': 'bg-gradient-to-r from-green-400 to-green-600',
    'A': 'bg-gradient-to-r from-blue-400 to-blue-600',
    'B': 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    'C': 'bg-gradient-to-r from-orange-400 to-orange-600',
    'S': 'bg-gradient-to-r from-red-400 to-red-600',
    'W': 'bg-gradient-to-r from-gray-400 to-gray-600'
  };

  return (
    <AuthenticatedLayout>
      <Head title="My Exams" />
      <div className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-orange-500 mb-2">
                My Exam Results
              </h1>
              <p className="text-gray-600">
                View your exam performance and grades
              </p>
            </div>
          </div>
          
          {/* Creative Summary Cards */}
          {exams.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Total Exams Widget */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
                <BookOpen className="w-8 h-8 text-white mb-3" />
                <h3 className="font-semibold text-white mb-1">Total Exams</h3>
                <p className="text-3xl font-bold text-white">{exams.length}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-30"></div>
              </div>

              {/* Average Score Widget */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white bg-opacity-10 rounded-full -mr-8 -mt-8"></div>
                <TrendingUp className="w-8 h-8 text-white mb-3" />
                <h3 className="font-semibold text-white mb-1">Average Score</h3>
                <p className="text-3xl font-bold text-white">
                  {exams.filter(e => e.marks !== null).length > 0 
                    ? (exams.filter(e => e.marks !== null).reduce((sum, e) => sum + e.marks, 0) / exams.filter(e => e.marks !== null).length).toFixed(1)
                    : 'N/A'
                  }
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-300"></div>
              </div>

              {/* Highest Score Widget */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
                <Award className="w-8 h-8 text-white mb-3" />
                <h3 className="font-semibold text-white mb-1">Highest Score</h3>
                <p className="text-3xl font-bold text-white">
                  {exams.filter(e => e.marks !== null).length > 0 
                    ? Math.max(...exams.filter(e => e.marks !== null).map(e => e.marks))
                    : 'N/A'
                  }
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-yellow-400"></div>
              </div>

              {/* Grade Distribution Widget */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="absolute top-0 right-0 w-18 h-18 bg-white bg-opacity-10 rounded-full -mr-9 -mt-9"></div>
                <Target className="w-8 h-8 text-white mb-3" />
                <h3 className="font-semibold text-white mb-1">Grade Distribution</h3>
                <div className="flex space-x-1 mt-2">
                  {Object.entries(gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="text-center">
                      <div className="text-xs font-bold text-white">{grade}</div>
                      <div className="text-sm font-semibold text-white opacity-90">{count}</div>
                    </div>
                  ))}
                  {Object.keys(gradeDistribution).length === 0 && (
                    <div className="text-white text-sm opacity-75">No grades yet</div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-cyan-300"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Search and Sort Controls */}
        <div className="flex mb-20 justify-between">
          {/* Search Input */}
          <div className='flex space-x-4'>
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by exam name"
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="exam_name">Sort by Exam Name</option>
                <option value="date">Sort by Date</option>
                <option value="marks">Sort by Marks</option>
              </select>
            </div>
          </div>
          
          {/* Export Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Table */}
        {exams.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No exams found</div>  
            <p className="text-gray-400">You haven't been enrolled in any courses with exams yet.</p>
          </div>
        ) : (
          <TableComponent
            columns={tableColumns}
            data={tableData}
            showBackButton={false}
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Exams;