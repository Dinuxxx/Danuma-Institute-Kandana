import React from "react";
import { toast } from "react-toastify";
import { useForm } from "@inertiajs/react";

export default function AccountTab({ user, onSuccess }) {
    const { data, setData, patch, processing, errors } = useForm({
        email: user.email || "",
        phone: user.registration?.tel_no || "",
    });

    // Submit form handler
    const handleSubmit = (e) => {
        e.preventDefault();
        
        patch('/profile/contact', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Contact information updated successfully");
                if (typeof onSuccess === "function") {
                    onSuccess();
                }
            },
            onError: (errors) => {
                if (errors.email) {
                    toast.error(errors.email);
                } else if (errors.phone) {
                    toast.error(errors.phone);
                } else {
                    toast.error("Failed to update contact information");
                }
            }
        });
    };

    return (
        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Contact Information
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Update your contact information. These details will be used for communications.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={data.phone}
                        onChange={e => setData('phone', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="+94 7XX XXX XXX"
                    />
                    {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        {processing ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
