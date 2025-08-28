import React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    FaHome,
    FaBook,
    FaTrophy,
    FaClipboardList,
    FaMoneyBill,
    FaUsers,
    FaBullhorn,
    FaCalendarAlt,
} from "react-icons/fa";
import ApplicationLogo from "./ApplicationLogo";

function Sidebar({ isOpen, toggleSidebar, role }) {
    const { url } = usePage();

    const styles = {
        sidebar: {
            backgroundColor: "#87CEFA",
            width: isOpen ? "250px" : "70px",
            height: "100vh",
            paddingTop: "20px",
            overflow: "hidden",
            transition: "width 0.3s ease-in-out",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
        },
        toggleBtn: {
            background: "none",
            border: "none",
            fontSize: "28px",
            color: "#333",
            cursor: "pointer",
            margin: "10px 10px 20px",
        },
        menuItems: {
            marginTop: "20px",
            width: "100%",
        },
        menuItem: {
            display: "flex",
            alignItems: "center",
            padding: "12px 20px",
            color: "#333",
            cursor: "pointer",
            transition: "padding 0.3s ease-in-out",
            fontSize: "18px",
        },
        menuIcon: {
            fontSize: "30px",
            minWidth: "30px",
            marginRight: isOpen ? "12px" : "0",
            transition: "margin-right 0.3s ease-in-out",
        },
        menuText: {
            opacity: isOpen ? 1 : 0,
            whiteSpace: "nowrap",
            transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
            transform: isOpen ? "translateX(0)" : "translateX(-15px)",
            pointerEvents: isOpen ? "auto" : "none",
        },
        activeMenuItem: {
            backgroundColor: "#fff",
            fontWeight: "bold",
        },
        // Mobile specific styles
        mobileOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 40,
        },
        mobileSidebar: {
            position: "fixed",
            top: 0,
            left: 0,
            height: "100%",
            backgroundColor: "#87CEFA",
            width: "60%",
            zIndex: 50,
            transition: "transform 0.3s ease-in-out",
            transform: isOpen ? "translateX(0)" : "translateX(-100%)",
            paddingTop: "80px", // Account for header height
        },
        mobileMenuItems: {
            marginTop: "20px",
            width: "100%",
            paddingBottom: "20px",
        },
        mobileMenuItem: {
            display: "flex",
            alignItems: "center",
            padding: "15px 20px",
            color: "#333",
            cursor: "pointer",
            fontSize: "18px",
            textDecoration: "none",
        },
        mobileMenuIcon: {
            fontSize: "24px",
            minWidth: "30px",
            marginRight: "15px",
        },
        mobileCloseBtn: {
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            fontSize: "24px",
            color: "#333",
            cursor: "pointer",
            padding: "5px",
        }
    };

    const menuItemsByRole = {
        admin: [
            { icon: <FaHome />, text: "Dashboard", link: "/admin/dashboard" },
            { icon: <FaBook />, text: "Courses", link: "/admin/courses" },
            {
                icon: <FaClipboardList />,
                text: "Attendance",
                link: "/admin/attendance",
            },
            {
                icon: <FaMoneyBill />,
                text: "Payments",
                link: "/admin/payments",
            },
            { icon: <FaUsers />, text: "Users", link: "/admin/users" },
            { icon: <FaBullhorn />, text: "Notices", link: "/admin/notices" },
            {
                icon: <FaCalendarAlt />,
                text: "Time Tables",
                link: "/admin/time-tables",
            },
        ],
        teacher: [
            { icon: <FaHome />, text: "Dashboard", link: "/teacher/dashboard" },
            { icon: <FaBook />, text: "Courses", link: "/teacher/courses" },
            { icon: <FaTrophy />, text: "Exams", link: "/teacher/exams" },
            {
                icon: <FaClipboardList />,
                text: "Attendance",
                link: "/teacher/attendance",
            },
            { icon: <FaBullhorn />, text: "Notices", link: "/teacher/notices" },
            {
                icon: <FaCalendarAlt />,
                text: "Time Tables",
                link: "/teacher/time-tables",
            },
        ],
        student: [
            { icon: <FaHome />, text: "Dashboard", link: "/student/dashboard" },
            { icon: <FaBook />, text: "Courses", link: "/student/courses" },
            { icon: <FaTrophy />, text: "Exams", link: "/student/exams" },
            {
                icon: <FaClipboardList />,
                text: "Attendance",
                link: "/student/attendance",
            },
            {
                icon: <FaMoneyBill />,
                text: "Payments",
                link: "/student/payments",
            },
            { icon: <FaBullhorn />, text: "Notices", link: "/student/notices" },
            {
                icon: <FaCalendarAlt />,
                text: "Time Tables",
                link: "/student/time-tables",
            },
        ],
    };

    const menuItems = menuItemsByRole[role] || [];

    // Check if mobile/tablet
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    // Mobile/Tablet Sidebar
    if (isMobile) {
        return (
            <>
                {/* Overlay */}
                {isOpen && (
                    <div 
                        style={styles.mobileOverlay}
                        onClick={toggleSidebar}
                    />
                )}
                
                {/* Mobile Sidebar */}
                <div style={styles.mobileSidebar}>
                    {/* Close Button */}
                    <button 
                        onClick={toggleSidebar} 
                        style={styles.mobileCloseBtn}
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                    
                    {/* Menu Items */}
                    <div style={styles.mobileMenuItems}>
                        {menuItems.map((item, index) => {
                            const isActive = url === item.link;
                            return (
                                <Link
                                    key={index}
                                    href={item.link}
                                    style={{ textDecoration: "none" }}
                                    onClick={toggleSidebar} // Close sidebar when menu item is clicked
                                >
                                    <div
                                        style={{
                                            ...styles.mobileMenuItem,
                                            ...(isActive ? styles.activeMenuItem : {}),
                                        }}
                                        className="hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
                                    >
                                        <div style={styles.mobileMenuIcon}>{item.icon}</div>
                                        <span>{item.text}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    <div className="fixed bottom-12 flex justify-center w-full">
                        <ApplicationLogo className="w-[50%]"/>
                    </div>
                </div>
            </>
        );
    }

    // Desktop Sidebar (Original functionality preserved)
    return (
        <div style={styles.sidebar}>
            <button onClick={toggleSidebar} style={styles.toggleBtn}>
                ☰
            </button>
            <div style={styles.menuItems}>
                {menuItems.map((item, index) => {
                    const isActive = url === item.link;
                    return (
                        <Link
                            key={index}
                            href={item.link}
                            style={{ textDecoration: "none" }}
                        >
                            <div
                                className="hover:font-bold"
                                style={{
                                    ...styles.menuItem,
                                    ...(isActive ? styles.activeMenuItem : {}),
                                }}
                            >
                                <div style={styles.menuIcon}>{item.icon}</div>
                                <span style={styles.menuText}>{item.text}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default Sidebar;