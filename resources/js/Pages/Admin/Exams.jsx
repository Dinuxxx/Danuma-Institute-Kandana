import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Exams = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Exams" />
        <div className="p-6">
            <h1>
              Exams
            </h1>
        </div>
        <div className="py-12">
            
        </div>
      </AuthenticatedLayout>
  )
}

export default Exams