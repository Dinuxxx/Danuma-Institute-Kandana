import React from 'react';
import { Link, usePage } from '@inertiajs/react'; // Import Link and usePage
import {
    FaHome,
    FaBook,
    FaTrophy,
    FaClipboardList,
    FaMoneyBill,
    FaUsers,
    FaBullhorn,
    FaCalendarAlt,
} from 'react-icons/fa';

function Sidebar({ isOpen, toggleSidebar }) {
    const { url } = usePage(); // Get the current URL from Inertia's usePage hook

    const styles = {
        sidebar: {
            backgroundColor: '#87CEFA',
            width: isOpen ? '250px' : '70px',
            height: '100vh',
            paddingTop: '20px',
            overflow: 'hidden',
            transition: 'width 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
        toggleBtn: {
            background: 'none',
            border: 'none',
            fontSize: '28px',
            color: '#333',
            cursor: 'pointer',
            margin: '10px 10px 20px',
        },
        menuItems: {
            marginTop: '20px',
            width: '100%',
        },
        menuItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            color: '#333',
            cursor: 'pointer',
            transition: 'padding 0.3s ease-in-out',
            fontSize: '18px',
            // Make sure active state styles are applied before hover styles
        },
        menuItemHover: {
            backgroundColor: '#add8e6', // Hover background color
        },
        menuIcon: {
            fontSize: '30px',
            minWidth: '30px',
            marginRight: isOpen ? '12px' : '0',
            transition: 'margin-right 0.3s ease-in-out',
        },
        menuText: {
            opacity: isOpen ? 1 : 0,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
            transform: isOpen ? 'translateX(0)' : 'translateX(-15px)',
            pointerEvents: isOpen ? 'auto' : 'none',
        },
        activeMenuItem: {
            backgroundColor: '#fff',
            fontWeight: 'bold',
        },
    };

    // Define the menu items with their corresponding links
    const menuItems = [
        { icon: <FaHome />, text: 'Dashboard', link: '/dashboard' },
        { icon: <FaBook />, text: 'Courses', link: '/admin/courses' },
        { icon: <FaTrophy />, text: 'Exams', link: '/admin/exams' },
        { icon: <FaClipboardList />, text: 'Attendance', link: '/admin/attendance' },
        { icon: <FaMoneyBill />, text: 'Payments', link: '/admin/payments' },
        { icon: <FaUsers />, text: 'Users', link: '/admin/users' },
        { icon: <FaBullhorn />, text: 'Notices', link: '/admin/notices' },
        { icon: <FaCalendarAlt />, text: 'Time Tables', link: '/admin/time-tables' },
    ];

    return (
        <div style={styles.sidebar}>
            <button onClick={toggleSidebar} style={styles.toggleBtn}>
                ☰
            </button>
            <div style={styles.menuItems}>
                {menuItems.map((item, index) => {
                    // Check if the current URL matches the menu item link
                    const isActive = url === item.link;
                    return (
                        <Link key={index} href={item.link} style={{ textDecoration: 'none' }}>
                            <div
                                className='hover:font-bold'
                                style={{
                                    ...styles.menuItem,
                                    ...(isActive ? styles.activeMenuItem : {}),
                                    // Keep the hover style independent of the active state
                                }}
                                onMouseOver={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = styles.menuItemHover.backgroundColor;
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
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
