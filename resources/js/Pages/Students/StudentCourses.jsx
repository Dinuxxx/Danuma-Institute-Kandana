import CourseCardStudent from '@/Components/CourseCardStudent'
import React from 'react'

const StudentCourses = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-6">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Course</h1>
        <input 
          type="text" 
          className="border p-2 rounded-lg w-1/4"
          placeholder="Search"
        />
      </div>

      
      <div className="space-y-4">
        <CourseCardStudent />
        <CourseCardStudent />
        <CourseCardStudent />
      </div>
    </div>
  )
}

export default StudentCourses
