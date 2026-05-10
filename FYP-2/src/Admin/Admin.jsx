import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. FUNCTIONS ---
  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); 
  };

  const goToCalendar = () => {
    navigate('/admin'); 
  };

  const goToHolidays = () => {
    navigate("/emergency-holidays"); 
  };

  const goToReschedule = () => {
    navigate("/reschedule-saturdays");
  };

  const goToIslamicAdjust = () => {
    navigate("/admin/islamic-adjust");
  };

  // 👇 Naya function: Manage Users page pr jany k liye
  const goToManageUsers = () => {
    navigate("/admin/manage-users");
  };

  // --- 2. STYLES ---
  const styles = {
    container: {
      width: '260px',
      height: '100%',
      backgroundColor: '#00645c',
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
      width: '100%' 
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

  const getActiveStyle = (path) => {
    const isActive = location.pathname === path || (path === '/admin' && location.pathname === '/admin');
    
    return {
      ...styles.sidebarBtn,
      backgroundColor: isActive ? 'white' : 'transparent',
      color: isActive ? '#00645c' : 'white',
      fontWeight: isActive ? 'bold' : '500'
    };
  };

  // --- 3. JSX ---
  return (
    <div style={styles.container}>
      
      <div style={styles.header}>Admin Dashboard</div>

      <div style={styles.menu}>
        
        <button 
          style={getActiveStyle('/admin')} 
          onClick={goToCalendar}
        >
          <span>📅</span> View Calendar
        </button>

        <button 
          style={getActiveStyle('/emergency-holidays')} 
          onClick={goToHolidays}
        >
          <span>🚨</span> Manage Holidays
        </button>

        <button 
          style={getActiveStyle('/reschedule-saturdays')} 
          onClick={goToReschedule}
        >
          <span>🔄</span> Reschedule Sat
        </button>

        <button 
          style={getActiveStyle('/admin/islamic-adjust')} 
          onClick={goToIslamicAdjust}
        >
          <span>🌙</span> Islamic Adjust
        </button>

        {/* 👇 Naya Button: Manage Users */}
        <button 
          style={getActiveStyle('/admin/manage-users')} 
          onClick={goToManageUsers}
        >
          <span>👥</span> Manage Users
        </button>

      </div>

      <button style={styles.logoutBtn} onClick={handleLogout}>
        🚪 LogOut
      </button>

    </div>
  );
};

export default Admin;
