import React from 'react';
import Header from '@/Components/Header';
import Sidebar from '@/Components/Sidebar';
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

const Exams = () => {
  const { props } = usePage();
  const user = props.auth.user;
  const userRole = user?.role || 'admin'; // Default to 'admin' if role is undefined
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('exams');

  return (
      <div className="min-h-screen bg-white flex">
          <Header />
          <div className="fixed top-16 md:top-20 left-0 transition-all duration-300">
              <Sidebar 
                  isOpen={isSidebarOpen} 
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                  role={userRole} // Pass role to Sidebar
              />
          </div>

          {/* Main Content Area */}
        <div
        className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 mt-20 md:mt-24`}
        >
        <Head title="Exams" />
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
                      activeTab === 'exams' ? 'text-black border-b-4 border-blue-500' : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('exams')}
                  >
                    Exams
                  </button>
                  <button
                    className={`text-lg font-semibold ${
                      activeTab === 'performance' ? 'text-black border-b-4 border-blue-500' : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('performance')}
                  >
                    Student Performance
                  </button>
                </div>

                {/* Date and Button */}
                {activeTab === 'performance' && (
                <div className="flex items-center space-x-4 justify-between md:mt-4">
                  <input
                    type="date"
                    className="border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>)}
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-36 pb-16 px-6 overflow-y-auto bg-gray-50">
              {activeTab === 'exams' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                </div>
              )}
            </main>

            {/* Footer */}
            {activeTab === 'performance' && (
            <footer className="flex items-center justify-between bg-white shadow-md px-8 py-4 fixed bottom-0 right-0 z-10">
              <button className="bg-gray-200 text-gray-600 py-2 px-4 rounded-lg hover:bg-orange-300">{'<'}</button>
              <span className="text-orange-600 font-bold px-4">2024/08/24</span>
              <button className="bg-gray-200 text-gray-600 py-2 px-4 rounded-lg hover:bg-orange-300">{'>'}</button>
            </footer>)}
          </div>
        </div>
      </div>
  );
}

export default Exams