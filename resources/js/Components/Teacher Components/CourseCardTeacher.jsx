import React from "react";
import { Link } from "@inertiajs/react";

const CourseCardTeacher = ({ id, title, grade, pattern }) => {
  return (
    <Link href={`/teacher/courses/${id}`}>
      <div className="relative bg-white shadow-md rounded-lg overflow-hidden flex flex-col bg-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
        <div
          className="h-32 w-full"
          style={{
            backgroundImage: `url(${pattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="p-4 text-left">
          <h3 className="text-orange-500 font-bold text-lg hover:underline">
            {id} - {title}
          </h3>
          <p className="text-gray-600">{grade}</p>
        </div>
      </div>
    </Link>
  );
};

export default CourseCardTeacher;