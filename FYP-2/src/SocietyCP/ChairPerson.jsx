<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserFriends, FaMagic, FaSignOutAlt, FaUserTie, FaPalette } from 'react-icons/fa';

const ChairPerson = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [societyInfo, setSocietyInfo] = useState({
    id: localStorage.getItem("societyId"),
    color: localStorage.getItem("assignedColor")
  });
  const [loading, setLoading] = useState(false);

  const colorList = ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#E67E22', '#1ABC9C', '#34495E', '#D35400', '#27AE60', '#2980B9', '#8E44AD', '#16A085', '#C0392B', '#7F8C8D'];

  const handleColorLock = async (selectedColor) => {
    if (!societyInfo.id || societyInfo.id === "null") {
        alert("Please logout and login again.");
        return;
    }

    if (window.confirm(`Lock this color for your society?`)) {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/events/lock-color", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ societyId: societyInfo.id, colorCode: selectedColor }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("assignedColor", selectedColor);
          setSocietyInfo({ ...societyInfo, color: selectedColor });
          alert("Society Identity Locked! ✅");
        } else {
          // Yeh message dikhaye ga: "Taken by AI Society"
          alert("❌ Error: " + data.message);
        }
      } catch (err) { alert("Server Error!"); }
      finally { setLoading(false); }
    }
  };

  const styles = {
    container: { height: '100vh', width: '100%', backgroundColor: '#00796B', padding: '20px', fontFamily: "'Segoe UI', sans-serif", color: 'white', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
    header: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    colorSection: { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '15px', marginBottom: '20px', textAlign: 'center' },
    colorLabel: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'block', opacity: 0.8 },
    scrollList: { display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 5px' },
    colorCircle: { minWidth: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', border: '2px solid white', transition: '0.2s', flexShrink: 0 },
    lockedBadge: { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '13px', fontWeight: '600' },
    indicatorLarge: { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: societyInfo.color, border: '2px solid white' },
    menu: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    item: { padding: '12px 15px', fontSize: '14px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', color: 'white', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', width: '100%' },
    logoutBtn: { padding: '12px', backgroundColor: '#d32f2f', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }
  };

  const isActive = (path) => location.pathname === path ? { backgroundColor: 'rgba(255,255,255,0.2)', fontWeight: 'bold' } : {};

  return (
    <div style={styles.container}>
      <div style={styles.header}><FaUserTie size={22} /> Chairperson</div>
      <div style={styles.colorSection}>
        <span style={styles.colorLabel}><FaPalette /> Society Identity</span>
        {societyInfo.color && societyInfo.color !== "null" ? (
          <div style={styles.lockedBadge}><div style={styles.indicatorLarge}></div><span>Identity Locked</span></div>
        ) : (
          <><div style={styles.scrollList}>{colorList.map((c, i) => (<div key={i} style={{...styles.colorCircle, backgroundColor: c}} onClick={() => !loading && handleColorLock(c)} />))}</div><span style={{fontSize: '9px', opacity: 0.6}}>Pick a unique color</span></>
        )}
      </div>
      <div style={styles.menu}>
        <button style={{...styles.item, ...isActive('/chairperson/dashboard')}} onClick={() => navigate('/chairperson/dashboard')}><FaUserFriends /> Dashboard</button>
        <button style={{...styles.item, ...isActive('/chairperson/events')}} onClick={() => navigate('/chairperson/events')}><FaMagic /> Manage Events</button>
      </div>
      <button style={styles.logoutBtn} onClick={() => { if(window.confirm("Logout?")) { localStorage.clear(); navigate('/'); } }}><FaSignOutAlt /> LogOut</button>
=======
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

>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
    </div>
  );
};

export default ChairPerson;