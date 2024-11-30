import React, { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Dropdown from '@/Components/Dropdown'; // Import your Dropdown component

const CourseCardTeacher = ({ course }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev); // Toggle dropdown visibility
  };

  return (
    <div className="relative bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      {/* Header with the background image */}
      <div
        className="h-24 bg-gray-200"
        style={{ backgroundImage: "url('/path-to-pattern.png')", backgroundSize: 'cover' }}
      ></div>

      {/* Course information */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-customOrange">{course.title}</h3>
        <p className="text-gray-700">{course.instructor}</p>
      </div>

      {/* Three dots button and dropdown */}
      <div className="absolute top-2 right-2">
        <button
          onClick={handleDropdownToggle} // Toggle dropdown on click
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <BsThreeDotsVertical className="h-5 w-5" />
        </button>

        {/* Conditional rendering of the Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md border">
            <div className="py-1">
              <button
                onClick={() => {
                  console.log('Start the Course'); // Replace with your logic
                  setDropdownOpen(false); // Close dropdown after action
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Start the Course
              </button>
              <button
                onClick={() => {
                  console.log('Remove from View'); // Replace with your logic
                  setDropdownOpen(false); // Close dropdown after action
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Remove from View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCardTeacher;
