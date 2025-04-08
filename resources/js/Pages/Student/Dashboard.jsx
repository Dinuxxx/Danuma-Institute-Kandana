import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Dashboard = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Dashboard" />
        <div className="p-4">
            <h1>
             dashboard
            </h1>
        </div>
        
      </AuthenticatedLayout>
  )
}

export default Dashboard