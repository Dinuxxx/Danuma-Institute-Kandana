import React, { useState, useEffect } from 'react';
import { Search, Edit, X, Trash2 } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TableComponent from '@/Components/TableComponent'; // Updated import
import axios from 'axios';
import { router } from '@inertiajs/react';

const ExamMarks = ({ exam }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('student_name');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [examData, setExamData] = useState(exam || null);

  // Grade calculation function
  const calculateGrade = (marks) => {
    if (marks >= 85) return 'A+';
    if (marks >= 75) return 'A';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 35) return 'S';
    return 'W';
  };

  // Fetch exam students data from backend
  const fetchExamStudents = async () => {
    if (!examData?.id) return;
    
    try {
      setDataLoading(true);
      const response = await axios.get(`/teacher/exams/${examData.id}/students`);
      
      if (response.data.success) {
        setStudents(response.data.students || []);
        setExamData(response.data.exam);
      }
    } catch (error) {
      console.error('Error fetching exam students:', error);
      // Handle error - show notification or fallback
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchExamStudents();
  }, [examData?.id]);

  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = students.filter(student =>
      student.student_name.toLowerCase().includes(term) ||
      student.registration_id.toString().toLowerCase().includes(term)
    );
    
    setFilteredStudents(filtered);
  };

  const handleSort = (value) => {
    setSortBy(value);
    
    const sorted = [...filteredStudents].sort((a, b) => {
      switch (value) {
        case 'student_name':
          return a.student_name.localeCompare(b.student_name);
        case 'student_id':
          return a.student_id.localeCompare(b.student_id);
        case 'grade':
          if (!a.grade && !b.grade) return 0;
          if (!a.grade) return 1;
          if (!b.grade) return -1;
          return a.grade.localeCompare(b.grade);
        case 'rank':
          if (!a.rank && !b.rank) return 0;
          if (!a.rank) return 1;
          if (!b.rank) return -1;
          return a.rank - b.rank;
        default:
          return 0;
      }
    });
    
    setFilteredStudents(sorted);
  };

  const handleEditMarks = (student) => {
    setSelectedStudent(student);
    setMarks(student.marks || '');
    setShowModal(true);
    setErrors({});
  };

  const handleDeleteMarks = async (student) => {
    if (!confirm(`Are you sure you want to delete marks for ${student.student_name}?`)) {
      return;
    }

    try {
      // Since there's no specific delete marks endpoint, we'll set marks to null/0
      await axios.post(`/teacher/exams/${examData.id}/marks`, {
        student_id: student.student_id,
        marks: 0 // or handle this differently based on your backend logic
      });

      // Refresh the data
      await fetchExamStudents();
    } catch (error) {
      console.error('Error deleting marks:', error);
      alert('Failed to delete marks. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setMarks('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate marks
    const marksValue = parseFloat(marks);
    if (isNaN(marksValue) || marksValue < 0 || marksValue > 100) {
      setErrors({ marks: 'Marks must be a number between 0 and 100' });
      setLoading(false);
      return;
    }

    try {
      // Save marks to backend
      const response = await axios.post(`/teacher/exams/${examData.id}/marks`, {
        student_id: parseInt(selectedStudent.student_id),
        marks: marksValue
      });

      if (response.data.success) {
        // Refresh the students data to get updated marks and ranks
        await fetchExamStudents();
        
        // Close modal
        setShowModal(false);
        setSelectedStudent(null);
        setMarks('');
        
        // Show success message (you can implement a toast notification here)
        alert('Marks saved successfully!');
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Failed to save marks. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Prepare table data
  const tableColumns = ['Student ID', 'Student Name', 'Marks', 'Grade', 'Rank', 'Options'];
  
  const tableData = filteredStudents.map(student => ({
    'Student ID': student.registration_id, // Display registration_id instead of student_id
    'Student Name': student.student_name,
    'Marks': student.marks !== null && student.marks !== undefined ? student.marks : '--',
    'Grade': student.grade || '--',
    'Rank': student.rank || '--',
    'Options': (
      <div className="flex space-x-4 justify-center">
        <button
          onClick={() => handleEditMarks(student)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded text-sm"
          title="Edit Marks"
        >
          <Edit className="w-4 h-4" />
        </button>
        {(student.marks !== null && student.marks !== undefined) && (
          <button
            onClick={() => handleDeleteMarks(student)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded text-sm"
            title="Delete Marks"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }));

  const handleBack = () => {
    //window.history.back();
    router.visit('/teacher/exams');
  };

  if (dataLoading) {
    return (
      <AuthenticatedLayout>
        <div className="p-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading exam data...</div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!examData) {
    return (
      <AuthenticatedLayout>
        <div className="p-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Exam data not found.</div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-orange-500 mb-2">
                {examData.name} - Marks Entry
              </h1>
              <p className="text-gray-600">
                {examData.course} • {examData.level} • {examData.date}
              </p>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex space-x-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by student name or registration ID"
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
                <option value="student_name">Sort by Name</option>
                <option value="registration_id">Sort by Registration ID</option>
                <option value="grade">Sort by Grade</option>
                <option value="rank">Sort by Rank</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table - Using the new TableComponent */}
        <TableComponent
          columns={tableColumns}
          data={tableData}
          onBack={handleBack}
        />

        {/* Marks Edit Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Marks</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* General Error Message */}
              {errors.general && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.general}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration ID
                  </label>
                  <input
                    type="text"
                    value={selectedStudent.registration_id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={selectedStudent.student_name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.marks ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter marks"
                  />
                  {errors.marks && (
                    <p className="mt-1 text-sm text-red-600">{errors.marks}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={marks ? calculateGrade(parseFloat(marks)) : ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                    placeholder="Auto-calculated"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rank
                  </label>
                  <input
                    type="text"
                    value="Auto-calculated after saving"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Marks'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default ExamMarks;