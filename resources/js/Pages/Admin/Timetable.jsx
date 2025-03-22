import React, { useState } from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import TableComponent from '@/Components/TableComponent';


const Timetable = () => {
  const columns = ["Subject Code", "Subject Name", "Day", "Start Time", "End Time", "Option"];
  
  // Create empty data rows to match the image
  const defaultData = Array(8).fill().map(() => ({
    "Subject Code": "",
    "Subject Name": "",
    "Day": "",
    "Start Time": "",
    "End Time": "",
    "Option": (
      <div className="flex space-x-2">
        <button className="text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button className="text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    )
  }));

  const [data, setData] = useState(defaultData);
  return (
    <AuthenticatedLayout>
        <Head title="Timetable" />
        <div className="p-4">
          {/* Header and controls */}
          <h1 className="text-2xl font-bold text-orange-400 mb-4">Time Table</h1>
          
          <div className="relative mb-6 ml-8">
            <select className="bg-blue-500 font-bold text-white py-2 px-4 rounded-lg border-none w-[14%] appearance-none pr-8">
              <option>Select Grade</option>
            </select>
            <div className="absolute right-2 top-3 text-white pointer-events-none">
              <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-3 mb-4 mx-16 items-center">
            <div className="flex gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter search terms" 
                  className="border border-gray-300 rounded py-2 px-3 w-full"
                />
                <button className="absolute right-2 top-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 21L16.65 16.65" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <select className="border border-gray-300 rounded py-2 px-4 w-28">
                <option>All</option>
              </select>
              
              <select className="border border-gray-300 rounded py-2 px-4 w-40">
                <option>Sort by Day</option>
              </select>
            </div>
            
            <button className="bg-blue-500 text-white pl-2 pr-4 py-2 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span className="font-bold">ADD</span>
            </button>
          </div>
          
          {/* Use the provided TableComponent */}
          <div className="mt-24">
          <TableComponent 
            columns={columns}
            data={data}
          />
          </div>
        </div>
      </AuthenticatedLayout>
  )
}

export default Timetable