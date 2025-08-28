import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus, X } from 'lucide-react';
import ExamCard from '@/Components/Teacher Components/ExamCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Exams = ({ exams = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filteredExams, setFilteredExams] = useState(exams);
  const [showModal, setShowModal] = useState(false);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newExam, setNewExam] = useState({
    name: '',
    grade: '',
    date: ''
  });

  const notifySuccess = (message) =>
      toast.success(message, {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progressClassName: "bg-green-500",
          className: "border border-green-600 rounded-lg shadow-md",
          style: { backgroundColor: "#ebfeee" },
      });

  const notifyError = (message) =>
      toast.error(message, {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progressClassName: "bg-red-500",
          className: "border border-red-600 rounded-lg shadow-md",
          style: { backgroundColor: "#fcf0f0" },
      });

  // Configure axios defaults
  useEffect(() => {
    // Set CSRF token for axios
    const token = document.querySelector('meta[name="csrf-token"]');
    if (token) {
      axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  }, []);

  // Initialize filtered exams when exams prop changes
  useEffect(() => {
    setFilteredExams(exams);
  }, [exams]);

  // Fetch teacher's grades when modal opens
  useEffect(() => {
    if (showModal) {
      fetchTeacherGrades();
    }
  }, [showModal]);

  const fetchTeacherGrades = async () => {
    try {
      const response = await axios.get('/teacher/registered-grades');
      
      if (response.data && response.data.grades) {
        // Filter out "All Students" option for exam creation
        const filteredGrades = response.data.grades.filter(grade => grade !== 'All Students');
        setGrades(filteredGrades);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      setErrors({ general: 'Failed to fetch grades. Please try again.' });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = exams.filter(exam =>
      exam.name.toLowerCase().includes(term) ||
      exam.course.toLowerCase().includes(term) ||
      exam.level.toLowerCase().includes(term)
    );
    
    setFilteredExams(filtered);
  };

  const handleSort = (value) => {
    setSortBy(value);
    
    const sorted = [...filteredExams].sort((a, b) => {
      switch (value) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'students':
          return b.totalStudents - a.totalStudents;
        default:
          return 0;
      }
    });
    
    setFilteredExams(sorted);
  };

  const handleNewExamClick = () => {
    setShowModal(true);
    setErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewExam({ name: '', grade: '', date: '' });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExam(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post('/teacher/exams', newExam);

      if (response.data && response.data.success) {
        notifySuccess("Exam successfully created!");
        setTimeout(() => {    
          // Refresh the page to show the new exam
          router.visit('/teacher/exams', {
            method: 'get',
            preserveState: false,
            onSuccess: () => {
              setShowModal(false);
              setNewExam({ name: '', grade: '', date: '' });
            }
          });
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error creating exam:', error);
      
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        if (status === 422 && data.errors) {
          // Validation errors
          setErrors(data.errors);
        } else if (status === 404) {
          setErrors({ general: data.error || 'No course found for the selected grade.' });
        } else if (status === 403) {
          setErrors({ general: data.error || 'You are not authorized to perform this action.' });
        } else if (status >= 500) {
          setErrors({ general: 'Server error. Please try again later.' });
        } else {
          setErrors({ general: data.error || 'Failed to create exam. Please try again.' });
        }
      } else if (error.request) {
        // Network error
        setErrors({ general: 'Network error. Please check your connection and try again.' });
      } else {
        // Other error
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="">
        <div className="p-4 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="md:text-3xl text-2xl font-bold text-orange-500 md:mb-8 mb-4">
              Exams
            </h1>
            <div className="flex space-x-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter course/exam name"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
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
                  <option value="date">Sort By Date</option>
                  <option value="name">Sort By Name</option>
                  <option value="students">Sort By Students</option>
                </select>
              </div>
            </div>
          </div>

          {/* Exam Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>

          {/* New Exam Button */}
          <div className="fixed bottom-6 right-6">
            <button 
              onClick={handleNewExamClick}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Exam</span>
            </button>
          </div>

          {/* Empty State */}
          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No exams found</h3>
              <p className="text-gray-500">Try adjusting your search terms or create a new exam.</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Create New Exam</h2>
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
                    Exam Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newExam.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter exam name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <select
                    name="grade"
                    value={newExam.grade}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.grade ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a grade</option>
                    {grades.map((grade, index) => (
                      <option key={index} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  {errors.grade && (
                    <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.grade) ? errors.grade[0] : errors.grade}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newExam.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.date) ? errors.date[0] : errors.date}</p>
                  )}
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
                    {loading ? 'Creating...' : 'Create Exam'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </AuthenticatedLayout>
  );
};

export default Exams;