import React, { useState, useEffect } from 'react';
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import LessonCardStudent from '@/Components/Student Components/LessonCardStudent';

const StudentLessons = ({ course_id, course_name, grade }) => {
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch study materials from the backend
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/study-materials', {
          params: { course_id: course_id }
        });
        // Filter only visible materials (consistent with LessonCardStudent approach)
        const visibleMaterials = response.data.filter(material => material.is_visible);
        setStudyMaterials(visibleMaterials);
      } catch (error) {
        console.error('Error fetching study materials:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [course_id]);
  
  // Filter study materials based on search term
  const filteredMaterials = studyMaterials.filter(material => 
    material.material_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (material.material_desc && material.material_desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <AuthenticatedLayout>
      <div className='p-4'>
        <div className="bg-white flex flex-col">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white px-2 py-2 z-10">
            <h1 className="text-3xl font-bold text-customOrange">
              {course_id} - {course_name}
            </h1>
            <div className="relative w-full md:w-1/4">
              <input
                type="text"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-customOrange"
                placeholder="Search by title or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading study materials...</p>
              </div>
            ) : filteredMaterials.length > 0 ? (
              filteredMaterials.map(material => (
                <LessonCardStudent key={material.material_id} studyMaterial={material} />
              ))
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  {searchTerm ? 'No study materials match your search.' : 'No study materials available for this course.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default StudentLessons;