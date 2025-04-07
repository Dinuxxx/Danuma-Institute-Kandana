import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Timetables = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Timetables" />
        <div className="p-4">
            <h1>
             time table
            </h1>
        </div>
        
      </AuthenticatedLayout>
  )
}

export default Timetables