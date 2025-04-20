import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';

export default function StudentProfile({ data, setData, errors, roleSpecificData }) {
    return (
        <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Student Details</h3>
            
            <div className="mt-6">
                <InputLabel htmlFor="grade" value="Grade" />
                <TextInput
                    id="grade"
                    className="mt-1 block w-full"
                    value={data.grade}
                    disabled
                />
            </div>
            
            {/* Parent Information */}
            <div className="mt-8">
                <h4 className="text-md font-medium text-gray-800">Parent/Guardian Information</h4>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="parent_first_name" value="First Name" />
                        <TextInput
                            id="parent_first_name"
                            className="mt-1 block w-full"
                            value={data.parent_info?.first_name || ''}
                            onChange={(e) => setData('parent_info', {
                                ...data.parent_info,
                                first_name: e.target.value
                            })}
                        />
                        <InputError message={errors['parent_info.first_name']} className="mt-2" />
                    </div>
                    
                    <div>
                        <InputLabel htmlFor="parent_last_name" value="Last Name" />
                        <TextInput
                            id="parent_last_name"
                            className="mt-1 block w-full"
                            value={data.parent_info?.last_name || ''}
                            onChange={(e) => setData('parent_info', {
                                ...data.parent_info,
                                last_name: e.target.value
                            })}
                        />
                        <InputError message={errors['parent_info.last_name']} className="mt-2" />
                    </div>
                    
                    <div>
                        <InputLabel htmlFor="parent_tel_no" value="Phone Number" />
                        <TextInput
                            id="parent_tel_no"
                            className="mt-1 block w-full"
                            value={data.parent_info?.tel_no || ''}
                            onChange={(e) => setData('parent_info', {
                                ...data.parent_info,
                                tel_no: e.target.value
                            })}
                        />
                        <InputError message={errors['parent_info.tel_no']} className="mt-2" />
                    </div>
                    
                    <div>
                        <InputLabel htmlFor="parent_relationship" value="Relationship" />
                        <SelectInput
                            id="parent_relationship"
                            className="mt-1 block w-full"
                            value={data.parent_info?.relationship_type || ''}
                            onChange={(e) => setData('parent_info', {
                                ...data.parent_info,
                                relationship_type: e.target.value
                            })}
                            options={[
                                { value: '', label: 'Select Relationship' },
                                { value: 'Father', label: 'Father' },
                                { value: 'Mother', label: 'Mother' },
                                { value: 'Guardian', label: 'Guardian' },
                                { value: 'Other', label: 'Other' }
                            ]}
                        />
                        <InputError message={errors['parent_info.relationship_type']} className="mt-2" />
                    </div>
                </div>
            </div>
            
            {/* Display enrolled courses (read-only) */}
            {roleSpecificData?.courses && roleSpecificData.courses.length > 0 && (
                <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-800">Enrolled Courses</h4>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {roleSpecificData.courses.map((course) => (
                            <div key={course.course_id} className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-medium">{course.course_name}</h5>
                                <p className="text-sm text-gray-600">Grade: {course.grade}</p>
                                <p className="text-sm text-gray-600">Status: 
                                    <span className={`ml-1 ${course.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                        {course.status}
                                    </span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}