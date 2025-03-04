import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react';
import Timetable from './Timetable';
import CreateNotice from '@/Components/Admin Components/CreateNotice';

const Notices = () => {
  return (
    <AuthenticatedLayout>
        <Head title="Notices" />
        <div className="p-4">
             <CreateNotice/>

            
        </div>
        
      </AuthenticatedLayout>
  )
}

export default Notices