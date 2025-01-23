import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Timetable = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Timetable" />
        <div className="p-4">
            <h1>
             Timetable
            </h1>
        </div>
       
      </AuthenticatedLayout>
  )
}

export default Timetable