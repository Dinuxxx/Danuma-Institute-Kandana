import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function PasswordTab({ onSuccess }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    
    // Password validation states
    const [validations, setValidations] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false,
        matching: false
    });
    
    // Validate password as user types
    useEffect(() => {
        const password = data.password;
        const passwordConfirm = data.password_confirmation;
        
        setValidations({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[@$!%*?&]/.test(password),
            matching: password === passwordConfirm && password !== ''
        });
    }, [data.password, data.password_confirmation]);
    
    // Submit form handler
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Post to the backend endpoint
        post(route('settings.password'), {
            onSuccess: () => {
                reset('current_password', 'password', 'password_confirmation');
                onSuccess();
            }
        });
    };
    
    // Helper function to determine text color based on validation status
    const getValidationColor = (isValid) => {
        return isValid ? 'text-green-500' : 'text-gray-500';
    };
    
    return (
        <div className="mt-6">
            <div className="bg-white p-6 rounded-md shadow">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                name="current_password"
                                id="current_password"
                                value={data.current_password}
                                onChange={e => setData('current_password', e.target.value)}
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
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
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
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
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
                                disabled={processing || !Object.values(validations).every(Boolean)}
                                className={`inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                                    Object.values(validations).every(Boolean) 
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