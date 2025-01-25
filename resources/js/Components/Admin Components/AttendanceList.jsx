import React, { useState } from "react";
import Timetable from "../Timetable";

const AttendanceList = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");

  const columns = [
    "S_id",
    "Name",
    "Grade",
    "Date",
    "Course",
    "Check-In Time",
    "Check-Out Time",
    "Status",
    "Option",
  ];

  const data = [
    // Example data
    {
      S_id: "101",
      Name: "John Doe",
      Grade: "A",
      Date: "2025-01-23",
      Course: "Math",
      "Check-In Time": "08:00 AM",
      "Check-Out Time": "03:00 PM",
      Status: "Present",
      Option: (
        <div className="flex gap-2">
          <button className="text-red-500 hover:underline">🗑️</button>
          <button className="text-blue-500 hover:underline">✏️</button>
        </div>
      ),
    },
    // Add more rows here
  ];

  return (
    <div className="p-4">
      {/* Search and Filter Section */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <input
            type="text"
            placeholder="Enter Student id/name"
            className="border border-gray-300 rounded-lg p-2 w-[200px]"
          />
        </div>
        <div className="flex gap-4 items-center">
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-[200px]"
            />
          </div>
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-[200px]"
            >
              <option value="">Select Course</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
            </select>
          </div>
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-[200px]"
            >
              <option value="">Select Grade</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timetable Component */}
      <div className="mt-20">
        <Timetable columns={columns} data={data} />
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-red-500 font-semibold">n selected</div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Print
          </button>
          <button className="px-2 py-1 border rounded-lg hover:bg-gray-200">⬅️</button>
          <div>1/10</div>
          <button className="px-2 py-1 border rounded-lg hover:bg-gray-200">➡️</button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceList;
