import React, { useState } from 'react';
import Header from '@/Components/Header';
import Sidebar from '@/Components/Sidebar';
import { Head } from '@inertiajs/react';
import AttendanceSummary from '@/Components/Admin Components/AttendanceSummary';
import AttendanceList from '@/Components/Admin Components/AttendanceList';

const Attendance = () => {
  const mockData = [
    { course: 'COURSE', grade: 'GRADE', teacher: 'Teacher', time: 'Scheduled Time', present: 68, absent: 32 },
    { course: 'COURSE', grade: 'GRADE', teacher: 'Teacher', time: 'Scheduled Time', present: 68, absent: 32 },
    { course: 'COURSE', grade: 'GRADE', teacher: 'Teacher', time: 'Scheduled Time', present: 68, absent: 32 },
    { course: 'COURSE', grade: 'GRADE', teacher: 'Teacher', time: 'Scheduled Time', present: 68, absent: 32 },
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // Track the active tab

  return (
    <div className="min-h-screen bg-white flex">
      <Header />
      <div className="fixed top-16 md:top-20 left-0 transition-all duration-300">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 mt-20 md:mt-24`}
      >
        <Head title="Attendance" />
        <div className="flex flex-col h-screen">
          {/* Fixed Header */}
          <header
            className={`bg-white shadow-md px-6 py-4 fixed top-20 md:top-24 z-10 transition-all duration-300 ${
              isSidebarOpen ? 'left-64' : 'left-20'
            }`}
            style={{
              width: isSidebarOpen ? 'calc(100% - 16rem)' : 'calc(100% - 5rem)', // Adjust width based on sidebar
            }}
          >
            <div className="">
              {/* Tabs */}
              <div className="flex space-x-6">
                <button
                  className={`text-lg font-semibold ${
                    activeTab === 'summary' ? 'text-black border-b-4 border-blue-500' : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('summary')}
                >
                  Attendance Summary
                </button>
                <button
                  className={`text-lg font-semibold ${
                    activeTab === 'list' ? 'text-black border-b-4 border-blue-500' : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('list')}
                >
                  Attendance List
                </button>
              </div>

              {/* Date and Button */}
              {activeTab === 'summary' && (
              <div className="flex items-center space-x-4 justify-between md:mt-4">
                <input
                  type="date"
                  className="border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                  Mark Attendance
                </button>
              </div>)}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pt-36 pb-16 px-6 overflow-y-auto bg-gray-50">
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockData.map((data, index) => (
                  <AttendanceSummary key={index} {...data} />
                ))}
              </div>
            )}
            {activeTab === 'list' && <AttendanceList />}
          </main>

          {/* Footer */}
          {activeTab === 'summary' && (
          <footer className="flex items-center justify-between bg-white shadow-md px-6 py-4 fixed bottom-0 left-0 right-0 z-10">
            <button className="bg-gray-200 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-300">{'<'}</button>
            <span className="text-gray-600">2024/08/24</span>
            <button className="bg-gray-200 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-300">{'>'}</button>
          </footer>)}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
