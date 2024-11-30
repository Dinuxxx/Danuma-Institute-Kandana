import React, { useState } from 'react';
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

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const styles = {
    sidebar: {
      backgroundColor: '#87CEFA',
      width: isOpen ? '200px' : '70px', // Adjusted collapsed width
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
      fontSize: '28px', // Larger toggle button size
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
      padding: '12px 20px', // Consistent padding
      color: '#333',
      cursor: 'pointer',
      transition: 'padding 0.3s ease-in-out',
      fontSize: '18px', // Larger font size for menu text
    },
    menuItemHover: {
      backgroundColor: '#add8e6',
    },
    menuIcon: {
      fontSize: '30px', // Larger icon size
      minWidth: '30px', // Ensures icon doesn't collapse
      marginRight: isOpen ? '12px' : '0', // Adjusts spacing dynamically
      transition: 'margin-right 0.3s ease-in-out', // Smooth transition for margin
    },
    menuText: {
      opacity: isOpen ? 1 : 0,
      whiteSpace: 'nowrap',
      transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
      transform: isOpen ? 'translateX(0)' : 'translateX(-15px)',
      pointerEvents: isOpen ? 'auto' : 'none',
    },
  };

  const menuItems = [
    { icon: <FaHome />, text: 'Dashboard' },
    { icon: <FaBook />, text: 'Courses' },
    { icon: <FaTrophy />, text: 'Exams' },
    { icon: <FaClipboardList />, text: 'Attendance' },
    { icon: <FaMoneyBill />, text: 'Payments' },
    { icon: <FaUsers />, text: 'Users' },
    { icon: <FaBullhorn />, text: 'Notices' },
    { icon: <FaCalendarAlt />, text: 'Time Tables' },
  ];

  return (
    <div style={styles.sidebar}>
      <button onClick={toggleSidebar} style={styles.toggleBtn}>
        ☰
      </button>
      <div style={styles.menuItems}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={styles.menuItem}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.menuItemHover.backgroundColor)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div style={styles.menuIcon}>{item.icon}</div>
            <span style={styles.menuText}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
