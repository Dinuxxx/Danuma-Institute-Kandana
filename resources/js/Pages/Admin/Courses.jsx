import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { BsPlus } from "react-icons/bs";
import CreateCourseModal from "@/Components/Admin Components/CreateCourseModal";
import CourseCard from "@/Components/CourseCard";

const Courses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Hardcoded course data (replace with backend data later)
  const courses = [
    { id: 1, title: "FM1478 - Maths", instructor: "Dr. Samdamali", pattern: "/images/pattern1.png" },
    { id: 2, title: "CS101 - Programming", instructor: "Dr. Smith", pattern: "/images/pattern2.png" },
    { id: 3, title: "EN202 - Literature", instructor: "Dr. Emily", pattern: "/images/pattern3.png" },
    { id: 4, title: "PH303 - Physics", instructor: "Dr. Newton", pattern: "/images/pattern4.png" },
    { id: 5, title: "CH404 - Chemistry", instructor: "Dr. Curie", pattern: "/images/pattern5.png" },
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Courses" />
      <div className="p-4">
        <h1 className="md:text-3xl text-2xl font-bold text-orange-500 md:mb-12 mb-8">
          All Courses
        </h1>
        <div className="border-2 border-gray-300">
          <h1 className="md:text-2xl text-xl font-bold bg-gray-300 p-2 pl-6">
            Course Overview
          </h1>
          <div className="flex p-8 justify-between">
            <div className="flex gap-4">
              <div className="p-2 border-2">Search</div>
              <div className="p-2 border-2">Filter</div>
              <div className="p-2 border-2">Sort</div>
            </div>
            <button
              onClick={handleCreateClick}
              className="text-white bg-blue-600 font-bold p-2 rounded-md flex items-center justify-center px-2 py-2"
            >
              <div className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full border-2 mr-2">
                <BsPlus size={32} className="stroke-1" />
              </div>
              Create
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                instructor={course.instructor}
                pattern={course.pattern}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </AuthenticatedLayout>
  );
};

export default Courses;
