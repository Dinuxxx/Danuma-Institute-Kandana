import React, { useState } from 'react';
import axios from 'axios';

export default function AccountTab({ user, onSuccess }) {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        phone: user.registration?.tel_no || '', // Get phone from registration.tel_no
    });
    
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    
    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    
    // Submit form handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        
        try {
            // Log the data being sent
            console.log('Sending account update:', formData);
            
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('CSRF Token:', token);
            
            const response = await axios.post('/settings/account', formData, {
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('Response:', response.data);
            
            if (response.data.success) {
                onSuccess();
            }
        } catch (error) {
            console.error('Full error object:', error);
            
            if (error.response) {
                // Server responded with an error
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
                
                if (error.response.status === 422) {
                    // Validation errors
                    setErrors(error.response.data.errors || {});
                } else {
                    // Server error
                    setErrors({ 
                        general: error.response.data.message || 
                                 error.response.data.error || 
                                 "An unexpected error occurred" 
                    });
                }
            } else if (error.request) {
                // Request made but no response received
                console.error('No response received:', error.request);
                setErrors({ 
                    general: "No response received from server" 
                });
            } else {
                // Something happened in setting up the request
                console.error('Error setting up request:', error.message);
                setErrors({ 
                    general: "Error setting up the request" 
                });
            }
        } finally {
            setProcessing(false);
        }
    };
    
    return (
        <div className="mt-6">
            <div className="bg-white p-6 rounded-md shadow">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        {errors.general && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{errors.general}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name[0]}</div>}
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email[0]}</div>}
                        </div>
                        
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+94 77 123 4567"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone[0]}</div>}
                        </div>
                        
                        <div className="mt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
} 

// Admin2@1234