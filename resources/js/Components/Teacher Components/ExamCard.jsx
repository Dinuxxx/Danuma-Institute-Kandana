import React from "react";

const ExamCard = ({ name, course, level, date, topPerformers, totalStudents }) => {
  return (
    <div className="bg-customCream p-6 rounded-xl shadow-lg space-y-6 flex flex-col justify-center items-center max-w-md px-24">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-800">{name} - {course}</h1>
        <p className="text-xl text-gray-600">{level}</p>
        <p className="text-xl text-gray-600">{date}</p>
      </div>
      <div className="flex justify-between items-center w-full px-6 border-t border-b border-gray-300 py-4">
        {topPerformers.map((performer, index) => (
          <div key={index} className="flex flex-col justify-center items-center space-y-1">
            <img
              src={performer.img}
              alt={`${index + 1} place`}
              className="w-14 h-14 rounded-full shadow-md"
            />
            <p className="text-sm font-medium text-gray-700">{index + 1}st</p>
          </div>
        ))}
      </div>
      <div className="text-center bg-customOrange text-white p-2 rounded-lg px-6">
        <h1>{totalStudents}</h1>
      </div>
    </div>
  );
};

export default ExamCard;
