import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { BsSearch } from "react-icons/bs"; // Import the search icon
import axios from "axios";
import CourseCardTeacher from "@/Components/Teacher Components/CourseCardTeacher";
import { Link } from "@inertiajs/react"; // Add Link for redirection

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMethod, setSortMethod] = useState("name"); // Default to sorting by name
  const [isLoading, setIsLoading] = useState(true);

  // Fetch teacher's courses from the backend
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/teacher/courses/list"); // Use the new endpoint
        const coursesWithImages = response.data.map((course) => ({
          ...course,
          pattern: getOrAssignImage(course.course_id), // Assign or retrieve image for each course
        }));
        setCourses(coursesWithImages);
      } catch (error) {
        console.error("Error fetching teacher courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherCourses();
  }, []);

  // List of available pattern images
  const patternImages = [
    "/images/CourseCardImages/CoursePattern01.jpg",
    "/images/CourseCardImages/CoursePattern02.jpg",
    "/images/CourseCardImages/CoursePattern03.jpg",
    "/images/CourseCardImages/CoursePattern04.jpg",
    "/images/CourseCardImages/CoursePattern05.jpg",
    "/images/CourseCardImages/CoursePattern06.jpg",
  ];

  const getOrAssignImage = (courseId) => {
    const storedImages = JSON.parse(localStorage.getItem("courseImages")) || {};
    if (!storedImages[courseId]) {
      const randomImage = getRandomImage();
      storedImages[courseId] = randomImage;
      localStorage.setItem("courseImages", JSON.stringify(storedImages));
    }
    return storedImages[courseId];
  };

  // Function to get a random image
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * patternImages.length);
    return patternImages[randomIndex];
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course =>
    course.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort courses based on the selected method
  const sortedCourses = filteredCourses.sort((a, b) => {
    if (sortMethod === "name") {
      return a.course_name.localeCompare(b.course_name);
    } else if (sortMethod === "lastAccessed") {
      // Assuming 'last_accessed' is a date string or timestamp
      return new Date(b.last_accessed) - new Date(a.last_accessed);
    }
    return 0;
  });

  return (
    <AuthenticatedLayout>
      <Head title="My Courses" />
      <div className="p-4">
        <h1 className="md:text-3xl text-2xl font-bold text-orange-500 md:mb-12 mb-8">
          My Courses
        </h1>
        <div className="border-2 border-gray-300">
          <h1 className="md:text-2xl text-xl font-bold bg-gray-300 p-2 pl-6">
            Course Overview
          </h1>
          <div className="flex p-8 justify-between">
            <div className="flex gap-4">
              {/* Search Box with Icon */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 border-2 rounded-md pl-8" // Added padding-left for icon space
                />
                <BsSearch
                  size={20}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value)}
                className="p-2 md:pr-8 border-2 rounded-md"
              >
                <option value="name">Sort by Course Name</option>
                <option value="lastAccessed">Sort by Last Accessed</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center">Loading courses...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              {searchQuery ? "No results found" : "You have no assigned courses"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {sortedCourses.map((course) => (
                <Link key={course.course_id} href={`/teacher/courses/${course.course_id}`}>
                  <CourseCardTeacher
                    id={course.course_id}
                    title={course.course_name}
                    grade={`Grade ${course.grade}`}
                    pattern={course.pattern}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Courses;