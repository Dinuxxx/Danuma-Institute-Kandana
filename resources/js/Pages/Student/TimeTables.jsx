import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const TimeTables = () => {
  return (
    <AuthenticatedLayout>
        <Head title="TimeTables" />
        <div className="p-4">
            <h1>
             Time table
            </h1>
        </div>
        
      </AuthenticatedLayout>
  )
}

export default TimeTables