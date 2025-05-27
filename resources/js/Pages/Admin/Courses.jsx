import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { BsPlus, BsSearch } from "react-icons/bs"; // Import the search icon
import CreateCourseModal from "@/Components/Admin Components/CreateCourseModal";
import CourseCard from "@/Components/Admin Components/CourseCardAdmin";
import axios from "axios";

const Courses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMethod, setSortMethod] = useState("name"); // Default to sorting by name

  const handleCreateClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Function to handle newly created course
  const handleCourseCreated = (newCourse) => {
    // Add pattern image to the new course
    const courseWithImage = {
      ...newCourse,
      pattern: getOrAssignImage(newCourse.course_id || "")
    };
    
    // Update courses state by adding the new course
    setCourses(currentCourses => [...currentCourses, courseWithImage]);
  };

  // Fetch courses from the backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/courses"); // Update the URL as needed
        const coursesWithImages = response.data.map((course) => ({
          ...course,
          course_id: course.course_id || "",
          course_name: course.course_name || "",
          grade: course.grade || "",
          teacher_id: course.teacher_id || "",
          pattern: getOrAssignImage(course.course_id || ""), // Assign or retrieve image for each course
        }));
        setCourses(coursesWithImages);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
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

  // Filter courses based on search query - with null checks
  const filteredCourses = courses.filter(course => {
    const courseName = (course.course_name || "").toLowerCase();
    const courseId = (course.course_id || "").toLowerCase();
    const courseGrade = (course.grade || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return courseName.includes(query) || 
           courseId.includes(query) || 
           courseGrade.includes(query);
  });
  
  // Sort courses based on the selected method - with null checks
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortMethod === "name") {
      return (a.course_name || "").localeCompare(b.course_name || "");
    } else if (sortMethod === "lastAccessed") {
      // Safely handle potentially missing last_accessed
      const dateA = a.last_accessed ? new Date(a.last_accessed) : new Date(0);
      const dateB = b.last_accessed ? new Date(b.last_accessed) : new Date(0);
      return dateB - dateA;
    } else if(sortMethod === "grade") {
      return (a.grade || "").localeCompare(b.grade || "");
    }
    return 0;
  });

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
                <option value="grade">Sort by grade</option>
                <option value="lastAccessed">Sort by Last Accessed</option>
              </select>
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
          {/* Display No Results Found if no courses match the search query */}
          {filteredCourses.length === 0 ? (
            <div className="p-4 text-gray-500">No results found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {sortedCourses.map((course, index) => (
                <CourseCard
                  key={course.course_id || index}
                  id={course.course_id || ""}
                  title={course.course_name || "Untitled Course"}
                  grade={course.grade || ""}
                  instructor={course.teacher_id ? `${course.teacher_id}` : ""}
                  pattern={course.pattern || patternImages[0]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onCourseCreated={handleCourseCreated} 
      />
    </AuthenticatedLayout>
  );
};

export default Courses;