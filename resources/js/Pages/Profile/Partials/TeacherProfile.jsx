import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function TeacherProfile({ data, setData, errors, roleSpecificData }) {
    return (
        <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Teacher Details</h3>
            
            <div className="mt-6">
                <InputLabel htmlFor="nic" value="National ID" />
                <TextInput
                    id="nic"
                    className="mt-1 block w-full"
                    value={data.nic}
                    onChange={(e) => setData('nic', e.target.value)}
                    required
                />
                <InputError message={errors.nic} className="mt-2" />
            </div>
            
            <div className="mt-6">
                <InputLabel htmlFor="qualifications" value="Qualifications" />
                <textarea
                    id="qualifications"
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    value={data.qualifications}
                    onChange={(e) => setData('qualifications', e.target.value)}
                    rows="4"
                    required
                />
                <InputError message={errors.qualifications} className="mt-2" />
            </div>
            
            {/* Display assigned courses (read-only) */}
            {roleSpecificData?.courses && roleSpecificData.courses.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-800">Assigned Courses</h4>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {roleSpecificData.courses.map((course) => (
                            <div key={course.course_id} className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-medium">{course.course_name}</h5>
                                <p className="text-sm text-gray-600">Grade: {course.grade}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}