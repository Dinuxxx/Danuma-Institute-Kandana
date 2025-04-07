import React, { useState, useEffect } from "react";
import axios from 'axios';

const EditTimetable = ({ closeModal, timetableEntry, courses }) => {
  const [formData, setFormData] = useState({
    day_of_week: timetableEntry.day_of_week || "",
    start_time: timetableEntry.start_time || "",
    end_time: timetableEntry.end_time || "",
    course_id: timetableEntry.course_id || "",
    classroom_no: timetableEntry.classroom_no || "",
    subject_name: timetableEntry.course?.course_id || ""
  });
  
  const [error, setError] = useState("");

  useEffect(() => {
    // Pre-populate the form with existing values
    setFormData({
      day_of_week: timetableEntry.day_of_week || "",
      start_time: timetableEntry.start_time || "",
      end_time: timetableEntry.end_time || "",
      course_id: timetableEntry.course_id || "",
      classroom_no: timetableEntry.classroom_no || "",
      subject_name: timetableEntry.course?.course_id || ""
    });
  }, [timetableEntry]);

  // Filter courses for the selected grade
  const availableCourses = courses || [];

  // Organize courses for dropdowns
  const subjectCodes = availableCourses.map(course => ({
    value: course.course_id,
    label: course.course_id
  }));

  const subjectNames = availableCourses.map(course => ({
    value: course.course_id,
    label: course.course_name
  }));

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(""); // Clear any previous errors
    
    setFormData(prevData => {
      const newData = { ...prevData, [name]: value };
      
      // If subject code changes, update subject name
      if (name === "course_id") {
        const selectedCourse = availableCourses.find(course => course.course_id === value);
        if (selectedCourse) {
          newData.subject_name = selectedCourse.course_id;
        }
      }
      
      // If subject name changes, update subject code
      if (name === "subject_name") {
        newData.course_id = value;
      }
      
      return newData;
    });
  };

  // Handle form submission for update
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate end time is after start time
    if (formData.start_time >= formData.end_time) {
      setError("End time must be after start time");
      return;
    }
    
    // Prepare data for submission
    const submissionData = {
      day_of_week: formData.day_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time,
      course_id: formData.course_id,
      classroom_no: formData.classroom_no
    };
    
    // Get CSRF token from meta tag if using Laravel
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    // Send data to backend using axios
    axios.put(`/timetable/${timetableEntry.ttable_id}`, submissionData, {
      headers: {
        'X-CSRF-TOKEN': token
      }
    })
      .then(response => {
        closeModal();
        window.location.reload();
      })
      .catch(error => {
        console.error("Error updating timetable:", error);
        
        // Display detailed error messages if available
        if (error.response && error.response.data && error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).flat().join(", ");
          setError(errorMessages);
        } else {
          setError("Failed to update timetable entry. Please try again.");
        }
      });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-orange-100 p-6 rounded-t-2xl">
          <h2 className="text-3xl font-bold text-orange-400 mb-0">
            Edit Timetable - Grade {timetableEntry.course?.grade}
          </h2>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-700 font-medium text-lg mb-2">Subject Code</label>
                <div className="relative">
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    required
                  >
                    <option value="">Select Subject Code</option>
                    {subjectCodes.map(code => (
                      <option key={code.value} value={code.value}>
                        {code.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium text-lg mb-2">Subject Name</label>
                <div className="relative">
                  <select
                    name="subject_name"
                    value={formData.course_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    required
                  >
                    <option value="">Select Subject Name</option>
                    {subjectNames.map(subject => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium text-lg mb-2">Classroom No.</label>
              <input
                type="text"
                name="classroom_no"
                value={formData.classroom_no}
                onChange={handleChange}
                className="w-full md:w-1/3 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                placeholder="Input text"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium text-lg mb-2">Day</label>
              <div className="relative">
                <select
                  name="day_of_week"
                  value={formData.day_of_week}
                  onChange={handleChange}
                  className="w-full md:w-1/3 border border-gray-300 rounded-lg p-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  required
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-700 font-medium text-lg mb-2">Start Time</label>
                <div className="relative">
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium text-lg mb-2">End Time</label>
                <div className="relative">
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2.5 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-md transition duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Update Table
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTimetable;