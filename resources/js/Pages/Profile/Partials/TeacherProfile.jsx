import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function TeacherProfile({ data, setData, errors, roleSpecificData }) {
    const [activeTab, setActiveTab] = useState('personal');
    
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // Subjects color mapping for visual variety
    const subjectColors = {
        'Mathematics': 'bg-blue-100 border-blue-400 text-blue-700',
        'English': 'bg-green-100 border-green-400 text-green-700',
        'Science': 'bg-purple-100 border-purple-400 text-purple-700',
        'History': 'bg-yellow-100 border-yellow-400 text-yellow-700',
        'Geography': 'bg-orange-100 border-orange-400 text-orange-700',
        'Computer Science': 'bg-teal-100 border-teal-400 text-teal-700',
        'Art': 'bg-pink-100 border-pink-400 text-pink-700',
        'Music': 'bg-indigo-100 border-indigo-400 text-indigo-700',
        'Physical Education': 'bg-red-100 border-red-400 text-red-700',
    };
    
    // Default colors for subjects not in our mapping
    const defaultColor = 'bg-gray-100 border-gray-400 text-gray-700';
    
    const getSubjectColor = (subjectName) => {
        for (const [key, value] of Object.entries(subjectColors)) {
            if (subjectName && subjectName.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }
        return defaultColor;
    };
    
    // Split qualifications into an array for better display
    const qualificationsList = data.qualifications 
        ? data.qualifications.split('\n').filter(q => q.trim() !== '')
        : [];

    // Format schedule time
    const formatSchedule = (timetables) => {
        if (!timetables || !Array.isArray(timetables) || timetables.length === 0) {
            return 'Not scheduled';
        }
        
        return (
            <div className="flex flex-col space-y-1">
                {timetables.map((tt, index) => {
                    // Remove seconds from time format
                    const startTime = tt.start_time.substring(0, 5); // Keep only HH:MM
                    const endTime = tt.end_time.substring(0, 5); // Keep only HH:MM
                    
                    return (
                        <div key={index} className="text-sm">
                            {tt.day_of_week} from {startTime} to {endTime}
                        </div>
                    );
                })}
            </div>
        );
    };
        
    return (
        <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Teacher Professional Profile
            </h3>
            
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mt-6">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                            activeTab === 'personal' 
                                ? 'border-indigo-500 text-indigo-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                        </svg>
                        Details
                    </button>
                    
                    <button
                        onClick={() => setActiveTab('qualifications')}
                        className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                            activeTab === 'qualifications' 
                                ? 'border-indigo-500 text-indigo-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        Qualifications
                    </button>
                    
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                            activeTab === 'courses' 
                                ? 'border-indigo-500 text-indigo-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                        Courses
                    </button>
                </nav>
            </div>
            
            {/* Personal Details Tab */}
            {activeTab === 'personal' && (
                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="nic" value="National ID" />
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                                    </svg>
                                </div>
                                <TextInput
                                    id="nic"
                                    className="pl-10 block w-full"
                                    value={data.nic}
                                    onChange={(e) => setData('nic', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.nic} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="teacher_id" value="Teacher ID" />
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                                    </svg>
                                </div>
                                <TextInput
                                    id="teacher_id"
                                    className="pl-10 block w-full"
                                    value={roleSpecificData?.teacher_id || ''} // Changed from tea_id to teacher_id
                                    disabled
                                />
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="join_date" value="Joined Date" />
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <TextInput
                                    id="join_date"
                                    className="pl-10 block w-full"
                                    value={formatDate(roleSpecificData?.created_at)}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Qualifications Tab */}
            {activeTab === 'qualifications' && (
                <div className="mt-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="mb-4">
                            <InputLabel htmlFor="qualifications" value="Professional Qualifications" />
                            <textarea
                                id="qualifications"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.qualifications}
                                onChange={(e) => setData('qualifications', e.target.value)}
                                rows="4"
                                placeholder="Enter your qualifications (one per line)"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">Enter each qualification on a new line for better formatting</p>
                            <InputError message={errors.qualifications} className="mt-2" />
                        </div>
                        
                        {qualificationsList.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-md font-medium text-gray-700 mb-4">Your Qualification Summary</h4>
                                <ul className="space-y-3">
                                    {qualificationsList.map((qual, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="flex-shrink-0 h-5 w-5 text-green-500">
                                                <svg fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                            <p className="ml-2 text-gray-700">{qual}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Courses Tab */}
            {activeTab === 'courses' && (
                <div className="mt-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        {roleSpecificData?.courses && roleSpecificData.courses.length > 0 ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-medium text-gray-800 flex items-center">
                                        <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                        </svg>
                                        Your Teaching Schedule
                                    </h4>
                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                        {roleSpecificData.courses.length} Courses
                                    </span>
                                </div>
                                
                                <div className="mt-4 grid grid-cols-1 gap-6">
                                    {roleSpecificData.courses.map((course) => (
                                        <div key={course.course_id} className={`rounded-lg p-5 border-l-4 shadow-sm ${getSubjectColor(course.course_name)}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="text-lg font-semibold">{course.course_name}</h5>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm flex items-center">
                                                            <svg className="w-4 h-4 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                                            </svg>
                                                            Grade: <span className="font-medium ml-1">{course.grade}</span>
                                                        </p>
                                                        <p className="text-sm flex items-start">
                                                            <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                            <span>
                                                                <span className="font-medium">Schedule:</span>
                                                                {course.timeTables && course.timeTables.length > 0 
                                                                    ? formatSchedule(course.timeTables) 
                                                                    : <span className="ml-1">Not scheduled</span>}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm flex items-center">
                                                            <svg className="w-4 h-4 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                                            </svg>
                                                            Students: <span className="font-medium ml-1">{course.students?.length || 0}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <button 
                                                        type="button" 
                                                        className="text-gray-500 hover:text-indigo-600 focus:outline-none focus:text-indigo-600"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {course.classroom_no && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Room: {course.classroom_no}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
                                                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                                    </svg>
                                                    View Syllabus
                                                </a>
                                                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                                    </svg>
                                                    Student List
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses assigned</h3>
                                <p className="mt-1 text-sm text-gray-500">You don't have any courses assigned yet.</p>
                                <div className="mt-6">
                                    <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Contact Administrator
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}