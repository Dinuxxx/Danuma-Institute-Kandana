import React from 'react';
import { router } from '@inertiajs/react';

const ExamCard = ({ exam }) => {
  const handleTotalStudentsClick = () => {
    router.visit(`/teacher/exams/${exam.id}/marks`);
  };

  return (
    <div className="bg-orange-50 rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-gray-800 text-md mb-1">
          {exam.name.toUpperCase()}
        </h3>
        <p className="text-gray-600 text-sm">{exam.level.toUpperCase()}</p>
        <p className="text-gray-600 text-sm">{exam.date}</p>
      </div>
      
      <div className="flex justify-center items-end mb-4 space-x-2">
        {/* 2nd Place */}
        {exam.studentAvatars[1] && (
          <div className="flex flex-col items-center">
            <img
              src={exam.studentAvatars[1]}
              alt="2nd Place"
              className="w-10 h-10 rounded-full border-2 border-silver shadow-sm"
            />
            <span className="text-xs font-medium text-gray-600 mt-1">2nd</span>
          </div>
        )}
        
        {/* 1st Place - Larger and in the middle */}
        {exam.studentAvatars[0] && (
          <div className="flex flex-col items-center">
            <img
              src={exam.studentAvatars[0]}
              alt="1st Place"
              className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow-sm"
            />
            <span className="text-xs font-medium text-yellow-600 mt-1">1st</span>
          </div>
        )}
        
        {/* 3rd Place */}
        {exam.studentAvatars[2] && (
          <div className="flex flex-col items-center">
            <img
              src={exam.studentAvatars[2]}
              alt="3rd Place"
              className="w-8 h-8 rounded-full border-2 border-orange-400 shadow-sm"
            />
            <span className="text-xs font-medium text-gray-600 mt-1">3rd</span>
          </div>
        )}
        
        {/* Additional students indicator */}
        {exam.totalStudents > 3 && (
          <div className="flex flex-col items-center ml-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
              +{exam.totalStudents - 3}
            </div>
            <span className="text-xs text-gray-500 mt-1">more</span>
          </div>
        )}
      </div>
      
      <button 
        onClick={handleTotalStudentsClick}
        className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium py-2 px-4 rounded-full transition-colors duration-200 text-sm"
      >
        Total Students : {exam.totalStudents}
      </button>
    </div>
  );
};

export default ExamCard;