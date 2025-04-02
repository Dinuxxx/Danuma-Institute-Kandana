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

  const handleRemoveCourse = () => {
    if (confirm('Are you sure you want to delete this course?')) {
      router.delete(`/courses/${course.course_id}`, {
        onSuccess: () => {
          router.visit('/admin/courses');
        },
      });
    }
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
              onClick={handleRemoveCourse}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <span className="mr-2">○</span> Remove Course
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
    </AuthenticatedLayout>
  );
};

export default EditCourse;