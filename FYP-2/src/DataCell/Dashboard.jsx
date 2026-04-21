import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
// Dashboard ab "Layout" ka kaam karega
import ViewCalendar from '../ViewCalendar'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Login se username uthayen
  const userName = localStorage.getItem("username") || "User";

  // --- FUNCTIONS ---
  const goToSemester = () => navigate('/manage-semester');
  const goToHolidays = () => navigate('/holidays');
  const goToDatesheet = () => navigate('/datesheet');
  const goToEnrollment = () => navigate('/enrollment');
  const goToSittingPlan = () => navigate('/sittingplan');
  const goToCalendar = () => navigate('/dashboard'); 

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // --- STYLES ---
  const styles = {
    mainContainer: {
      display: 'flex',       
      height: '100vh',       
      width: '100vw',        
      backgroundColor: '#f4f7f6',
      overflow: 'hidden'
    },
    sidebar: {
      width: '260px',
      height: '100%',
      backgroundColor: '#00645c',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      boxSizing: 'border-box',
      borderRight: '2px solid rgba(255,255,255,0.2)',
      color: 'white',
      fontFamily: 'sans-serif',
      flexShrink: 0
    },
    contentArea: {
      flex: 1,               
      padding: '20px', 
      overflowY: 'auto',     
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#f4f7f6'
    },
    header: { fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' },
    welcomeText: { fontSize: '14px', marginBottom: '30px', textAlign: 'center', opacity: 0.8, borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '15px' },
    menu: { display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
    getBtnStyle: (path) => {
      // Logic to highlight buttons
      const isActive = location.pathname === path || (path === '/calendar' && location.pathname === '/dashboard');
      return {
        padding: '12px 15px', fontSize: '15px', cursor: 'pointer',
        backgroundColor: isActive ? 'white' : 'transparent',
        color: isActive ? '#00645c' : 'white',
        border: 'none', borderRadius: '8px', textAlign: 'left',
        fontWeight: isActive ? 'bold' : 'normal',
        display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s ease'
      };
    },
    logoutBtn: { padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', textAlign: 'center' }
  };

  return (
    <div style={styles.mainContainer}>
      
      {/* 🟢 LEFT SIDE: SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.header}>Datacell Panel</div>
        <div style={styles.welcomeText}>Welcome, {userName}</div>

        <div style={styles.menu}>
          <button style={styles.getBtnStyle('/calendar')} onClick={goToCalendar}>
            <span>📆</span> View Calendar
          </button>
          
          <button style={styles.getBtnStyle('/manage-semester')} onClick={goToSemester}>
            <span>📅</span> Manage Semester
          </button>

          <button style={styles.getBtnStyle('/holidays')} onClick={goToHolidays}>
            <span>🎉</span> Manage Holidays
          </button>

          <button style={styles.getBtnStyle('/datesheet')} onClick={goToDatesheet}>
            <span>📄</span> Upload Datesheet
          </button>

          <button style={styles.getBtnStyle('/enrollment')} onClick={goToEnrollment}>
            <span>👥</span> Upload Enrollment
          </button>

          <button style={styles.getBtnStyle('/sittingplan')} onClick={goToSittingPlan}>
            <span>🪑</span> Sitting Plan
          </button>
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {/* 🟢 RIGHT SIDE: DYNAMIC CONTENT */}
      <div style={styles.contentArea}>
          {/* Agar URL '/dashboard' ha to Calendar dikhao, 
             varna baki screens (Manage Semester etc) Outlet ma khulengi 
          */}
          {location.pathname === '/dashboard' ? <ViewCalendar /> : <Outlet />}
      </div>

    </div>
  );
};

export default Dashboard;