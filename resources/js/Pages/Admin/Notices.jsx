import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CreateNotice from '@/Components/Admin Components/CreateNotice';
import TableComponent from '@/Components/TableComponent';
import axios from 'axios';
import Modal from '@/Components/Admin Components/Modal';

const Notices = ({ auth, initialNotices = [] }) => {
  const [notices, setNotices] = useState(initialNotices || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    details: '',
    visibility: []
  });
  
  // Delete confirmation modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingNoticeId, setDeletingNoticeId] = useState(null);

  // Fetch notices on component mount
  useEffect(() => {
    // If we already have notices from server-side props, just stop loading
    if (Array.isArray(initialNotices) && initialNotices.length > 0) {
      setLoading(false);
    } else {
      fetchNotices();
    }
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timestamp to prevent caching
      const response = await axios.get(`/admin/notices?_=${new Date().getTime()}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          setNotices(response.data);
        } else if (typeof response.data === 'object') {
          // Try to find any array in the response
          const possibleNotices = Object.values(response.data).find(val => Array.isArray(val));
          if (possibleNotices) {
            setNotices(possibleNotices);
          } else {
            console.error('No array found in response:', response.data);
            setError('Response format not recognized.');
            setNotices([]);
          }
        } else {
          console.error('Unexpected response type:', typeof response.data);
          setError('Unexpected response format.');
          setNotices([]);
        }
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      setError(`Failed to load notices: ${error.message}`);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNoticeCreated = () => {
    fetchNotices();
  };
  
  // Handle showing delete confirmation modal
  const showDeleteConfirmation = (id) => {
    setDeletingNoticeId(id);
    setDeleteModalOpen(true);
  };
  
  // Handle actual deletion after confirmation
  const confirmDelete = async () => {
    try {
      setLoading(true);
      
      const response = await axios.delete(`/admin/notices/${deletingNoticeId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });
      
      console.log('Delete response:', response.data);
      
      // Close modal and refresh notices
      setDeleteModalOpen(false);
      fetchNotices();
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert(`Failed to delete notice: ${error.message}`);
      setLoading(false);
      setDeleteModalOpen(false);
    }
  };
  
  // Handle opening edit modal and setting form data
  const handleShowEditModal = (notice) => {
    setEditingNotice(notice);
    setEditForm({
      title: notice.title || '',
      details: notice.details || '',
      visibility: notice.visibility || []
    });
    setEditModalOpen(true);
  };
  
  // Handle edit form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle visibility checkbox changes
  const handleVisibilityChange = (value) => {
    setEditForm(prev => {
      // If visibility is a string, convert to array first
      let currentVisibility = prev.visibility;
      if (typeof currentVisibility === 'string') {
        try {
          currentVisibility = JSON.parse(currentVisibility);
        } catch {
          currentVisibility = [currentVisibility];
        }
      }
      
      if (!Array.isArray(currentVisibility)) {
        currentVisibility = [];
      }
      
      // Toggle the value
      if (currentVisibility.includes(value)) {
        return {
          ...prev,
          visibility: currentVisibility.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          visibility: [...currentVisibility, value]
        };
      }
    });
  };
  
  // Handle form submission for updating a notice
  const handleUpdateNotice = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('details', editForm.details);
      
      // Handle visibility array
      if (Array.isArray(editForm.visibility)) {
        editForm.visibility.forEach(item => {
          formData.append('visibility[]', item);
        });
      } else if (typeof editForm.visibility === 'string') {
        formData.append('visibility[]', editForm.visibility);
      }
      
      // If there's a file in the edit form
      if (editForm.attachment && editForm.attachment instanceof File) {
        formData.append('attachment', editForm.attachment);
      }
      
      // Add _method field for Laravel to recognize as PUT request
      formData.append('_method', 'PUT');
      
      const response = await axios.post(`/admin/notices/${editingNotice.id}`, formData, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Update response:', response.data);
      
      // Close modal and refresh notices
      setEditModalOpen(false);
      fetchNotices();
    } catch (error) {
      console.error('Error updating notice:', error);
      alert(`Failed to update notice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to safely access nested properties
  const getNestedValue = (obj, path, defaultValue = '') => {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : defaultValue;
    }, obj);
  };

  // Format visibility to exclude "All" and just display "Students" and/or "Teachers"
  const formatVisibility = (visibility) => {
    if (!visibility) return 'Not specified';
    
    let visibilityArray = [];
    if (typeof visibility === 'string') {
      try {
        visibilityArray = JSON.parse(visibility);
      } catch {
        visibilityArray = [visibility];
      }
    } else if (Array.isArray(visibility)) {
      visibilityArray = visibility;
    } else if (typeof visibility === 'object') {
      visibilityArray = Object.values(visibility);
    }
    
    // Filter out "All" and return just "Students" and/or "Teachers"
    return visibilityArray
      .filter(item => item !== 'All')
      .join(' / ') || 'Not specified';
  };

  const columns = ['#', 'Title', 'Description', 'Attachment', 'Audience', 'Actions'];
  
  // Pagination calculation
  const totalPages = Math.ceil(notices.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, notices.length);
  const paginatedNotices = notices.slice(startIndex, endIndex);
  
  const tableData = paginatedNotices.map((notice, index) => ({
    '#': startIndex + index + 1,
    'Title': getNestedValue(notice, 'title', 'Untitled'),
    'Description': getNestedValue(notice, 'details', 'No description'),
    'Attachment': notice.attachment ? (
      <a href={`/storage/${notice.attachment}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
        View Attachment
      </a>
    ) : 'No attachment',
    'Audience': formatVisibility(notice.visibility),
    'Actions': (
      <div className="flex space-x-4 justify-center">
        <button 
          className="text-blue-500 hover:text-blue-700 p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
          onClick={() => handleShowEditModal(notice)}
          title="Edit Notice"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          className="text-red-500 hover:text-red-700 p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-200"
          onClick={() => showDeleteConfirmation(notice.id)}
          title="Delete Notice"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    )
  }));

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  return (
    <AuthenticatedLayout auth={auth}>
      <Head title="Notices" />
      <div className="p-4">
        <CreateNotice onNoticeCreated={handleNoticeCreated} />
        
        <div className="mt-8">
          <div className="border-b text-gray-600 text-sm font-medium pb-2 w-fit ml-8">
            Manage Notice
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-8">
              {error}
              <button 
                className="bg-red-700 text-white px-2 py-1 rounded ml-4"
                onClick={() => fetchNotices()}
              >
                Retry
              </button>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-4">Loading notices...</div>
          ) : notices.length > 0 ? (
            <>
              <div className="flex justify-end items-center mb-20 px-8">
                <label className="mr-2 text-sm text-gray-600">Rows per page:</label>
                <select 
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="border rounded px-2 py-1 bg-white text-gray-700 w-16"
                >
                  {[5, 10, 25].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <TableComponent columns={columns} data={tableData} />
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 px-8">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {endIndex} of {notices.length} entries
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded bg-white text-gray-700 disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded ${
                          page === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded bg-white text-gray-700 disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No notices found. Create one to get started.
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal show={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-center mb-4">Delete Confirmation</h3>
          <p className="text-gray-600 text-center mb-6">
            Do you want to delete this notice? This action cannot be undone.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              No, Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Edit Notice Modal */}
      <Modal show={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium border-b pb-2 mb-4">Edit Notice</h3>
          
          <form onSubmit={handleUpdateNotice}>
            <div className="mb-4">
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                id="edit-title"
                name="title"
                value={editForm.title}
                onChange={handleEditFormChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="edit-details" className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                id="edit-details"
                name="details"
                value={editForm.details}
                onChange={handleEditFormChange}
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <div className="flex space-x-4">
                {['Students', 'Teachers', 'All'].map(option => {
                  // Determine if this option is checked
                  let isChecked = false;
                  
                  if (Array.isArray(editForm.visibility)) {
                    isChecked = editForm.visibility.includes(option);
                  } else if (typeof editForm.visibility === 'string') {
                    try {
                      const visArray = JSON.parse(editForm.visibility);
                      isChecked = Array.isArray(visArray) && visArray.includes(option);
                    } catch {
                      isChecked = editForm.visibility === option;
                    }
                  }
                  
                  return (
                    <label key={option} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleVisibilityChange(option)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
              <div className="flex items-center">
                {editingNotice?.attachment && (
                  <span className="text-sm text-gray-600 mr-2">
                    Current: <a href={`/storage/${editingNotice.attachment}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View</a>
                  </span>
                )}
                <input
                  type="file"
                  name="attachment"
                  onChange={(e) => setEditForm(prev => ({ ...prev, attachment: e.target.files[0] }))}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Leave empty to keep current attachment</p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Update Notice
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
};

export default Notices;