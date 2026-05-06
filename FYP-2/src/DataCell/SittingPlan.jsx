import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SittingPlan = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      
      if (fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'csv') {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError('');
      } else {
        setError('Please select an Excel file (.xlsx, .xls, or .csv)');
        setFile(null);
        setFileName('');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a sitting plan file! 🪑");
      return;
    }
    
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:5000/api/seating-plan/upload-seating-plan', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`✅ Success! ${result.inserted} seating records uploaded.`);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    mainContainer: {
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: "'Segoe UI', sans-serif",
      padding: '20px'
    },
    card: {
      backgroundColor: 'white',
      width: '90%',
      maxWidth: '500px',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    headerTitle: {
      color: '#006400',
      fontSize: '26px',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    headerSub: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '30px'
    },
    fileInput: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '20px',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    selectedFile: {
      backgroundColor: '#e8f5e9',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      color: '#006400'
    },
    errorMsg: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '20px',
      textAlign: 'left'
    },
    uploadBtn: {
      width: '100%',
      padding: '15px',
      backgroundColor: '#006400',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1
    }
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.card}>
        
        <h2 style={styles.headerTitle}>SITTING PLAN</h2>
        <p style={styles.headerSub}>Upload Exam Hall Arrangement</p>

        <input 
          type="file" 
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          style={styles.fileInput}
        />

        {fileName && (
          <div style={styles.selectedFile}>
            ✅ Selected: {fileName}
          </div>
        )}

        {error && (
          <div style={styles.errorMsg}>
            ⚠️ {error}
          </div>
        )}

        <button 
          style={styles.uploadBtn} 
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? '⏳ Uploading...' : '📤 Publish Sitting Plan'}
        </button>

      </div>
    </div>
  );
};

export default SittingPlan;