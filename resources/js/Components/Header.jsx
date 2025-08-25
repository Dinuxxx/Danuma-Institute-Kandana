import React, { useRef, useState, useEffect } from "react";
import ApplicationLogo from "./ApplicationLogo";
import { Link, usePage, router } from '@inertiajs/react';

export default function Header() {
    const headerRef = useRef();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [expandedNotificationId, setExpandedNotificationId] = useState(null);
    
    // Get authenticated user from page props
    const user = usePage().props.auth.user;
    const { notifications = [] } = usePage().props;
    
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
    
    // Toggle expansion of notification
    const toggleNotificationExpansion = (id) => {
        setExpandedNotificationId(expandedNotificationId === id ? null : id);
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

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch(type) {
            case 'payment_request':
                return (
                    <div className="rounded-full bg-indigo-100 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                    </div>
                );
            case 'payment_approved':
                return (
                    <div className="rounded-full bg-green-100 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'payment_rejected':
                return (
                    <div className="rounded-full bg-red-100 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="rounded-full bg-gray-100 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    // Mark notification as read
    const markAsRead = (notificationId) => {
        router.post(route('notifications.mark-as-read', { id: notificationId }));
    };

    // Navigate to related page for notification
    const handleSeeMoreClick = (notification, e) => {
        e.stopPropagation();
        markAsRead(notification.id);
        
        // Navigate based on notification type and role
        if (user.role === 'admin' && notification.type === 'payment_request') {
            router.visit(route('admin.payments.show', { id: notification.data.payment_id }));
        } else if (user.role === 'student' && ['payment_approved', 'payment_rejected'].includes(notification.type)) {
            router.visit(route('student.payments'));
        }
    };

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
                {/* User Name and Profile */}
                <div className="profile-dropdown relative flex items-center space-x-2 cursor-pointer">
                    {/* User First Name */}
                    <span className="md:text-lg text-base font-medium text-gray-700 hidden sm:inline">
                        {firstName}
                    </span>
                    
                    {/* Profile Image */}
                    <img
                        src={user.profile_photo_url || "/images/default-avatar-svg.svg"}
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