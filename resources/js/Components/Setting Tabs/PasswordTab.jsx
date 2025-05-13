import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PasswordTab({ onSuccess }) {
    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    
    // Password validation states
    const [validations, setValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        matching: false
    });
    
    // Validate password as user types
    useEffect(() => {
        const password = formData.password;
        const passwordConfirm = formData.password_confirmation;
        
        setValidations({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[@$!%*?&]/.test(password),
            matching: password === passwordConfirm && password !== ''
        });
    }, [formData.password, formData.password_confirmation]);
    
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
            // Get CSRF token from meta tag
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Call backend API to update password
            const response = await axios.post('/settings/password', formData, {
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            // Call success handler if successful and reset form
            if (response.data.success) {
                onSuccess();
                setFormData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
            }
        } catch (error) {
            console.error('Error updating password:', error);
            
            // Handle validation errors
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                setErrors({ general: error.response?.data?.message || "Failed to update password" });
            }
        } finally {
            setProcessing(false);
        }
    };
    
    // Helper function to determine text color based on validation status
    const getValidationColor = (isValid) => {
        return isValid ? 'text-green-500' : 'text-gray-500';
    };
    
    // Check if all password requirements are met
    const allRequirementsMet = Object.values(validations).every(Boolean);
    
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
                            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                name="current_password"
                                id="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.current_password && <div className="text-red-500 text-xs mt-1">{errors.current_password}</div>}
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                        </div>
                        
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                id="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        
                        <div className="text-sm">
                            <p className="font-medium text-gray-700 mb-2">Password requirements:</p>
                            <ul className="space-y-1 pl-5">
                                <li className={getValidationColor(validations.length)}>
                                    {validations.length ? "✓" : "○"} Minimum 8 characters
                                </li>
                                <li className={getValidationColor(validations.uppercase)}>
                                    {validations.uppercase ? "✓" : "○"} At least one uppercase letter
                                </li>
                                <li className={getValidationColor(validations.lowercase)}>
                                    {validations.lowercase ? "✓" : "○"} At least one lowercase letter
                                </li>
                                <li className={getValidationColor(validations.number)}>
                                    {validations.number ? "✓" : "○"} At least one number
                                </li>
                                <li className={getValidationColor(validations.special)}>
                                    {validations.special ? "✓" : "○"} At least one special character (@$!%*?&)
                                </li>
                                <li className={getValidationColor(validations.matching)}>
                                    {validations.matching ? "✓" : "○"} Passwords match
                                </li>
                            </ul>
                        </div>
                        
                        <div className="mt-4">
                            <button
                                type="submit"
                                disabled={processing || !allRequirementsMet}
                                className={`inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                                    allRequirementsMet 
                                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                                    : 'bg-indigo-300 cursor-not-allowed'
                                }`}
                            >
                                {processing ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}