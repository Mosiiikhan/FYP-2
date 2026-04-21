import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login1 = () => {
  const navigate = useNavigate();
  
  // Input States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Login Function
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
        // 1. Backend API Call
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Login Successful
            
            // 2. Role normalization (lowercase + trim) taake koi matching error na aaye
            const rawRole = data.user.role; 
            const userRole = rawRole.toLowerCase().trim(); 
            
            console.log("Original Role form DB:", rawRole);
            console.log("Normalized Role:", userRole);

            // 3. LocalStorage ma data save karen (App.js Guards k liye zaroori hai)
            localStorage.setItem("userRole", userRole); 
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("userId", data.user.user_id); 
            
            // 4. Navigation Logic (Purely based on userRole)
            if (userRole === 'admin') {
                navigate('/admin');
            } 
            else if (userRole === 'datacell') {
                navigate('/dashboard'); 
            }
            else if (userRole === 'student') {
                navigate('/student/dashboard');
            }
            else if (userRole === 'teacher' || userRole === 'chairperson' || userRole === 'cp') {
                navigate('/chairPerson/dashboard');
            }
            // --- NEW AD ADDITION ---
            else if (userRole === 'ad') {
                navigate('/ad-dashboard');
            }
            // -----------------------
            else {
                alert("Unknown Role: " + rawRole);
                navigate('/dashboard'); 
            }

        } else {
            alert("❌ Login Failed: " + data.message);
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Server Error! Backend check karein (Check if Node server is running on port 5000).");
    }
  };

  // --- STYLES (Your Original 195-line Style Structure Preserved) ---
  const styles = {
    container: {
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      fontFamily: "'Segoe UI', sans-serif",
      margin: 0, 
      padding: 0
    },
    mainHeading: {
      fontSize: '40px',
      fontWeight: 'bold',
      color: '#00695c',
      marginBottom: '30px',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    card: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid #eee',
      width: '350px',
      textAlign: 'center',
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px'
    },
    subTitle: {
      margin: '0 0 20px 0', 
      color: '#0c0c0c', 
      fontSize: '20px', 
      fontWeight: '600'
    },
    label: {
      textAlign: 'left',
      fontWeight: '600',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '6px',
      border: '1px solid #141010',
      backgroundColor: '#0b0a0a',
      color: 'white',  
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#00796B',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px',
      marginTop: '10px',
      transition: '0.3s'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.mainHeading}>BIIT Academic Calendar</h1>
      <div style={styles.card}>
        <h3 style={styles.subTitle}>Login Portal</h3>
        <label style={styles.label}>Username / Arid No</label>
        <input 
          type="text" 
          placeholder="Username or Arid No" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <label style={styles.label}>Password</label>
        <input 
          type="password" 
          placeholder="" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleLogin} style={styles.button}>
          LOGIN
        </button>
      </div>
    </div>
  );
};

export default Login1;