import React from "react";
import ExamCard from "./ExamCard";

const Exams = () => {
  // Dummy Data for Exam Cards
  const exams = [
    {
      id: 1,
      name: "Maths Midterm",
      course: "Maths",
      level: "Grade 10",
      date: "2024-11-30",
      topPerformers: [
        { name: "Alice", img: "https://via.placeholder.com/150" },
        { name: "Bob", img: "https://via.placeholder.com/150" },
        { name: "Charlie", img: "https://via.placeholder.com/150" },
      ],
      totalStudents: 130,
    },
    {
      id: 2,
      name: "Science Final",
      course: "Science",
      level: "Grade 12",
      date: "2024-11-25",
      topPerformers: [
        { name: "Diana", img: "https://via.placeholder.com/150" },
        { name: "Ethan", img: "https://via.placeholder.com/150" },
        { name: "Frank", img: "https://via.placeholder.com/150" },
      ],
      totalStudents: 120,
    },
    {
      id: 3,
      name: "Physics Quiz",
      course: "Physics",
      level: "Grade 11",
      date: "2024-11-15",
      topPerformers: [
        { name: "Grace", img: "https://via.placeholder.com/150" },
        { name: "Henry", img: "https://via.placeholder.com/150" },
        { name: "Ivy", img: "https://via.placeholder.com/150" },
      ],
      totalStudents: 140,
    },
    {
      id: 4,
      name: "ICT Assignment",
      course: "ICT",
      level: "Grade 10",
      date: "2024-11-20",
      topPerformers: [
        { name: "Jack", img: "https://via.placeholder.com/150" },
        { name: "Kara", img: "https://via.placeholder.com/150" },
        { name: "Liam", img: "https://via.placeholder.com/150" },
      ],
      totalStudents: 90,
    },
    {
      id: 5,
      name: "Chemistry Test",
      course: "Chemistry",
      level: "Grade 12",
      date: "2024-12-02",
      topPerformers: [
        { name: "Mia", img: "https://via.placeholder.com/150" },
        { name: "Noah", img: "https://via.placeholder.com/150" },
        { name: "Olivia", img: "https://via.placeholder.com/150" },
      ],
      totalStudents: 110,
    },
    {
      id: 6,
      name: "Biology Midterm",
      course: "Biology",
      level: "Grade 11",
      date: "2024-11-22",
      topPerformers: [
        { name: "Peter", img: "https://via.placeholder.com/150" },
        { name: "Quinn", img: "https://via.placeholder.com/150" },
        { name: "Rachel", img: "https://via.placeholder.com/150" },
      ],
      totalStudents: 100,
    },
    {
      id: 7,
      name: "Geography Quiz",
      course: "Geography",
      level: "Grade 10",
      date: "2024-11-28",
      topPerformers: [
        { name: "Sophia", img: "https://via.placeholder.com/150" },
        { name: "Tom", img: "https://via.placeholder.com/150" },
        { name: "Uma", img: "https://via.placeholder.com/150" },
      ],
      totalStudents: 80,
    },
    {
      id: 8,
      name: "History Final",
      course: "History",
      level: "Grade 12",
      date: "2024-12-05",
      topPerformers: [
        { name: "Victor", img: "https://via.placeholder.com/150" },
        { name: "Wendy", img: "https://via.placeholder.com/150" },
        { name: "Xander", img: "https://via.placeholder.com/150" },
      ],
      totalStudents: 95,
    },
    {
      id: 9,
      name: "Economics Test",
      course: "Economics",
      level: "Grade 11",
      date: "2024-11-18",
      topPerformers: [
        { name: "Yara", img: "https://via.placeholder.com/150" },
        { name: "Zack", img: "https://via.placeholder.com/150" },
        { name: "Aaron", img: "https://via.placeholder.com/150" },
      ],
      totalStudents: 125,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white px-4 py-4">
        <div className="flex justify-end w-full gap-4">
          <div className="relative flex-grow max-w-sm">
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-customOrange"
              placeholder="Search"
            />
          </div>
          <select className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-customOrange">
            <option value="">Sort By</option>
            <option value="date">Last accessed date</option>
            <option value="students">Number of students</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>

      {/* Exam Cards */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {exams.map((exam) => (
            <ExamCard key={exam.id} {...exam} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white py-4 flex justify-end">
        <button className="px-4 py-2 text-white bg-blue-500 rounded-3xl hover:bg-blue-600">
          New Lesson
        </button>
      </div>
    </div>
  );
};

export default Exams;
