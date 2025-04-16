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

  // Fetch users with filters from backend
  const fetchUsers = () => {
    setLoading(true);
    axios
      .get("/users/search", {
        params: {
          search: searchTerm,
          role: roleFilter,
          sort: sortBy,
          limit: rowsPerPage, // Add rowsPerPage to API request
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
            <AiFillDelete className="text-red-600 cursor-pointer text-lg" />
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
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">
                      {selectedUsers.length} selected
                    </span>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users?`)) {
                          console.log("Delete users with IDs:", selectedUsers);
                          // Implement actual deletion here
                          setSelectedUsers([]);
                        }
                      }}
                    >
                      Delete
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
      </div>
    </AuthenticatedLayout>
  );
};

export default Users;