import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const location = useLocation();

  // --- 1. FUNCTIONS ---
=======
  const location = useLocation(); // 👇 Active button check krny k liye ye add kiya

  // --- 1. FUNCTIONS (Aapke Purane Functions Wapis) ---
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); 
  };

  const goToCalendar = () => {
<<<<<<< HEAD
=======
    // 👇 Change: Isay '/admin-calendar' ki bajaye '/admin' kiya hai
    // Taake ye wapis wahan le jaye jahan Calendar default load hua tha.
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
    navigate('/admin'); 
  };

  const goToHolidays = () => {
    navigate("/emergency-holidays"); 
  };

  const goToReschedule = () => {
    navigate("/reschedule-saturdays");
  };

<<<<<<< HEAD
  // 👇 Naya function: Islamic Adjustment page pr jany k liye
  const goToIslamicAdjust = () => {
    navigate("/admin/islamic-adjust");
  };

  // --- 2. STYLES (Aapke original styles preserved hain) ---
=======
  // --- 2. STYLES ---
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
  const styles = {
    container: {
      width: '260px',
      height: '100%',
<<<<<<< HEAD
      backgroundColor: '#00645c',
=======
      backgroundColor: '#00645c', // DataCell wala same color (Consistency k liye)
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
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
<<<<<<< HEAD
=======
    
    // 👇 Base Style for Buttons (Aapka purana style)
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
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
<<<<<<< HEAD
      width: '100%' 
    },
=======
      width: '100%' // Ensure full width
    },

>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
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

<<<<<<< HEAD
  const getActiveStyle = (path) => {
    const isActive = location.pathname === path || (path === '/admin' && location.pathname === '/admin');
    
    return {
      ...styles.sidebarBtn,
      backgroundColor: isActive ? 'white' : 'transparent',
      color: isActive ? '#00645c' : 'white',
=======
  // 👇 Helper: Ye check karega k konsa button Active hai aur color change karega
  const getActiveStyle = (path) => {
    // Agar path match kare, YA hum '/admin' par hain aur Calendar button check ho rha hai
    const isActive = location.pathname === path || (path === '/admin' && location.pathname === '/admin');
    
    return {
      ...styles.sidebarBtn, // Purana style
      backgroundColor: isActive ? 'white' : 'transparent', // Active ho to White
      color: isActive ? '#00645c' : 'white', // Text color change
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
      fontWeight: isActive ? 'bold' : '500'
    };
  };

  // --- 3. JSX ---
  return (
    <div style={styles.container}>
      
<<<<<<< HEAD
      <div style={styles.header}>Admin Dashboard</div>

      <div style={styles.menu}>
        
=======
      {/* Header */}
      <div style={styles.header}>Admin Dashboard</div>

      {/* Menu Links */}
      <div style={styles.menu}>
        
        {/* 1. View Calendar (Ab ye Active/Highlight b hoga aur sahi navigate b karega) */}
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
        <button 
          style={getActiveStyle('/admin')} 
          onClick={goToCalendar}
        >
          <span>📅</span> View Calendar
        </button>

<<<<<<< HEAD
=======
        {/* 2. Holidays */}
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
        <button 
          style={getActiveStyle('/emergency-holidays')} 
          onClick={goToHolidays}
        >
          <span>🚨</span> Manage Holidays
        </button>

<<<<<<< HEAD
=======
        {/* 3. Reschedule */}
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
        <button 
          style={getActiveStyle('/reschedule-saturdays')} 
          onClick={goToReschedule}
        >
          <span>🔄</span> Reschedule Sat
        </button>

<<<<<<< HEAD
        {/* 👇 Naya Button: Islamic Adjustment (Preserving existing style logic) */}
        <button 
          style={getActiveStyle('/admin/islamic-adjust')} 
          onClick={goToIslamicAdjust}
        >
          <span>🌙</span> Islamic Adjust
        </button>

      </div>

=======
      </div>

      {/* Logout */}
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
      <button style={styles.logoutBtn} onClick={handleLogout}>
        🚪 LogOut
      </button>

    </div>
  );
};

export default Admin;