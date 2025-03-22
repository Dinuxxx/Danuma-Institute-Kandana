import React, { useState, useEffect } from 'react';

const AttendanceQR = () => {
  const [course, setCourse] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Get the current date
    const today = new Date();
    // Format the date as dd-mm-yyyy
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const handleCheckIn = () => {
    console.log('Checked in:', { course, checkInTime });
    // Additional check-in logic would go here
  };

  const handleCheckOut = () => {
    console.log('Checked out:', { course, checkOutTime });
    // Additional check-out logic would go here
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-amber-50 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-6 gap-8">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-300">
              <img
                src="/api/placeholder/96/96"
                alt="Student profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="text-left">
            <h2 className="text-lg font-semibold">Name</h2>
            <p className="text-base">Grade</p>
            <p className="text-sm text-gray-600">Stu-Id</p>
            <p className="text-sm text-gray-600">{currentDate}</p> {/* Display the current date here */}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
            Course
          </label>
          <input
            type="text"
            id="course"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-1">
            Check In Time
          </label>
          <div className="relative">
            <input
              type="time"
              id="checkInTime"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
            />
          </div>
        </div>

        <div className="relative mb-4">
          <div className="absolute -top-[2px] left-[110px] transform -translate-x-1/2">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 mb-1">
            Check out Time
          </label>
          <div className="relative">
            <input
              type="time"
              id="checkOutTime"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button 
            onClick={handleCheckIn}
            className="flex-1 bg-gray-200 text-blue-600 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Check-In
          </button>
          <button 
            onClick={handleCheckOut}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Check-Out
          </button>
        </div>
      </div>
      
      <button className="absolute bottom-6 right-6 bg-amber-100 text-amber-800 h-10 w-10 rounded-full flex items-center justify-center shadow-md hover:bg-amber-200 transition-colors">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
};

export default AttendanceQR;
