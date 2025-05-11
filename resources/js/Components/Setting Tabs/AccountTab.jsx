import React from 'react';
import { useForm } from '@inertiajs/react';

export default function AccountTab({ user, onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
    });
    
    // Submit form handler
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // In a real application, you would post to an endpoint
        // post('/settings/account');
        
        // For demonstration purposes, we'll just call the success handler
        onSuccess();
    };
    
    return (
        <div className="mt-6">
            <div className="bg-white p-6 rounded-md shadow">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>
                        
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
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