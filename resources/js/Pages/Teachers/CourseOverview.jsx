import CourseCardTeacher from '@/Components/Teacher Components/CourseCardTeacher';
import React from 'react';

const CourseOverview = () => {
  const courses = [
    { id: 1, title: "FM1478 - Maths", instructor: "Dr. Samdamali" },
    { id: 2, title: "CSE2542 - Software Testing", instructor: "Ms. M M V Senanayake" },
    { id: 3, title: "PHY101 - Physics", instructor: "Dr. Perera" },
    { id: 4, title: "ENG202 - English", instructor: "Prof. Silva" },
    { id: 5, title: "CHEM301 - Chemistry", instructor: "Ms. Fernando" },
    { id: 6, title: "BIO201 - Biology", instructor: "Dr. Wickramasinghe" },
    { id: 7, title: "ICT202 - ICT", instructor: "Ms Somebody" },
    { id: 8, title: "AI202 - Artificial Intelligence", instructor: "Ms. Piumi" },
    { id: 9, title: "CS101 - Computer Science", instructor: "Dr. Mayoori" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-customOrange">All Courses</h1>
      </div>

      
      <div className="bg-white border border-gray-300">
        <h2 className="text-xl font-extrabold text-black mb-4 bg-gray-300 p-2">Course Overview</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
          
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
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

         
          <div className="flex gap-4">
            <select className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-customOrange">
              <option value="all">All</option>
              <option value="now">Now Teaching</option>
              <option value="past">Finished Courses</option>
            </select>
            <select className="border w-max max-w-xs border-gray-300 rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-customOrange">
              <option value="active">Search by last active</option>
              <option value="ascending">Search by ascending</option>
              <option value="descending">Search by descending</option>
            </select>

          </div>
        </div>
      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-10 py-4">
          {courses.map((course) => (
            <CourseCardTeacher key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
