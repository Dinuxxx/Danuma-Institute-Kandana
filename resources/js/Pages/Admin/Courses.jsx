import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Courses = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Courses" />
        <div className="p-6">
            <h1>
              Courses
            </h1>
        </div>
        <div className="py-12">
            
        </div>
      </AuthenticatedLayout>
  )
}

export default Courses