// AssistantDirector/ADSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaPlusCircle, FaSignOutAlt, FaUserShield } from 'react-icons/fa';

const ADSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoSection}>
        <div style={styles.iconCircle}><FaUserShield size={25} /></div>
        <h2 style={styles.logoText}>AD PANEL</h2>
        <hr style={styles.divider} />
      </div>

      <div style={styles.menuItems}>
        <div style={styles.item} onClick={() => navigate('/ad-calendar')}>
          <FaCalendarAlt size={18} /> <span>View Calendar</span>
        </div>

        <div style={styles.item} onClick={() => navigate('/ad-dashboard')}>
          <FaPlusCircle size={18} /> <span>Schedule Meetings</span>
        </div>
      </div>

      <div style={styles.logoutSection}>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <FaSignOutAlt /> LogOut
        </button>
      </div>
    </div>
  );
};

// AssistantDirector/ADSidebar.jsx
const styles = {
  sidebar: { 
    backgroundColor: '#005f4b', 
    height: '100vh', 
    width: '260px', // Fixed width
    padding: '20px 15px', 
    color: 'white', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'fixed', 
    left: 0,
    top: 0,
    boxSizing: 'border-box',
    zIndex: 1000
  },
  // ... baqi styles wahi rehne dein

  logoSection: { textAlign: 'center', marginBottom: '20px' },
  iconCircle: { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' },
  logoText: { fontSize: '20px', fontWeight: 'bold', margin: 0 },
  divider: { opacity: 0.2, margin: '15px 0' },
  menuItems: { flex: 1 }, // Ye menu ko upar rakhe ga aur logout ko niche dhakele ga
  item: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', cursor: 'pointer', borderRadius: '8px', transition: '0.3s', marginBottom: '8px', fontSize: '15px' },
  logoutSection: { 
    marginTop: 'auto', // Logout button ko screen ke bottom par rakhe ga
    paddingBottom: '10px' 
  },
  logoutBtn: { 
    width: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '10px', 
    padding: '15px', // 35px se kam kar ke 15px kiya taake cut na ho
    backgroundColor: '#e74c3c', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: '0.3s'
  }
};

export default ADSidebar;