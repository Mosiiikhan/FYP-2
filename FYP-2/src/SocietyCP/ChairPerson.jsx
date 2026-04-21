import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserFriends, FaMagic, FaCalendarAlt, FaSignOutAlt, FaUserTie } from 'react-icons/fa';

const ChairPerson = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Active button highlight karne k liye

  // --- 1. NAVIGATION FUNCTIONS (Routes Updated ✅) ---

  const goToDashboard = () => {
    navigate('/chairperson/dashboard'); // ✅ Fixed Route
  };

  const goToEvents = () => {
    navigate('/chairperson/events');    // ✅ Fixed Route
  };

  const goToCalendar = () => {
    navigate('/chairperson/cp-calendar');  // ✅ Fixed Route
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.clear();
      navigate('/'); 
    }
  };

  // --- 2. STYLES (Compact Sidebar Look ✅) ---
  const styles = {
    container: { 
      height: '100vh',           // Full Height
      width: '100%',             // Sidebar width fill kare
      backgroundColor: '#00796B', // Teal Green Theme
      padding: '20px', 
      fontFamily: "'Segoe UI', sans-serif",
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    },
    
    // Header (Simple Text, no Big Card)
    header: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '30px',
      textAlign: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
      paddingBottom: '15px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
    },

    // Menu Container
    menu: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },

    // Buttons (Compact & Clean)
    item: {
      padding: '12px 15px',
      fontSize: '14px',
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: 'transparent', // Default transparent
      color: 'white',
      border: 'none',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: '0.2s',
      width: '100%'
    },
    
    // Logout (Bottom Red)
    logoutBtn: {
      padding: '12px',
      backgroundColor: '#d32f2f', // Red
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginTop: 'auto', // Bottom par dhakel dega
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
      width: '100%'
    }
  };

  // Active Button Style Helper
  const isActive = (path) => location.pathname === path 
    ? { backgroundColor: 'rgba(255,255,255,0.2)', fontWeight: 'bold' } 
    : {};

  return (
    <div style={styles.container}>
      
      {/* 1. Header Section */}
      <div style={styles.header}>
        <FaUserTie size={22} /> Chairperson
      </div>

      {/* 2. Menu Buttons */}
      <div style={styles.menu}>
        
        {/* Dashboard Home */}
        <button 
          style={{...styles.item, ...isActive('/chairperson/dashboard')}} 
          onClick={goToDashboard}
        >
          <FaUserFriends /> Dashboard
        </button>

        {/* Manage Events */}
        <button 
          style={{...styles.item, ...isActive('/chairperson/events')}} 
          onClick={goToEvents}
        >
          <FaMagic /> Manage Events
        </button>

        {/* View Calendar */}
        {/* <button 
          style={{...styles.item, ...isActive('/chairperson/calendar')}} 
          onClick={goToCalendar}
        >
          <FaCalendarAlt /> View Calendar
        </button> */}

      </div>

      {/* 3. Logout Button */}
      <button style={styles.logoutBtn} onClick={handleLogout}>
        <FaSignOutAlt /> LogOut
      </button>

    </div>
  );
};

export default ChairPerson;