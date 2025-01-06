import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Timetable = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Timetable" />
        <div className="p-6">
            <h1>
             Timetable
            </h1>
        </div>
        <div className="py-12">
            
        </div>
      </AuthenticatedLayout>
  )
}

export default Timetable