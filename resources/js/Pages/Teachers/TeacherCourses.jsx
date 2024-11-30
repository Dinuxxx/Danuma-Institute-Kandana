import CourseCardTeacher from '@/Components/CourseCardTeacher'
import React from 'react'

const TeacherCourses = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-6">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Course - Class</h1>
        <input 
          type="text" 
          className="border p-2 rounded-lg w-1/4"
          placeholder="Search"
        />
      </div>

      
      <div className="space-y-4">
        <CourseCardTeacher />
        <CourseCardTeacher />
        <CourseCardTeacher />
      </div>
    </div>
  )
}

export default TeacherCourses
