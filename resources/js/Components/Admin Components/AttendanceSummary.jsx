import React from 'react';
import { Link } from '@inertiajs/react';

const AttendanceSummary = ({ course, grade, teacher, time, present, absent, total_students, course_id }) => {
  return (
    <div className="bg-orange-50 border border-gray-200 rounded-lg p-4 shadow-md">
      <div className='text-center'>
        <h3 className="text-lg font-semibold">{course} - Grade {grade}</h3>
        <p className="text-sm text-gray-600">{teacher}</p>
        <p className="text-sm text-gray-600">{time}</p>
      </div>
      <div className="flex justify-between items-center my-4">
        <div className="text-center">
          <span className="text-xl font-bold text-green-600">{present}%</span>
          <p className="text-sm">Present</p>
        </div>
        <div className="text-center">
          <span className="text-xl font-bold text-red-600">{absent}%</span>
          <p className="text-sm">Absent</p>
        </div>
      </div>
      <Link href={`/admin/courses/${course_id}`} className="block text-center">
        <button className="bg-orange-500 text-white py-2 px-4 rounded-full w-full hover:bg-orange-600">
          Total Students: {total_students}
        </button>
      </Link>
    </div>
  );
};

export default AttendanceSummary;