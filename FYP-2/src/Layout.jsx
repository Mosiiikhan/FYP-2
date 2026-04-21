import React from 'react';
import { Outlet } from 'react-router-dom';

// Notice: Humne yahan 'Dashboard' ya 'Admin' ko import NAHI kiya.
// Wo hum 'App.jsx' se bhejen gy.

const Layout = ({ SidebarComponent }) => {
  
  const styles = {
    mainContainer: {
      display: 'flex',      // Row (Agul Bagul)
      height: '100vh',      // Full Screen Height
      width: '100vw',
      overflow: 'hidden'
    },
    sidebarBox: {
      width: '260px',       // Sidebar ki fixed width
      flexShrink: 0         // Ye sikurega nahi
    },
    contentBox: {
      flex: 1,              // Bachi hui saari jagah Content lega
      backgroundColor: '#f0f2f5', 
      overflowY: 'auto',    // Scroll sirf yahan hoga
      position: 'relative'
    }
  };

  return (
    <div style={styles.mainContainer}>
      
      {/* 1. LEFT SIDE: Jo bhi Sidebar App.jsx se milegi, wo yahan lagegi */}
      <div style={styles.sidebarBox}>
        {SidebarComponent && <SidebarComponent />}
      </div>

      {/* 2. RIGHT SIDE: Page Content */}
      <div style={styles.contentBox}>
        <Outlet />
      </div>

    </div>
  );
};

export default Layout;