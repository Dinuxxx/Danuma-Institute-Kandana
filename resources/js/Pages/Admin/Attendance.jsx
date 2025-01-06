import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Attendance = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Attendance" />
        <div className="p-6">
            <h1>
              Attendance
            </h1>
        </div>
        <div className="py-12">
            
        </div>
      </AuthenticatedLayout>
  )
}

export default Attendance