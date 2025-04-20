import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function AdminProfile({ data, setData, errors }) {
    return (
        <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Admin Details</h3>
            
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
            
            {/* You can add more admin-specific fields here */}
        </div>
    );
}