import React, { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Dropdown from '@/Components/Dropdown'; // Import your Dropdown component

const CourseCardTeacher = ({ course }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev); 
  };

  return (
    <div className="relative bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden h-full">
     
      <div
        className="h-48 bg-gray-200"
        style={{ backgroundImage: "url('/path-to-pattern.png')", backgroundSize: 'cover' }}
      ></div>

      
      <div className="px-4 py-10">
        <a href="#" className="text-2xl font-bold text-customOrange">{course.title}</a>
        <p className="text-gray-700">{course.instructor}</p>
      </div>

     
      <div className="absolute top-2 right-2">
        <button
          onClick={handleDropdownToggle} 
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <BsThreeDotsVertical className="h-5 w-5" />
        </button>

        
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md border">
            <div className="py-1">
              <button
                onClick={() => {
                  console.log('Start the Course'); 
                  setDropdownOpen(false); 
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Start the Course
              </button>
              <button
                onClick={() => {
                  console.log('Remove from View'); 
                  setDropdownOpen(false); 
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
