import LessonCardStudent from '@/Components/Student Components/LessonCardStudent';
import React from 'react';

const StudentLessons = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 sticky top-0 bg-white px-4 py-4 shadow-sm">
        <h1 className="text-3xl font-bold text-customOrange mb-4 md:mb-0">Course</h1>
        
        
        <div className="relative w-full md:w-1/4">
          <input
            type="text"
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-customOrange"
            placeholder="Search"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
      </div>

      
      <div className="space-y-4">
        <LessonCardStudent />
        <LessonCardStudent />
        <LessonCardStudent />
        <LessonCardStudent />
        <LessonCardStudent />
        <LessonCardStudent />
      </div>
    </div>
  );
};

export default StudentLessons;
