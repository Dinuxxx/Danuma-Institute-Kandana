import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AccountTab from '@/Components/Setting Tabs/AccountTab';
import PasswordTab from '@/Components/Setting Tabs/PasswordTab';
import AppearanceTab from '@/Components/Setting Tabs/AppearanceTab';
import DeleteAccountModal from '@/Components/Setting Tabs/DeleteAccountModal';

export default function Settings() {
    const { auth } = usePage().props;
    const user = auth.user;
    const userRole = user?.registration?.role?.role_name?.toLowerCase() || 'guest';
    
    const [activeTab, setActiveTab] = useState('account');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Handle success message display
    const handleSuccess = (message = 'Settings updated successfully') => {
        setSuccessMessage(message);
        setShowSuccessAlert(true);
        setTimeout(() => {
            setShowSuccessAlert(false);
        }, 3000);
    };
    
    return (
        <>
        <AuthenticatedLayout>
        <Head title="Settings" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
                    
                    {/* Success Message */}
                    {showSuccessAlert && (
                        <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">
                                        {successMessage}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-6">
                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                {['account', 'password', 'appearance'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`
                                            ${activeTab === tab
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }
                                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                                        `}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        
                        {/* Tab Content */}
                        {activeTab === 'account' && <AccountTab user={user} onSuccess={() => handleSuccess('Account information updated successfully')} />}
                        {activeTab === 'password' && <PasswordTab onSuccess={() => handleSuccess('Password updated successfully')} />}
                        {activeTab === 'appearance' && <AppearanceTab onSuccess={() => handleSuccess('Appearance settings updated successfully')} />}
                        
                        {/* Danger Zone */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                            <div className="bg-white p-6 rounded-md shadow border border-red-200">
                                <div className="space-y-6">
                                    <div className="pt-2 border-t border-gray-200">
                                        <h4 className="text-base font-medium text-gray-900">Delete Account</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteModal(true)}
                                            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Two-Factor Authentication Section */}
            <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="bg-white p-6 rounded-md shadow">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h4 className="text-base font-medium text-gray-900">Enhance your account security</h4>
                            <p className="mt-1 text-sm text-gray-500">
                                Two-factor authentication adds an extra layer of security to your account. In addition to your password, you'll need to enter a code from your phone.
                            </p>
                            <div className="mt-4">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Enable Two-Factor Authentication
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            <DeleteAccountModal 
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)} 
            />
        </AuthenticatedLayout>
        </>
    );
}