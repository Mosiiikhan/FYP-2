import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ViewCalendar from '../ViewCalendar'; 
import { FaSignOutAlt, FaUserGraduate, FaBell } from 'react-icons/fa'; // 🔔 Bell Icon add kiya

const StudentDashboard = () => {
  const navigate = useNavigate();

  // --- 1. NOTIFICATION STATE (Naya Kaam) ---
  const [showNotif, setShowNotif] = useState(false); // Dropdown kholne/band karne k liye
  
  // Dummy Notifications Data
  const notifications = [
    { id: 1, text: "tomorrow university will be closed due to strike", time: "2 hrs ago" },
    { id: 2, text: "Mid Exam Datesheet uploaded ", time: "5 hrs ago" }
  ];

  // --- 2. USER INFO ---
  const username = localStorage.getItem("username");
  const displayUser = username ? username : "Student";

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // --- 3. STYLES ---
  const styles = {
    container: {
      width: '100vw',   // Full Width Fix
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', sans-serif",
      backgroundColor: '#f4f7f6'
    },
    header: {
      backgroundColor: '#05864e', 
      color: 'white',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      position: 'relative' // Dropdown ko sahi jagah dikhane k liye
    },
    logoArea: {
      display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold', textTransform: 'capitalize'
    },
    // 👇 Right side (Bell + Logout) ko group karne k liye
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    // 👇 Bell Icon ka Style
    bellContainer: {
      position: 'relative',
      cursor: 'pointer',
      fontSize: '20px'
    },
    badge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: 'red',
      color: 'white',
      borderRadius: '50%',
      padding: '2px 6px',
      fontSize: '10px',
      fontWeight: 'bold',
      border: '1px solid white'
    },
    // 👇 Dropdown Box ka Style
    dropdown: {
      position: 'absolute',
      top: '50px',
      right: '80px', // Logout button k thora left par
      width: '280px',
      backgroundColor: 'white',
      color: 'black',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 100,
      overflow: 'hidden',
      border: '1px solid #ddd'
    },
    notifItem: {
      padding: '12px',
      borderBottom: '1px solid #eee',
      fontSize: '13px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    time: {
      fontSize: '11px', color: 'gray', alignSelf: 'flex-end'
    },
    logoutBtn: {
      backgroundColor: 'white',
      color: '#c62828',
      border: 'none',
      padding: '8px 15px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      display: 'flex', alignItems: 'center', gap: '8px'
    },
    contentArea: {
      flex: 1, padding: '20px', overflow: 'auto'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        
        {/* Left Side: Welcome Name */}
        <div style={styles.logoArea}>
          <FaUserGraduate /> Welcome, {displayUser}
        </div>
        
        {/* Right Side: Bell + Logout */}
        <div style={styles.rightSection}>
          
          {/* 🔔 Notification Icon */}
          <div style={styles.bellContainer} onClick={() => setShowNotif(!showNotif)}>
            <FaBell />
            {/* Red Badge (Count: 2) */}
            <span style={styles.badge}>{notifications.length}</span>
          </div>

          {/* 🚪 Logout Button */}
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* 👇 NOTIFICATION DROPDOWN (Sirf tab dikhega jab showNotif true hoga) */}
        {showNotif && (
          <div style={styles.dropdown}>
            <div style={{padding: '10px', background: '#f5f5f5', fontWeight: 'bold', borderBottom:'1px solid #ddd'}}>
              Notifications
            </div>
            {notifications.map((note) => (
              <div key={note.id} style={styles.notifItem}>
                <span>{note.text}</span>
                <span style={styles.time}>{note.time}</span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* CALENDAR */}
      <div style={styles.contentArea}>
        <ViewCalendar />
      </div>

    </div>
  );
};

export default StudentDashboard;