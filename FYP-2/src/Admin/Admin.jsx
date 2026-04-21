import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 👇 Active button check krny k liye ye add kiya

  // --- 1. FUNCTIONS (Aapke Purane Functions Wapis) ---
  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); 
  };

  const goToCalendar = () => {
    // 👇 Change: Isay '/admin-calendar' ki bajaye '/admin' kiya hai
    // Taake ye wapis wahan le jaye jahan Calendar default load hua tha.
    navigate('/admin'); 
  };

  const goToHolidays = () => {
    navigate("/emergency-holidays"); 
  };

  const goToReschedule = () => {
    navigate("/reschedule-saturdays");
  };

  // --- 2. STYLES ---
  const styles = {
    container: {
      width: '260px',
      height: '100%',
      backgroundColor: '#00645c', // DataCell wala same color (Consistency k liye)
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      boxSizing: 'border-box',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      color: 'white',
      fontFamily: "'Segoe UI', sans-serif"
    },
    header: {
      fontSize: '22px',
      fontWeight: 'bold',
      marginBottom: '30px',
      textAlign: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
      paddingBottom: '15px',
      textTransform: 'uppercase'
    },
    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      flex: 1
    },
    
    // 👇 Base Style for Buttons (Aapka purana style)
    sidebarBtn: {
      padding: '12px 15px',
      fontSize: '15px',
      cursor: 'pointer',
      border: 'none',
      borderRadius: '8px',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: '0.3s',
      fontWeight: '500',
      width: '100%' // Ensure full width
    },

    logoutBtn: {
      padding: '12px',
      backgroundColor: '#d32f2f',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginTop: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
    }
  };

  // 👇 Helper: Ye check karega k konsa button Active hai aur color change karega
  const getActiveStyle = (path) => {
    // Agar path match kare, YA hum '/admin' par hain aur Calendar button check ho rha hai
    const isActive = location.pathname === path || (path === '/admin' && location.pathname === '/admin');
    
    return {
      ...styles.sidebarBtn, // Purana style
      backgroundColor: isActive ? 'white' : 'transparent', // Active ho to White
      color: isActive ? '#00645c' : 'white', // Text color change
      fontWeight: isActive ? 'bold' : '500'
    };
  };

  // --- 3. JSX ---
  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>Admin Dashboard</div>

      {/* Menu Links */}
      <div style={styles.menu}>
        
        {/* 1. View Calendar (Ab ye Active/Highlight b hoga aur sahi navigate b karega) */}
        <button 
          style={getActiveStyle('/admin')} 
          onClick={goToCalendar}
        >
          <span>📅</span> View Calendar
        </button>

        {/* 2. Holidays */}
        <button 
          style={getActiveStyle('/emergency-holidays')} 
          onClick={goToHolidays}
        >
          <span>🚨</span> Manage Holidays
        </button>

        {/* 3. Reschedule */}
        <button 
          style={getActiveStyle('/reschedule-saturdays')} 
          onClick={goToReschedule}
        >
          <span>🔄</span> Reschedule Sat
        </button>

      </div>

      {/* Logout */}
      <button style={styles.logoutBtn} onClick={handleLogout}>
        🚪 LogOut
      </button>

    </div>
  );
};

export default Admin;