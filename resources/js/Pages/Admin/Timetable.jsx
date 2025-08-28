import React, { useState, useEffect } from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import TableComponent from "@/Components/TableComponent";
import CreateTimetable from "@/Components/Admin Components/CreateTimetable";
import EditTimetable from "@/Components/Admin Components/EditTimetable";

const Timetable = ({ timetables, courses }) => {
  const columns = ["Subject Code", "Subject Name", "Day", "Classroom No.", "Start Time", "End Time", "Option"];
  
  // State variables
  const [selectedGrade, setSelectedGrade] = useState("");
  const [filteredTimetables, setFilteredTimetables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState(""); 
  const [filterOption, setFilterOption] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTimetableEntry, setSelectedTimetableEntry] = useState(null);
  const [localTimetables, setLocalTimetables] = useState([]);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null
  });

  // Initialize local timetables with the prop value
  useEffect(() => {
    setLocalTimetables(timetables);
  }, [timetables]);

  // Extract unique grades from courses and sort them in ascending order
  const grades = [...new Set(courses?.map(course => course.grade) || [])]
    .sort((a, b) => {
      // Convert to numbers for numerical sorting if they're numeric grades
      const numA = parseInt(a);
      const numB = parseInt(b);
      
      // If both are valid numbers, sort numerically
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // Otherwise sort alphabetically
      return a.localeCompare(b);
    });
  
  // Process the timetable data when grade or filters change
  useEffect(() => {
    if (!selectedGrade) {
      // Return empty array when no grade is selected
      setFilteredTimetables([]);
      return;
    }

    // Filter timetables based on selected grade
    let filtered = localTimetables.filter(entry => 
      entry.course.grade === selectedGrade
    );

    // Apply search filter if search term exists
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.course.course_id.toLowerCase().includes(term) || 
        entry.course.course_name.toLowerCase().includes(term) ||
        entry.day_of_week.toLowerCase().includes(term)
      );
    }

    // Apply day filter if not set to "All"
    if (filterOption !== "All") {
      filtered = filtered.filter(entry => 
        entry.day_of_week === filterOption
      );
    }

    // Apply sorting
    if (sortOption === "day") {
      const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      filtered.sort((a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week));
    } else if (sortOption === "time") {
      filtered.sort((a, b) => a.start_time.localeCompare(b.start_time));
    } else if (sortOption === "subject") {
      filtered.sort((a, b) => a.course.course_name.localeCompare(b.course.course_name));
    }

    // Format data for table
    const formattedData = filtered.map(entry => ({
      "Subject Code": entry.course.course_id,
      "Subject Name": entry.course.course_name,
      "Day": entry.day_of_week,
      "Classroom No.": entry.classroom_no,
      "Start Time": formatTime(entry.start_time),
      "End Time": formatTime(entry.end_time),
      "Option": (
        <div className="flex justify-center gap-4">
          <button 
            className="text-blue-500"
            onClick={() => handleEditClick(entry)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button 
            className="text-red-500"
            onClick={() => handleDeleteClick(entry.ttable_id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      )
    }));

    setFilteredTimetables(formattedData);
  }, [selectedGrade, localTimetables, searchTerm, filterOption, sortOption]);

  // Format time from 24h to 12h format
  const formatTime = (timeString) => {
    if (!timeString) return "";
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Handle grade selection
  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
  };

  // Handle edit button click - open edit modal
  const handleEditClick = (timetableEntry) => {
    setSelectedTimetableEntry(timetableEntry);
    setIsEditModalOpen(true);
  };

  // Close edit modal function
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTimetableEntry(null);
  };

  // Handle updated timetable entry
  const handleUpdateSuccess = (updatedEntry) => {
    setLocalTimetables(currentTimetables => 
      currentTimetables.map(entry => 
        entry.ttable_id === updatedEntry.ttable_id ? updatedEntry : entry
      )
    );
  };

  // Handle new timetable creation
  const handleCreateSuccess = (newEntry) => {
    setLocalTimetables(currentTimetables => [...currentTimetables, newEntry]);
  };

  // Handle delete button click - open confirmation dialog
  const handleDeleteClick = (id) => {
    setDeleteConfirmation({
      isOpen: true,
      id: id
    });
  };

  // Handle actual deletion - Using Inertia router for better Laravel integration
  const handleDelete = () => {
    if (!deleteConfirmation.id) return;
    
    // Use Inertia router to handle the delete request
    router.delete(`/admin/time-tables/${deleteConfirmation.id}`, {
      onSuccess: () => {
        // Update local state after successful deletion
        setLocalTimetables(currentTimetables => 
          currentTimetables.filter(entry => entry.ttable_id !== deleteConfirmation.id)
        );
        setDeleteConfirmation({
          isOpen: false,
          id: null
        });
      },
      onError: () => {
        alert('Failed to delete the timetable entry.');
        setDeleteConfirmation({
          isOpen: false,
          id: null
        });
      }
    });
  };

  // Cancel delete action
  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      id: null
    });
  };

  // Handle add new entry
  const handleAddClick = () => {
    setIsModalOpen(true);
  };
  
  // Close modal function to pass to the CreateTimetable component
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Timetable" />
      <div className="p-4">
        {/* Header and controls */}
        <h1 className="md:text-3xl text-2xl font-bold text-orange-500 mb-4">Time Table</h1>
        
        <div className="relative mb-6 ml-8">
          <select 
            className="bg-blue-500 font-bold text-white py-2 px-4 rounded-lg border-none w-[14%] appearance-none pr-8"
            value={selectedGrade}
            onChange={handleGradeChange}
          >
            <option value="">Select Grade</option>
            {grades.map((grade, index) => (
              <option key={index} value={grade}>{grade}</option>
            ))}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="absolute right-2 top-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <select 
              className="border border-gray-300 rounded py-2 px-4 w-28"
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
            
            <select 
              className="border border-gray-300 rounded py-2 px-4 w-40"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="day">Sort by Day</option>
              <option value="time">Sort by Time</option>
              <option value="subject">Sort by Subject</option>
            </select>
          </div>
          
          <button 
            className={`${selectedGrade ? 'bg-blue-500' : 'bg-gray-400 cursor-not-allowed'} text-white pl-2 pr-4 py-2 rounded-lg flex items-center gap-2`}
            disabled={!selectedGrade}
            onClick={handleAddClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span className="font-bold">ADD</span>
          </button>
          
          {/* Render Create modal conditionally */}
          {isModalOpen && (
            <CreateTimetable 
              closeModal={closeModal} 
              selectedGrade={selectedGrade}
              courses={courses.filter(course => course.grade === selectedGrade)}
              onSuccess={handleCreateSuccess}
            />
          )}
          
          {/* Render Edit modal conditionally */}
          {isEditModalOpen && selectedTimetableEntry && (
            <EditTimetable 
              closeModal={closeEditModal}
              timetableEntry={selectedTimetableEntry}
              courses={courses.filter(course => course.grade === selectedTimetableEntry.course.grade)}
              onSuccess={handleUpdateSuccess}
            />
          )}
        </div>
        
        {/* Empty state message when no grade is selected */}
        {!selectedGrade && (
          <div className="text-center text-gray-500 mt-10">
            Please select a grade to view the timetable
          </div>
        )}
        
        {/* Table component - show table only when there's data or grade is selected */}
        {selectedGrade && (
          <div className="md:mt-24 mt-20">
            <TableComponent 
              columns={columns}
              data={filteredTimetables}
            />
            {filteredTimetables.length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                No timetable entries found for the selected grade
              </div>
            )}
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96 transform transition-all duration-300 ease-in-out">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Confirmation</h3>
                <p className="text-gray-600 text-center mb-6">Are you sure you want to delete this timetable entry? This action cannot be undone.</p>
                <div className="flex space-x-4 w-full">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </AuthenticatedLayout>
  );
};

export default Timetable;