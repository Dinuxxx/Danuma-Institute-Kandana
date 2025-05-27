import React from 'react';

const TeacherCard = ({ name, image }) => {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-105 w-full max-w-sm">
      <div className="w-40 h-40 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
        {image ? (
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full"
          />
        ) : (
          <svg
            className="w-20 h-20 text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-800">{name || 'Teacher Name'}</h2>
      <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mt-4"></div>
    </div>
  );
};

export default TeacherCard;
