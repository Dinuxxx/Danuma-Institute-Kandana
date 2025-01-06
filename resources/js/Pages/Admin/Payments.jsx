import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';

const Payments = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Payments" />
        <div className="p-6">
            <h1>
             Payments
            </h1>
        </div>
        <div className="py-12">
            
        </div>
      </AuthenticatedLayout>
  )
}

export default Payments