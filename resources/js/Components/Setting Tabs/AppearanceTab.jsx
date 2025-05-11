import React from 'react';
import { useForm } from '@inertiajs/react';

export default function AppearanceTab({ onSuccess }) {
    // Available themes
    const themes = [
        { id: 'light', name: 'Light' },
        { id: 'dark', name: 'Dark' },
        { id: 'system', name: 'System Default' },
    ];
    
    // Available languages
    const languages = [
        { id: 'en', name: 'English' },
        { id: 'si', name: 'Sinhala' },
        { id: 'ta', name: 'Tamil' },
    ];
    
    // Available timezones (shortened list for example)
    const timezones = [
        { id: 'UTC', name: 'UTC (Coordinated Universal Time)' },
        { id: 'Asia/Colombo', name: 'Asia/Colombo (Sri Lanka Time)' },
        { id: 'Asia/Kolkata', name: 'Asia/Kolkata (Indian Standard Time)' },
        { id: 'America/New_York', name: 'America/New_York (Eastern Time)' },
        { id: 'Europe/London', name: 'Europe/London (Greenwich Mean Time)' },
    ];
    
    const { data, setData, post, processing } = useForm({
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
    });
    
    // Submit form handler
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // In a real application, you would post to an endpoint
        // post('/settings/appearance');
        
        // For demonstration purposes, we'll just call the success handler
        onSuccess();
    };
    
    return (
        <div className="mt-6">
            <div className="bg-white p-6 rounded-md shadow">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Theme</label>
                            <select
                                id="theme"
                                name="theme"
                                value={data.theme}
                                onChange={e => setData('theme', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                {themes.map(theme => (
                                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
                            <select
                                id="language"
                                name="language"
                                value={data.language}
                                onChange={e => setData('language', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                {languages.map(language => (
                                    <option key={language.id} value={language.id}>{language.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone</label>
                            <select
                                id="timezone"
                                name="timezone"
                                value={data.timezone}
                                onChange={e => setData('timezone', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                {timezones.map(timezone => (
                                    <option key={timezone.id} value={timezone.id}>{timezone.name}</option>
                                ))}
                            </select>
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