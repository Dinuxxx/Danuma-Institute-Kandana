import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Notices = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Notices" />
        <div className="p-6">
            <h1>
             Notices
            </h1>
        </div>
        <div className="py-12">
            
        </div>
      </AuthenticatedLayout>
  )
}

export default Notices