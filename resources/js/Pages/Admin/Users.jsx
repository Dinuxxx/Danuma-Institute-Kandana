import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Users = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Users" />
        <div className="p-6">
            <h1>
              Users
            </h1>
        </div>
        <div className="py-12">
            
        </div>
      </AuthenticatedLayout>
  )
}

export default Users