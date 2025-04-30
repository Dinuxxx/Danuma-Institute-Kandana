import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import RoleDropdown from "@/Components/Admin Components/RoleDropdown";
import TableComponent from "@/Components/TableComponent";
import { BsPencilSquare } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("day");
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(25); // Default rows per page
  const [selectedUsers, setSelectedUsers] = useState([]); // State for selected rows
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [deleteLoading, setDeleteLoading] = useState(false); // Loading state for delete operations
  
  // Added states for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    type: null, // 'single' or 'multiple'
    id: null,
  });

  // Fetch users with filters from backend
  const fetchUsers = () => {
    setLoading(true);
    axios
      .get("/users/search", {
        params: {
          search: searchTerm,
          role: roleFilter,
          sort: sortBy,
          limit: rowsPerPage,
        },
      })
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Real-time search - fetch data whenever filters change
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce time of 500ms for search input

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, roleFilter, sortBy, rowsPerPage]);

  // Toggle selection of a single user
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Select/deselect all users
  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      const allUserIds = paginatedUsers.map(user => user.id);
      setSelectedUsers(allUserIds);
    }
  };

  // Show delete confirmation for a single user
  const confirmDeleteUser = (userId) => {
    setDeleteTarget({ type: 'single', id: userId });
    setShowDeleteDialog(true);
  };

  // Show delete confirmation for multiple users
  const confirmBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    setDeleteTarget({ type: 'multiple', id: selectedUsers });
    setShowDeleteDialog(true);
  };

  // Delete a single user
  const handleDeleteUser = async (userId) => {
    setDeleteLoading(true);
    try {
      await axios.delete('/admin/users/delete', {
        data: { id: userId }
      });
      
      // Remove the user from the UI
      setUsers(prev => prev.filter(user => user.id !== userId));
      // Remove from selected users if present
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      
      // Show success message
      const successToast = document.createElement('div');
      successToast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
      successToast.textContent = 'User deleted successfully';
      document.body.appendChild(successToast);
      setTimeout(() => successToast.remove(), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      // Show error message
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
      errorToast.textContent = 'Failed to delete user';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  // Delete multiple users
  const handleBulkDelete = async (userIds) => {
    setDeleteLoading(true);
    try {
      await axios.delete('/admin/users/delete', {
        data: { ids: userIds }
      });
      
      // Remove the users from the UI
      setUsers(prev => prev.filter(user => !userIds.includes(user.id)));
      // Clear selection
      setSelectedUsers([]);
      
      // Show success message
      const successToast = document.createElement('div');
      successToast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
      successToast.textContent = `${userIds.length} users deleted successfully`;
      document.body.appendChild(successToast);
      setTimeout(() => successToast.remove(), 3000);
    } catch (error) {
      console.error('Error deleting users:', error);
      // Show error message
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
      errorToast.textContent = 'Failed to delete users';
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 3000);
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  // Proceed with delete based on type
  const handleConfirmDelete = () => {
    if (deleteTarget.type === 'single') {
      handleDeleteUser(deleteTarget.id);
    } else if (deleteTarget.type === 'multiple') {
      handleBulkDelete(deleteTarget.id);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteTarget({ type: null, id: null });
  };

  // Pagination calculation
  const totalPages = Math.ceil(users.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, users.length);
  const paginatedUsers = Array.isArray(users) 
    ? users.slice(startIndex, endIndex) 
    : [];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Checkbox for table header (select all)
  const SelectAllCheckbox = () => (
    <div className="flex justify-center">
      <input
        type="checkbox"
        checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
        onChange={toggleSelectAll}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </div>
  );

  // Column definition with checkbox column
  const columns = ["Select", "ID", "Name", "Type", "Registered Date", "Option"];

  const enhancedData = Array.isArray(paginatedUsers)
    ? paginatedUsers.map((user) => ({
        Select: (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.id)}
              onChange={() => toggleUserSelection(user.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={deleteLoading}
            />
          </div>
        ),
        ID: user.id,
        Name: user.name,
        Type: user.role || "No Role",
        "Registered Date": new Date(user.created_at).toLocaleDateString('en-GB'),
        Option: (
          <div className="flex items-center justify-center gap-4">
            <BsPencilSquare className="text-blue-600 cursor-pointer text-lg" />
            <AiFillDelete 
              className="text-red-600 cursor-pointer text-lg hover:text-red-800 transition-colors duration-300" 
              onClick={() => confirmDeleteUser(user.id)}
              style={{ opacity: deleteLoading ? 0.5 : 1 }}
            />
          </div>
        ),
      }))
    : [];

  return (
    <AuthenticatedLayout>
      <Head title="Users" />
      <div className="p-4">
        <h1 className="md:text-3xl text-2xl font-bold text-orange-500 md:mb-12 mb-8">
          Users
        </h1>
        <div>
          <div className="mb-4 flex justify-between px-6 md:px-12">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Enter search terms"
                  className="border border-gray-300 px-4 py-2 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <select
                className="border border-gray-300 px-4 py-2 rounded-lg md:w-28"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All users</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
              <select
                className="border border-gray-300 px-4 py-2 rounded-lg"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="day">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="id">Sort by ID</option>
              </select>
            </div>
            <RoleDropdown />
          </div>
          <div className="md:mt-8">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between mb-4 px-6 md:px-12">
                  <div className="flex items-center gap-2 md:mb-16 ml-auto">
                    <span className="text-gray-600">Rows per page:</span>
                    <select
                      className="border border-gray-300 px-3 py-1 rounded-lg md:w-16"
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Reset to first page when changing rows per page
                      }}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                <TableComponent columns={columns} data={enhancedData} />
                {/* Show bulk action button when rows are selected */}
                {selectedUsers.length > 0 && (
                  <div className="flex items-center mt-4 px-6">
                    <span className="mr-2 text-gray-600">
                      {selectedUsers.length} selected
                    </span>
                    <button
                      className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200 ${
                        deleteLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={confirmBulkDelete}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? "Deleting..." : "Delete Selected"}
                    </button>
                  </div>
                )}
                
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 px-8">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {endIndex} of {users.length} entries
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded bg-white text-gray-700 disabled:bg-gray-200 disabled:text-gray-400"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else {
                          if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 border rounded ${
                              pageNum === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
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
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all scale-100 animate-fade-in">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 text-center mb-6">
                {deleteTarget.type === 'single' 
                  ? "Are you sure you want to delete this user? This action cannot be undone."
                  : `Are you sure you want to delete ${deleteTarget.id.length} users? This action cannot be undone.`
                }
              </p>
              <div className="flex justify-between gap-4">
                <button
                  onClick={handleCancelDelete}
                  className="w-1/2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="w-1/2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Users;