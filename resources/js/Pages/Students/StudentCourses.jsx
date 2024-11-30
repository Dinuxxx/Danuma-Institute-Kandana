import CourseCardStudent from '@/Components/CourseCardStudent'
import React from 'react'

const StudentCourses = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 md:mb-0">Course</h1>
        <input 
          type="text" 
          className="border p-2 rounded-lg w-full md:w-1/4"
          placeholder="Search"
        />
      </div>
      <div className="space-y-4">
        <CourseCardStudent />
        <CourseCardStudent />
        <CourseCardStudent />
        <CourseCardStudent />
        <CourseCardStudent />
        <CourseCardStudent />
      </div>
    </div>
  )
}

export default StudentCourses