import React, { useRef } from "react";
import ApplicationLogo from "./ApplicationLogo";
import { Link, usePage } from '@inertiajs/react';

export default function Header() {
    const headerRef = useRef();

    // Dummy user details
    const user = usePage().props.auth.user;
    const profileImage =
        "https://via.placeholder.com/40"; // Replace with your avatar image path

    return (
        <header
            ref={headerRef}
            className="fixed top-0 w-full bg-gray-100 z-50 flex justify-between items-center px-[3%] py-4 transition-shadow duration-300"
        >
            {/* Logo Section */}
            <div>
                <ApplicationLogo className="md:h-16 h-12" />
            </div>

            {/* Color Mode and User Info Section */}
            <div className="relative flex items-center space-x-6">

                {/* User Name and Profile */}
                <div className="relative flex items-center space-x-2 cursor-pointer">
                    {/* User Name */}
                    {/* <span className="md:text-2xl text-xl font-medium text-gray-700 dark:text-gray-300">
                        {user.name}
                    </span> */}
                    {/* Profile Image */}
                    <img
                        src={profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                        // onClick={toggleDropdown}
                    />
                </div>
            </div>
        </header>
    );
}
