import React from "react";
import { Link } from "@inertiajs/react";

const CourseCardTeacher = ({ id, title, grade, pattern }) => {
  return (
    <div className="relative bg-white shadow-md rounded-lg overflow-hidden flex flex-col bg-blue-200">
      <div
        className="h-32 w-full"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="p-4 text-left">
        <Link
          href={`/teacher/courses/${id}`}
          className="text-orange-500 font-bold text-lg hover:underline"
        >
          {id} - {title}
        </Link>
        <p className="text-gray-600">{grade}</p>
      </div>
    </div>
  );
};

export default CourseCardTeacher;