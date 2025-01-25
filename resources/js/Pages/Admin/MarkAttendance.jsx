import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import Header from '@/Components/Header';
import Sidebar from '@/Components/Sidebar';
import { Head } from '@inertiajs/react';

const MarkAttendance = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  
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
        <Head title="Mark Attendance" />
        <div className="flex flex-col h-screen">
          {/* Fixed Header */}
          <header
            className={`bg-white shadow-md px-6 pt-4 fixed top-20 md:top-24 z-10 transition-all duration-300 ${
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
                    activeTab === 'scan' ? 'text-black border-b-4 border-blue-500' : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('scan')}
                >
                  Scan QR
                </button>
                <button
                  className={`text-lg font-semibold ${
                    activeTab === 'manual' ? 'text-black border-b-4 border-blue-500' : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('manual')}
                >
                  Manual Marking
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pt-36 pb-16 px-6 overflow-y-auto bg-gray-50">
            {activeTab === 'scan' && (
              <div>

              </div>
            )}
            {activeTab === 'manual' && (
              <div>

              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default MarkAttendance