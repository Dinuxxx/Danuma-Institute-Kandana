import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Notices = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Notices" />
        <div className="p-4">
            <h1>
             Notices
            </h1>
        </div>
        
      </AuthenticatedLayout>
  )
}

export default Notices