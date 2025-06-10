import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function DeleteAccountModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1); // 1: Confirmation, 2: Password verification
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        password: '',
        confirmation_text: ''
    });

    const handleClose = () => {
        reset();
        clearErrors();
        setStep(1);
        onClose();
    };

    const handleConfirmation = () => {
        clearErrors();
        if (data.confirmation_text === 'DELETE MY ACCOUNT') {
            setStep(2);
        }
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        
        // Submit the form with both password and confirmation
        post(route('settings.delete-account'), {
            onSuccess: () => {
                // This will redirect to login page
                // No need to do anything here as the redirect is handled by the controller
            },
            onError: (errors) => {
                console.error('Deletion failed:', errors);
                // Errors will be displayed automatically by Inertia
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {step === 1 ? 'Delete Account' : 'Confirm Password'}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={processing}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {step === 1 && (
                        <div>
                            {/* Warning Icon */}
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.5 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>

                            <div className="text-center mb-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Are you absolutely sure?
                                </h4>
                                <p className="text-sm text-gray-500 mb-4">
                                    This action cannot be undone. This will permanently delete your account and all associated data including:
                                </p>
                                <ul className="text-sm text-gray-500 text-left space-y-1 mb-4">
                                    <li>• Your profile information</li>
                                    <li>• Course enrollments and progress</li>
                                    <li>• Attendance records</li>
                                    <li>• Payment history</li>
                                    <li>• All associated academic records</li>
                                </ul>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Please type <span className="font-bold text-red-600">"DELETE MY ACCOUNT"</span> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={data.confirmation_text}
                                    onChange={(e) => setData('confirmation_text', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Type DELETE MY ACCOUNT"
                                />
                                {errors.confirmation_text && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmation_text}</p>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmation}
                                    disabled={data.confirmation_text !== 'DELETE MY ACCOUNT'}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleDeleteAccount}>
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Enter your password
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Please enter your current password to confirm account deletion.
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Enter your password"
                                    required
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Display general error if any */}
                            {errors.delete_account && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600">{errors.delete_account}</p>
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        clearErrors();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    disabled={processing}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.password}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete My Account'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}