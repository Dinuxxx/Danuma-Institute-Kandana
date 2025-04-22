import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import Message from '@/Components/Message';
import AdminProfile from './Partials/AdminProfile';
import TeacherProfile from './Partials/TeacherProfile';
import StudentProfile from './Partials/StudentProfile';

export default function Edit({ auth, user, userRegistration, userRole, roleSpecificData, flash }) {
    // Check if userRegistration exists, if not provide default values
    const registration = userRegistration || {};
    
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(
        registration.image 
            ? `/storage/profiles/${registration.image}` 
            : '/images/default-profile.png'
    );
    
    const { data, setData, patch, errors, processing, reset } = useForm({
        title: registration.title || '',
        first_name: registration.first_name || '',
        last_name: registration.last_name || '',
        email: user.email || '',
        tel_no: registration.tel_no || '',
        address: registration.address || '',
        image: null,
        ...getRoleSpecificFormData(userRole, roleSpecificData)
    });
    
    function getRoleSpecificFormData(role, roleData) {
        if (!roleData) return {};
        
        switch (role) {
            case 'admin':
                return {
                    nic: roleData.nic || '',
                };
            case 'teacher':
                return {
                    nic: roleData.nic || '',
                    qualifications: roleData.qualifications || '',
                };
            case 'student':
                return {
                    grade: roleData.grade || '',
                    parent_info: roleData.parent ? {
                        first_name: roleData.parent.parent_first_name || '',
                        last_name: roleData.parent.parent_last_name || '',
                        tel_no: roleData.parent.parent_phone_number || '',
                        relationship_type: roleData.parent.relationship_type || '',
                    } : {}
                };
            default:
                return {};
        }
    }

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Reset image form field
                setData('image', null);
            },
        });
    };

    const renderRoleSpecificForm = () => {
        switch (userRole) {
            case 'admin':
                return <AdminProfile data={data} setData={setData} errors={errors} roleSpecificData={roleSpecificData} />;
            case 'teacher':
                return <TeacherProfile data={data} setData={setData} errors={errors} roleSpecificData={roleSpecificData} />;
            case 'student':
                return <StudentProfile data={data} setData={setData} errors={errors} roleSpecificData={roleSpecificData} />;
            default:
                return null;
        }
    };

    // Info message for users without role-specific data
    const renderInfoMessage = () => {
        if (!userRegistration || !userRegistration.role) {
            return (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Your profile is incomplete. Please contact an administrator to complete your registration.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Profile</h2>}
        >
            <Head title="Profile" />

            <div className="py-4">
                <div className="mx-auto sm:px-6 lg:px-8 space-y-6">
                    {flash.message && <Message message={flash.message} />}
                    {renderInfoMessage()}
                    
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section>
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Update your account's profile information and email address.
                                </p>
                            </header>

                            <form onSubmit={submit} className="mt-6 space-y-6">
                                {/* Centered Profile Image Section */}
                                <div className="flex justify-center mb-8">
                                    <div 
                                        className="relative rounded-full overflow-hidden cursor-pointer group"
                                        onClick={handleImageClick}
                                    >
                                        <img 
                                            src={imagePreview} 
                                            alt="Profile" 
                                            className="w-40 h-40 object-cover rounded-full border-4 border-gray-200"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm font-medium">Change Photo</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        id="image"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                {/* Profile Information Layout */}
                                <div className="space-y-6">
                                    {/* First Row - Title, First Name, Last Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <InputLabel htmlFor="title" value="Title" />
                                            <SelectInput
                                                id="title"
                                                className="mt-1 block w-full"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                options={[
                                                    { value: '', label: 'Select Title' },
                                                    { value: 'Mr', label: 'Mr' },
                                                    { value: 'Mrs', label: 'Mrs' },
                                                    { value: 'Miss', label: 'Miss' },
                                                    { value: 'Dr', label: 'Dr' },
                                                    { value: 'Prof', label: 'Prof' }
                                                ]}
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="first_name" value="First Name" />
                                            <TextInput
                                                id="first_name"
                                                className="mt-1 block w-full"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.first_name} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="last_name" value="Last Name" />
                                            <TextInput
                                                id="last_name"
                                                className="mt-1 block w-full"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.last_name} className="mt-2" />
                                        </div>
                                    </div>

                                    {/* Second Row - Email and Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="email" value="Email" />
                                            <TextInput
                                                id="email"
                                                type="email"
                                                className="mt-1 block w-full"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.email} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="tel_no" value="Phone Number" />
                                            <TextInput
                                                id="tel_no"
                                                className="mt-1 block w-full"
                                                value={data.tel_no}
                                                onChange={(e) => setData('tel_no', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.tel_no} className="mt-2" />
                                        </div>
                                    </div>

                                    {/* Third Row - Address */}
                                    <div>
                                        <InputLabel htmlFor="address" value="Address" />
                                        <textarea
                                            id="address"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows="3"
                                            required
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>
                                </div>

                                {/* Role Specific Form Fields */}
                                {userRegistration && userRegistration.role && renderRoleSpecificForm()}

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                                    
                                    {flash.message && processing === false && (
                                        <p className="text-sm text-green-600">Saved.</p>
                                    )}
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}