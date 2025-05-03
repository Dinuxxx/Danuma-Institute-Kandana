import React from 'react';
import { useForm } from '@inertiajs/react';

export default function NotificationsTab({ onSuccess }) {
    const { data, setData, post, processing } = useForm({
        notifications_email: true,
        notifications_sms: true,
    });
    
    // Submit form handler
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // In a real application, you would post to an endpoint
        // post('/settings/notifications');
        
        // For demonstration purposes, we'll just call the success handler
        onSuccess();
    };
    
    return (
        <div className="mt-6">
            <div className="bg-white p-6 rounded-md shadow">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                            <div className="mt-4 space-y-4">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="notifications_email"
                                            name="notifications_email"
                                            type="checkbox"
                                            checked={data.notifications_email}
                                            onChange={e => setData('notifications_email', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="notifications_email" className="font-medium text-gray-700">System Announcements</label>
                                        <p className="text-gray-500">Receive important system updates and announcements</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="course_updates"
                                            name="course_updates"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="course_updates" className="font-medium text-gray-700">Course Updates</label>
                                        <p className="text-gray-500">Notifications about new content, schedules, or changes to your courses</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="attendance_notifications"
                                            name="attendance_notifications"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="attendance_notifications" className="font-medium text-gray-700">Attendance Notifications</label>
                                        <p className="text-gray-500">Receive reminders about upcoming classes</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="payment_notifications"
                                            name="payment_notifications"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="payment_notifications" className="font-medium text-gray-700">Payment Notifications</label>
                                        <p className="text-gray-500">Receive reminders about upcoming payments and payment confirmations</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
                            <div className="mt-4 space-y-4">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="sms_critical"
                                            name="sms_critical"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="sms_critical" className="font-medium text-gray-700">Critical Updates</label>
                                        <p className="text-gray-500">Receive SMS for urgent announcements like class cancellations</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="sms_attendance"
                                            name="sms_attendance"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="sms_attendance" className="font-medium text-gray-700">Attendance Reminders</label>
                                        <p className="text-gray-500">Receive SMS reminders before classes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {processing ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}