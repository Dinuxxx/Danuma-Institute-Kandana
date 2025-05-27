import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import StudentAttendance from '@/Components/Student Components/StudentAttendance';

const Attendance = () => {
  return (
    <AuthenticatedLayout>
      <Head title="My Attendance" />
      <StudentAttendance />
    </AuthenticatedLayout>
  );
};

export default Attendance;