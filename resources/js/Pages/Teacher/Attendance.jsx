import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Attendance = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Attendance" />
        <div className="p-4">
            <h1>
             attendance
            </h1>
        </div>
        
      </AuthenticatedLayout>
  )
}

export default Attendance