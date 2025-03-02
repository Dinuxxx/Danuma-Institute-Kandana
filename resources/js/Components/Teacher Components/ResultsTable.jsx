import React from "react";

const ResultsTable = () => {
  const results = [
    {
      id: 1,
      studentID: "S001",
      name: "John Doe",
      exam: "Midterm",
      date: "2024-12-01",
      course: "Maths",
      marks: 85,
      grade: "A",
      rank: 1,
    },
    {
      id: 2,
      studentID: "S002",
      name: "Jane Smith",
      exam: "Midterm",
      date: "2024-12-01",
      course: "Science",
      marks: 78,
      grade: "B",
      rank: 2,
    },
    // Add more data as needed
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200 text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">
              <input type="checkbox" />
            </th>
            <th className="border border-gray-300 px-4 py-2">Student ID</th>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Exam</th>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Course</th>
            <th className="border border-gray-300 px-4 py-2">Marks</th>
            <th className="border border-gray-300 px-4 py-2">Grade</th>
            <th className="border border-gray-300 px-4 py-2">Rank</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">
                <input type="checkbox" />
              </td>
              <td className="border border-gray-300 px-4 py-2">{result.studentID}</td>
              <td className="border border-gray-300 px-4 py-2">{result.name}</td>
              <td className="border border-gray-300 px-4 py-2">{result.exam}</td>
              <td className="border border-gray-300 px-4 py-2">{result.date}</td>
              <td className="border border-gray-300 px-4 py-2">{result.course}</td>
              <td className="border border-gray-300 px-4 py-2">{result.marks}</td>
              <td className="border border-gray-300 px-4 py-2">{result.grade}</td>
              <td className="border border-gray-300 px-4 py-2">{result.rank}</td>
              <td className="border border-gray-300 px-4 py-2 flex gap-2">
                {/* Edit Button */}
                <button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-blue-500 hover:text-blue-700"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 3.487c.637-.637 1.53-.881 2.322-.7l1.58.36c.991.226 1.816 1.05 2.042 2.042l.36 1.58c.18.793-.063 1.685-.7 2.322L9.526 22.289a2.528 2.528 0 01-1.125.667l-5.25 1.36c-.584.152-1.14-.405-.988-.988l1.36-5.25a2.528 2.528 0 01.667-1.125L16.862 3.487z"
                    />
                  </svg>
                </button>

                {/* Delete Button */}
                <button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-red-500 hover:text-red-700"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
