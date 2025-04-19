import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BsPlus } from 'react-icons/bs';

const CreateCourseModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    teacherId: '',
    grade: '',
    courseFee: '',
    courseDesc: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear the error message when the user starts typing again
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset errors before submitting
    try {
      const response = await axios.post('/courses', formData);
      console.log('Course created:', response.data);
      onClose();
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Failed to create course. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        subjectCode: '',
        subjectName: '',
        teacherId: '',
        grade: '',
        courseFee: '',
        courseDesc: '',
      });
      setErrors({}); // Reset errors when modal opens
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-2/3">
        <div className="flex justify-between items-center mb-6 bg-orange-100 p-4 rounded-t-2xl px-8">
          <h2 className="text-2xl font-bold text-orange-500">Create new course</h2>
          <button onClick={onClose} className="text-gray-600 font-bold hover:text-red-500 text-xl">
            X
          </button>
        </div>
        <form className="p-8 md:pl-12" onSubmit={handleSubmit}>
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <div>
              <label className="block font-medium mb-2">Subject Code</label>
              <input
                type="text"
                name="subjectCode"
                value={formData.subjectCode}
                onChange={handleChange}
                className={`max-w-xs w-full border p-2 rounded mb-1 ${errors.subjectCode ? 'border-red-500' : 'border-gray-400'}`}
                placeholder="Input text"
              />
              {errors.subjectCode && <p className="text-red-500 text-sm">{errors.subjectCode}</p>}
            </div>
            <div>
              <label className="block font-medium mb-2">Subject Name</label>
              <input
                type="text"
                name="subjectName"
                value={formData.subjectName}
                onChange={handleChange}
                className={`md:max-w-xs w-full border p-2 rounded mb-1 ${errors.subjectName ? 'border-red-500' : 'border-gray-400'}`}
                placeholder="Input text"
              />
              {errors.subjectName && <p className="text-red-500 text-sm">{errors.subjectName}</p>}
            </div>
            <div>
              <label className="block font-medium mb-2">Teacher's ID</label>
              <input
                type="text"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                className="md:max-w-xs w-full border border-gray-400 p-2 rounded mb-4 md:mb-0"
                placeholder="Input text"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Add Grade</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`max-w-xs w-full border p-2 rounded mb-1 ${errors.grade ? 'border-red-500' : 'border-gray-400'}`}
                placeholder="Input text"
              />
              {errors.grade && <p className="text-red-500 text-sm">{errors.grade}</p>}
            </div>
            <div>
              <label className="block font-medium mb-2">Course Fee</label>
              <input
                type="text"
                name="courseFee"
                value={formData.courseFee}
                onChange={handleChange}
                className="max-w-xs w-full border border-gray-400 p-2 rounded mb-4 md:mb-0"
                placeholder="Input text"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-medium mb-2">Add Course Description</label>
              <textarea
                name="courseDesc"
                value={formData.courseDesc}
                onChange={handleChange}
                className="max-w-sm w-full border border-gray-400 p-2 rounded mb-4 md:mb-0"
                placeholder="Rich text editor."
                rows="4"
              ></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-2 py-2 rounded-md font-bold flex items-center justify-center"
            >
              <div className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full border-2 mr-2">
                <BsPlus size={32} className="stroke-1" />
              </div>
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;
