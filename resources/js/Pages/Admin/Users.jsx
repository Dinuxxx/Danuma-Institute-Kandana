import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';
import Timetable from './Timetable';
import { useState } from "react";
import RoleDropdown from '@/Components/Admin Components/RoleDropdown';

const Users = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Add Users");

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
  };
  return (
    <AuthenticatedLayout>
        <Head title="Users" />
        <div className="p-4">
          <h1 className="md:text-3xl text-2xl font-bold text-orange-500 md:mb-12 mb-8">
            Users
          </h1>
          <div>
            <div className="mb-4 flex justify-between px-12">
              <div className='flex gap-4'>
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
              {/* add users */}
              <RoleDropdown />
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
  )
}

export default Users