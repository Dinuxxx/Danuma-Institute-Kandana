import LessonCardTeacher from '@/Components/Teacher Components/LessonCardTeacher';
import React from 'react';

const TeacherLessons = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white px-4 py-4">
        <h1 className="text-3xl font-bold text-customOrange">Course - Class</h1>
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

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <LessonCardTeacher />
        <LessonCardTeacher />
        <LessonCardTeacher />
        <LessonCardTeacher />
        <LessonCardTeacher />
        <LessonCardTeacher />
      </div>

      <div className="sticky bottom-0 bg-white py-4 flex justify-end">
        <button className="px-4 py-2 text-white bg-blue-500 rounded-3xl hover:bg-blue-600">
          New Lesson
        </button>
      </div>
    </div>
  );
};

export default TeacherLessons;
