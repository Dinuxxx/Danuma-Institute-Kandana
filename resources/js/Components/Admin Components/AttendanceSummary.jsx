import React from 'react';
import { Link } from '@inertiajs/react';

const AttendanceSummary = ({ course, grade, teacher, time, present, absent, total_students, course_id }) => {
  // Format the time to remove seconds
  const formattedTime = time.split(' - ').map(t => t.substring(0, 5)).join(' - ');
  
  return (
    <div className="bg-orange-50 border border-gray-200 rounded-lg p-4 shadow-md">
      <div className='text-center'>
        <h3 className="text-lg font-semibold">{course} - Grade {grade}</h3>
        <p className="text-sm text-gray-600">{teacher}</p>
        <p className="text-sm text-gray-600">{formattedTime}</p>
      </div>
      <div className="flex justify-between items-center my-4">
        <div className="text-center relative">
          <div className="relative">
            <span className="text-xl font-bold text-green-600">{present}%</span>
            {present >= 90 && (
              <span className="absolute -top-3 -right-3 text-lg">🌟</span>
            )}
          </div>
          <div className="h-1 w-full bg-gray-200 mt-2 rounded">
            <div 
              className="h-1 bg-green-600 rounded" 
              style={{ width: `${present}%` }}
            />
          </div>
          <p className="text-sm mt-1">Present</p>
        </div>
        <div className="text-center relative">
          <div className="relative">
            <span className="text-xl font-bold text-red-600">{absent}%</span>
            {absent >= 30 && (
              <span className="absolute -top-3 -right-3 text-lg">⚠️</span>
            )}
          </div>
          <div className="h-1 w-full bg-gray-200 mt-2 rounded">
            <div 
              className="h-1 bg-red-600 rounded" 
              style={{ width: `${absent}%` }}
            />
          </div>
          <p className="text-sm mt-1">Absent</p>
        </div>
      </div>
      <div className="block text-center">
        <button className="bg-orange-500 text-white py-2 px-4 rounded-full w-full hover:bg-orange-600">
          Total Students: {total_students}
        </button>
      </div>
    </div>
  );
};

export default AttendanceSummary;