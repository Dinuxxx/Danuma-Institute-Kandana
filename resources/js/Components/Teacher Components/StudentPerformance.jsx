import React from 'react';
import PrimaryButton from '../PrimaryButton';
import ResultsTable from './ResultsTable';

const StudentPerformance = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white px-4 py-4">
        <div className="relative flex-grow max-w-sm">
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
        <div className="flex gap-4 items-center">
          
          <input
            type="date"
            className="border border-gray-300 rounded-lg p-2 px-4 focus:outline-none focus:ring-2 focus:ring-customOrange"
          />

         
          <select className="border border-gray-300 rounded-lg p-2 px-8 focus:outline-none focus:ring-2 focus:ring-customOrange">
            <option value="">Select Course</option>
            <option value="maths">Maths</option>
            <option value="science">Science</option>
            <option value="physics">Physics</option>
            <option value="ICT">ICT</option>
            <option value="chemistry">Chemistry</option>
          </select>

          
          <select className="border border-gray-300 rounded-lg p-2 px-8 focus:outline-none focus:ring-2 focus:ring-customOrange">
            <option value="">Select Grade</option>
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
            <option value="d">D</option>
            <option value="f">F</option>
          </select>

          
          <button className="bg-blue-500 rounded-3xl hover:bg-blue-600 text-white py-2 px-4">
            Record result
          </button>
        </div>
      </div>
      <div>
        <ResultsTable/>
      </div>
      <div>

      </div>
    </div>
  );
};

export default StudentPerformance;
