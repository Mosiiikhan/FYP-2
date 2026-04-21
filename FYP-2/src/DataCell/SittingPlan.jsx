import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SittingPlan = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  // --- Functions ---
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a sitting plan file! 🪑");
      return;
    }
    alert(`Success! Sitting Plan '${file.name}' uploaded.`);
    navigate('/dashboard');
  };

  // --- Styles (White Card Theme) ---
  const styles = {
    mainContainer: {
      // backgroundImage: "url('/bg.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      // position: 'fixed',
      // top: 0, left: 0,
      width: '100%', height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.5)', 
      backgroundBlendMode: 'overlay',
      fontFamily: "'Segoe UI', sans-serif"
    },
    card: {
      backgroundColor: 'white',
      width: '90%',
      maxWidth: '450px',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      textAlign: 'center'
    },
    
    // --- Header Section (Tag) ---
    headerTitle: {
      color: '#006400', // BIIT Green
      fontSize: '26px',
      fontWeight: 'bold',
      marginBottom: '5px',
      textTransform: 'uppercase', // Tag jaisa look dene k liye
      letterSpacing: '1px'
    },
    headerSub: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '30px'
    },

    // --- Upload Box (Simplified) ---
    dashedBox: {
      border: '2px dashed #006400',
      borderRadius: '12px',
      padding: '40px 20px',
      backgroundColor: '#f1f8e9', // Light Green BG
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '30px',
      transition: '0.3s'
    },
    iconCircle: {
      width: '60px', height: '60px',
      borderRadius: '50%',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      marginBottom: '15px',
      fontSize: '28px'
    },
    uploadText: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '5px'
    },
    
    // --- Action Button ---
    uploadBtn: {
      width: '100%',
      padding: '15px',
      backgroundColor: '#006400',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
    }
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.card}>
        
        {/* Header Tag - Sirf Name */}
        <h2 style={styles.headerTitle}>Sitting Plan</h2>
        <p style={styles.headerSub}>Upload Exam Hall Arrangement</p>

        {/* Upload Area */}
        <label 
          htmlFor="sittingPlanFile" 
          style={styles.dashedBox}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e8f5e9'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f8e9'}
        >
          <div style={styles.iconCircle}>🪑</div> {/* Chair Icon */}
          
          <div style={styles.uploadText}>
            {file ? file.name : "Click to upload file"}
          </div>
          <div style={{fontSize: '12px', color: '#888'}}>
             PDF, JPG, PNG (Max 10MB)
          </div>
        </label>

        {/* Hidden Input */}
        <input 
          id="sittingPlanFile" 
          type="file" 
          accept=".pdf, .jpg, .png, .xlsx"
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />

        {/* Button */}
        <button 
          style={styles.uploadBtn} 
          onClick={handleUpload}
          onMouseOver={(e) => e.target.style.backgroundColor = '#004d00'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#006400'}
        >
          Publish Sitting Plan
        </button>

      </div>
    </div>
  );
};

export default SittingPlan;