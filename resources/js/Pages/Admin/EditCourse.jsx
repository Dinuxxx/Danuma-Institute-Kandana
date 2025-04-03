import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const EditCourse = ({ course }) => {
  const { data, setData, put, processing, errors } = useForm({
    subjectCode: course?.course_id || '',
    subjectName: course?.course_name || '',
    teacherId: course?.teacher_id || '',
    grade: course?.grade || '',
    courseFee: course?.monthly_fees || '',
    courseDesc: course?.course_desc || '',
  });

  const [studentCount, setStudentCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch student count for this course
    const fetchStudentCount = async () => {
      try {
        // Replace with actual API endpoint when available
        // const response = await fetch(`/api/courses/${course.course_id}/student-count`);
        // const data = await response.json();
        // setStudentCount(data.count);
        setStudentCount(42); // Placeholder value
      } catch (error) {
        console.error('Failed to fetch student count:', error);
      }
    };

    fetchStudentCount();
  }, [course?.course_id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/courses/${course.course_id}`, {
        preserveScroll: true,
        onSuccess: () => {
            // Manual redirect after successful update
            window.location.href = '/admin/courses';
        },
        onError: (errors) => {
            console.error(errors);
        }
    });
  };

  const confirmRemoveCourse = () => {
    setShowModal(true);
  };

  const handleRemoveCourse = () => {
    router.delete(`/courses/${course.course_id}`, {
      onSuccess: () => {
        router.visit('/admin/courses');
      },
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Edit Course - ${course?.course_name}`} />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">
            {course?.course_id} - {course?.course_name}
          </h1>
          <div className="text-lg text-orange-500 font-semibold">
            Student count: <span className="font-bold">{studentCount}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='mx-2 border-2'>
          <div className="bg-gray-200 px-4 py-2 mb-6">
            <h2 className="text-lg font-semibold">Edit Course</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 mx-8">
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Subject Code
                </label>
                <input
                  type="text"
                  className="border rounded w-4/5 py-2 px-3"
                  placeholder="Input text"
                  value={data.subjectCode}
                  onChange={(e) => setData('subjectCode', e.target.value)}
                />
                {errors.subjectCode && (
                  <div className="text-red-500 text-sm mt-1">{errors.subjectCode}</div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Teacher's ID
                </label>
                <input
                  type="text"
                  className="border rounded w-4/5 py-2 px-3"
                  placeholder="Input text"
                  value={data.teacherId}
                  onChange={(e) => setData('teacherId', e.target.value)}
                />
                {errors.teacherId && (
                  <div className="text-red-500 text-sm mt-1">{errors.teacherId}</div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Add Grade
                </label>
                <input
                  type="text"
                  className="border rounded w-4/5 py-2 px-3"
                  placeholder="Input text"
                  value={data.grade}
                  onChange={(e) => setData('grade', e.target.value)}
                />
                {errors.grade && (
                  <div className="text-red-500 text-sm mt-1">{errors.grade}</div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Course Fee
                </label>
                <input
                  type="text"
                  className="border rounded w-4/5 py-2 px-3"
                  placeholder="Input text"
                  value={data.courseFee}
                  onChange={(e) => setData('courseFee', e.target.value)}
                />
                {errors.courseFee && (
                  <div className="text-red-500 text-sm mt-1">{errors.courseFee}</div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  className="border rounded w-4/5 py-2 px-3"
                  placeholder="Input text"
                  value={data.subjectName}
                  onChange={(e) => setData('subjectName', e.target.value)}
                />
                {errors.subjectName && (
                  <div className="text-red-500 text-sm mt-1">{errors.subjectName}</div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Add Course Description
                </label>
                <textarea
                  className="border rounded w-4/5 py-2 px-3 h-40"
                  placeholder="Rich text editor."
                  value={data.courseDesc}
                  onChange={(e) => setData('courseDesc', e.target.value)}
                />
                {errors.courseDesc && (
                  <div className="text-red-500 text-sm mt-1">{errors.courseDesc}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6 mr-8 mb-8">
            <button
              type="button"
              onClick={confirmRemoveCourse}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Remove Course
            </button>
            <button
              type="submit"
              disabled={processing}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Update Course
            </button>
          </div>
        </form>
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg p-6 w-96 text-center transform scale-105 transition-all border-4 border-red-400 animate-pulse"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-red-600">⚠️ Confirm Course Removal</h2>
            <p className="text-md text-gray-700 mb-6">Are you sure you want to remove this course? <span className='text-red-600 italic'>This action cannot be undone.</span></p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRemoveCourse}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-lg transform hover:scale-105 transition-all"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded shadow-lg transform hover:scale-105 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
};

export default EditCourse;