import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from "@inertiajs/react";
import { BsDash } from 'react-icons/bs';
import { LuRefreshCw } from "react-icons/lu";

const EditCourses = () => {
  return (
    <AuthenticatedLayout>
      <div className='p-4'>
        <h1 className="md:text-3xl text-2xl font-bold text-orange-500 md:mb-8 mb-4">
          All Courses
        </h1>
        <div className="border-2 border-gray-300">
          <h1 className="md:text-2xl text-xl font-bold bg-gray-300 p-2 pl-6">
            edit course
          </h1>
          <form className='p-8 md:pl-12'>
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <div>
                <label className="block font-medium mb-2">Subject Code</label>
                <input
                  type="text"
                  className="max-w-xs w-full border border-gray-400 p-2 rounded mb-4 md:mb-0"
                  placeholder="Input text"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Subject Name</label>
                <input
                  type="text"
                  className="max-w-xs w-full border border-gray-400 p-2 rounded mb-4 md:mb-0"
                  placeholder="Input text"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Teacher's ID</label>
                <input
                  type="text"
                  className="max-w-xs w-full border border-gray-400 p-2 rounded mb-4 md:mb-0"
                  placeholder="Input text"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Add Grade</label>
                <input
                  type="text"
                  className="max-w-xs w-full border border-gray-400 p-2 rounded mb-4 md:mb-0"
                  placeholder="Input text"
                />
              </div>
              <div>
                <label className="block font-medium mb-2">Course Fee</label>
                <input
                  type="text"
                  className="max-w-xs w-full border border-gray-400 p-2 rounded mb-4 md:mb-0"
                  placeholder="Input text"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-medium mb-2">Add Course Description</label>
                <textarea
                  className="max-w-sm w-full border border-gray-400 p-2 rounded mb-4 md:mb-0"
                  placeholder="Rich text editor."
                  rows="4"
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="bg-red-600 text-white px-2 py-2 rounded-md font-bold flex items-center justify-center"
              >
                <div className="flex items-center justify-center w-5 h-5 bg-red-600 text-white rounded-full border-2 mr-2">
                  <BsDash size={32} className="stroke-1" />
                </div>
                Remove Course
              </button>
              <button
                type="button"
                className="bg-blue-600 text-white px-2 py-2 rounded-md font-bold flex items-center justify-center ml-4"
              >
                <div className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white mr-2">
                  <LuRefreshCw size={32} className="stroke-2" />
                </div>
                Update Course
              </button> 
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default EditCourses



{/* <div className="p-6">
        <Head title={`Edit Course - ${course.title}`} />
        <h1 className="text-2xl font-bold text-orange-500 mb-6">
          Edit Course: {course.title}
        </h1>
        <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-lg font-bold">Instructor: {course.instructor}</p>
          <p className="mt-4 text-gray-600">{course.description}</p>

          Add form or other editing functionality here
          <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md">
            Save Changes
          </button>
        </div>
      </div> */}