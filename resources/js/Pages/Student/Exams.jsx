import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Exams = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Exams" />
        <div className="p-4">
            <h1>
             exams
            </h1>
        </div>
        
      </AuthenticatedLayout>
  )
}

export default Exams