import React, { useRef, useState, useEffect } from "react";
import ApplicationLogo from "./ApplicationLogo";
import { Link, usePage } from '@inertiajs/react';

export default function Header() {
    const headerRef = useRef();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    
    // Dummy user details
    const user = usePage().props.auth.user;
    const profileImage = "https://via.placeholder.com/40"; // Placeholder image
    
    // Toggle dropdown visibility
    const toggleDropdown = () => {
        if (notificationsOpen) setNotificationsOpen(false);
        setDropdownOpen(!dropdownOpen);
    };
    
    // Toggle notifications visibility
    const toggleNotifications = () => {
        if (dropdownOpen) setDropdownOpen(false);
        setNotificationsOpen(!notificationsOpen);
    };
    
    // Close dropdown and notifications when clicking outside
    const handleOutsideClick = (e) => {
        if (dropdownOpen && !e.target.closest('.profile-dropdown')) {
            setDropdownOpen(false);
        }
        if (notificationsOpen && !e.target.closest('.notification-container')) {
            setNotificationsOpen(false);
        }
    };
    
    // Add event listener when component mounts
    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [dropdownOpen, notificationsOpen]);
    
    // Get user's first name
    const firstName = user?.name ? user.name.split(' ')[0] : 'User';

    // Sample notifications data
    const notifications = [
        {
            id: 1,
            type: 'message',
            content: 'John sent you a message',
            time: '5 min ago',
            read: false,
            avatar: 'https://via.placeholder.com/40/4f46e5/ffffff?text=J'
        },
        {
            id: 2,
            type: 'task',
            content: 'New task assigned: Update project documentation',
            time: '2 hours ago',
            read: false,
            avatar: 'https://via.placeholder.com/40/ef4444/ffffff?text=T'
        },
        {
            id: 3,
            type: 'alert',
            content: 'Your subscription will expire in 3 days',
            time: 'Yesterday',
            read: true,
            avatar: 'https://via.placeholder.com/40/f59e0b/ffffff?text=!'
        },
        {
            id: 4,
            type: 'update',
            content: 'System update completed successfully',
            time: '2 days ago',
            read: true,
            avatar: 'https://via.placeholder.com/40/10b981/ffffff?text=U'
        },
    ];

    // Filter unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header
            ref={headerRef}
            className="fixed top-0 w-full bg-gray-100 z-50 flex justify-between items-center px-[3%] py-4 transition-shadow duration-300"
        >
            {/* Logo Section */}
            <div>
                <ApplicationLogo className="md:h-16 h-12" />
            </div>
            
            {/* Notification, User Info and Profile Section */}
            <div className="relative flex items-center space-x-6">
                {/* Notification Icon */}
                <div className="notification-container relative">
                    <button 
                        className="relative p-2 rounded-full hover:bg-gray-200 transition-colors"
                        onClick={toggleNotifications}
                    >
                        {/* Bell Icon SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    
                    {/* Notification Panel */}
                    {notificationsOpen && (
                        <div className="notification-panel absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-10 transform transition-all duration-300 origin-top-right">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 flex justify-between items-center">
                                <h3 className="text-white font-semibold">Notifications</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-white opacity-80">{unreadCount} unread</span>
                                    <button className="text-xs text-white hover:underline">
                                        Mark all as read
                                    </button>
                                </div>
                            </div>
                            
                            {/* Notifications List */}
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div 
                                            key={notification.id} 
                                            className={`flex items-start px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                                        >
                                            <div className="flex-shrink-0">
                                                <img 
                                                    src={notification.avatar} 
                                                    alt=""
                                                    className="rounded-full w-10 h-10" 
                                                />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <p className="text-sm text-gray-800">{notification.content}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="mt-1">No notifications</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Footer */}
                            <div className="px-4 py-2 bg-gray-50 text-center">
                                <a href="/notifications" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                    View all notifications
                                </a>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* User Name and Profile */}
                <div className="profile-dropdown relative flex items-center space-x-2 cursor-pointer">
                    {/* User First Name */}
                    <span className="md:text-lg text-base font-medium text-gray-700 hidden sm:inline">
                        {firstName}
                    </span>
                    
                    {/* Profile Image */}
                    <img
                        src={profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                        onClick={toggleDropdown}
                    />
                    
                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                            <Link href="/profile" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                {/* User Icon SVG */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                My Profile
                            </Link>
                            <Link href="/settings" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                {/* Settings Icon SVG */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                            </Link>
                            <hr className="my-1" />
                            <Link href="/logout" method="post" as="button" className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
                                {/* Logout Icon SVG */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Log Out
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}