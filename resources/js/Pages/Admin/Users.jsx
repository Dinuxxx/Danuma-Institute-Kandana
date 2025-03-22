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
  
  // Fetch users from backend
  useEffect(() => {
    axios.get("http://localhost:8000/admin/users")  // Change this URL if needed
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => console.error("Error fetching users:", error));
  }, []);

  const columns = ["ID", "Name", "Type", "Registered Date", "Option"];

  const enhancedData = users.map((user) => ({
    ID: user.id,
    Name: user.name,
    Type: user.role, 
    "Registered Date": new Date(user.created_at).toLocaleDateString(), 
    Option: (
      <div className="flex items-center justify-center gap-4">
        <BsPencilSquare className="text-blue-600 cursor-pointer text-lg" />
        <AiFillDelete className="text-red-600 cursor-pointer text-lg" />
      </div>
    ),
  }));

  return (
    <AuthenticatedLayout>
      <Head title="Users" />
      <div className="p-4">
        <h1 className="md:text-3xl text-2xl font-bold text-orange-500 md:mb-12 mb-8">
          Users
        </h1>
        <div>
          <div className="mb-4 flex justify-between px-12">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter search terms"
                className="border border-gray-300 px-4 py-2 rounded-lg"
              />
              <select className="border border-gray-300 px-4 py-2 rounded-lg">
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <select className="border border-gray-300 px-4 py-2 rounded-lg">
                <option value="day">Sort by Day</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            <RoleDropdown />
          </div>
          <div className="md:mt-28">
            <TableComponent columns={columns} data={enhancedData} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Users;
