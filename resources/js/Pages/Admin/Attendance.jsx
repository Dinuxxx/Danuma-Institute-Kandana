import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import Header from '@/Components/Header';
import Sidebar from '@/Components/Sidebar';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AttendanceSummary from '@/Components/Admin Components/AttendanceSummary';
import AttendanceList from '@/Components/Admin Components/AttendanceList';
import axios from 'axios';

const Attendance = () => {
  const { props } = usePage();
  const user = props.auth.user;
  const userRole = user?.role || 'admin'; // Default to 'admin' if role is undefined
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // Track the active tab
  const [summaryData, setSummaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    fetchAttendanceSummary(currentDate);
  }, [currentDate]);

  const fetchAttendanceSummary = async (date) => {
    setIsLoading(true);
    try {
      const response = await axios.get('/admin/attendance/summary', {
        params: { date }
      });
      setSummaryData(response.data.summaries);
      setFormattedDate(response.data.formatted_date);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setCurrentDate(e.target.value);
  };

  const navigateDate = (direction) => {
    const date = new Date(currentDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Header />
      <div className="fixed top-16 md:top-20 left-0 transition-all duration-300">
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          role={userRole}
        />
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
                  value={currentDate}
                  onChange={handleDateChange}
                  className="border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                  <Link href="/admin/attendance/mark-attendance">
                    Mark Attendance
                  </Link>
                </button>
              </div>)}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-6 overflow-y-auto bg-gray-50 mt-36">
            {activeTab === 'summary' && (
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-xl text-gray-500">Loading...</div>
                  </div>
                ) : summaryData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summaryData.map((data, index) => (
                      <AttendanceSummary key={index} {...data} />
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-xl text-gray-500">No classes scheduled for this day</div>
                  </div>
                )}
              </>
            )}
            {activeTab === 'list' && <AttendanceList />}
          </main>

          {/* Footer */}
          {activeTab === 'summary' && (
          <footer className="flex items-center justify-between bg-white shadow-md px-8 py-4 fixed bottom-0 right-0 z-10">
            <button 
              className="bg-gray-200 text-gray-600 py-2 px-4 rounded-lg hover:bg-orange-300"
              onClick={() => navigateDate('prev')}>
              {'<'}
            </button>
            <span className="text-orange-600 font-bold px-4">{formattedDate}</span>
            <button 
              className="bg-gray-200 text-gray-600 py-2 px-4 rounded-lg hover:bg-orange-300"
              onClick={() => navigateDate('next')}>
              {'>'}
            </button>
          </footer>)}
        </div>
      </div>
    </div>
  );
};

export default Attendance;