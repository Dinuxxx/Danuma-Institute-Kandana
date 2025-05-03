import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AccountTab from '@/Components/Setting Tabs/AccountTab';
import PasswordTab from '@/Components/Setting Tabs/PasswordTab';
import NotificationsTab from '@/Components/Setting Tabs/NotificationsTab';
import AppearanceTab from '@/Components/Setting Tabs/AppearanceTab';

export default function Settings() {
    const { auth } = usePage().props;
    const user = auth.user;
    const userRole = user?.registration?.role?.role_name?.toLowerCase() || 'guest';
    
    const [activeTab, setActiveTab] = useState('account');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    
    // Handle success message display
    const handleSuccess = () => {
        setShowSuccessAlert(true);
        setTimeout(() => {
            setShowSuccessAlert(false);
        }, 3000);
    };
    
    // Role-specific setting sections
    const renderRoleSpecificSettings = () => {
        switch (userRole) {
            case 'admin':
                return (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Admin Settings</h3>
                        <div className="bg-white p-4 rounded-md shadow">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    System Maintenance Mode
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="maintenance_mode"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="maintenance_mode" className="ml-2 text-sm text-gray-700">
                                        Enable maintenance mode
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    When enabled, only admins can access the system.
                                </p>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default Payment Due Period (Days)
                                </label>
                                <input
                                    type="number"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    min="1"
                                    max="90"
                                    defaultValue="30"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Auto-Archive Old Records
                                </label>
                                <select
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    defaultValue="365"
                                >
                                    <option value="never">Never Archive</option>
                                    <option value="180">After 6 months</option>
                                    <option value="365">After 1 year</option>
                                    <option value="730">After 2 years</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
                
            case 'teacher':
                return (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Teacher Settings</h3>
                        <div className="bg-white p-4 rounded-md shadow">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lesson Visibility Default
                                </label>
                                <select
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    defaultValue="draft"
                                >
                                    <option value="published">Publish immediately</option>
                                    <option value="draft">Save as draft</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student Progress Notifications
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="progress_notifications"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        defaultChecked
                                    />
                                    <label htmlFor="progress_notifications" className="ml-2 text-sm text-gray-700">
                                        Receive notifications about student progress
                                    </label>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Attendance Reminder Time
                                </label>
                                <select
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    defaultValue="30"
                                >
                                    <option value="15">15 minutes before class</option>
                                    <option value="30">30 minutes before class</option>
                                    <option value="60">1 hour before class</option>
                                    <option value="120">2 hours before class</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
                
            case 'student':
                return (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Student Settings</h3>
                        <div className="bg-white p-4 rounded-md shadow">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Reminders
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="payment_reminders"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        defaultChecked
                                    />
                                    <label htmlFor="payment_reminders" className="ml-2 text-sm text-gray-700">
                                        Receive payment due reminders
                                    </label>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lesson Notifications
                                </label>
                                <select
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    defaultValue="immediate"
                                >
                                    <option value="immediate">Immediate notifications</option>
                                    <option value="daily">Daily digest</option>
                                    <option value="weekly">Weekly digest</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Show My Progress To Teachers
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="share_progress"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        defaultChecked
                                    />
                                    <label htmlFor="share_progress" className="ml-2 text-sm text-gray-700">
                                        Allow teachers to see my detailed progress
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                
            default:
                return null;
        }
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
                                        Settings updated successfully
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-6">
                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                {['account', 'password', 'notifications', 'appearance'].map((tab) => (
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
                        {activeTab === 'account' && <AccountTab user={user} onSuccess={handleSuccess} />}
                        {activeTab === 'password' && <PasswordTab onSuccess={handleSuccess} />}
                        {activeTab === 'notifications' && <NotificationsTab onSuccess={handleSuccess} />}
                        {activeTab === 'appearance' && <AppearanceTab onSuccess={handleSuccess} />}
                        
                        {/* Role-specific settings */}
                        {renderRoleSpecificSettings()}
                        
                        {/* Danger Zone */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                            <div className="bg-white p-6 rounded-md shadow border border-red-200">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-base font-medium text-gray-900">Reset Account</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            This will reset all your preferences and settings to default values.
                                        </p>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Reset Settings
                                        </button>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-gray-200">
                                        <h4 className="text-base font-medium text-gray-900">Delete Account</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                        <button
                                            type="button"
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
            <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            
            {/* Data Privacy Section */}
            <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Privacy</h3>
                <div className="bg-white p-6 rounded-md shadow">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-base font-medium text-gray-900">Data Collection</h4>
                            <p className="mt-1 text-sm text-gray-500">
                                Control what data we collect and how we use it.
                            </p>
                            <div className="mt-4 space-y-4">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="analytics_consent"
                                            name="analytics_consent"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="analytics_consent" className="font-medium text-gray-700">Analytics Consent</label>
                                        <p className="text-gray-500">Allow us to collect anonymous usage data to improve our services</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="marketing_consent"
                                            name="marketing_consent"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="marketing_consent" className="font-medium text-gray-700">Marketing Communications</label>
                                        <p className="text-gray-500">Receive occasional updates about new features and offerings</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-200">
                            <h4 className="text-base font-medium text-gray-900">Data Export</h4>
                            <p className="mt-1 text-sm text-gray-500">
                                Download all your data that we have stored.
                            </p>
                            <div className="mt-4">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Request Data Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Academic Calendar Settings for Students/Teachers */}
            {(userRole === 'student' || userRole === 'teacher') && (
                <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Calendar Settings</h3>
                    <div className="bg-white p-6 rounded-md shadow">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="calendar_view" className="block text-sm font-medium text-gray-700">Default Calendar View</label>
                                <select
                                    id="calendar_view"
                                    name="calendar_view"
                                    defaultValue="week"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="day">Day</option>
                                    <option value="week">Week</option>
                                    <option value="month">Month</option>
                                    <option value="agenda">Agenda</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="calendar_reminder" className="block text-sm font-medium text-gray-700">Calendar Reminders</label>
                                <select
                                    id="calendar_reminder"
                                    name="calendar_reminder"
                                    defaultValue="1h"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="none">No reminders</option>
                                    <option value="15m">15 minutes before</option>
                                    <option value="30m">30 minutes before</option>
                                    <option value="1h">1 hour before</option>
                                    <option value="1d">1 day before</option>
                                </select>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="show_weekends"
                                        name="show_weekends"
                                        type="checkbox"
                                        defaultChecked
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="show_weekends" className="font-medium text-gray-700">Show Weekends</label>
                                    <p className="text-gray-500">Display weekend days in your calendar view</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="sync_external"
                                        name="sync_external"
                                        type="checkbox"
                                        defaultChecked
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="sync_external" className="font-medium text-gray-700">Sync with External Calendar</label>
                                    <p className="text-gray-500">Allow synchronization with Google Calendar or Outlook</p>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <button
                                    type="button"
                                    className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Save Calendar Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
        </>
    );
}