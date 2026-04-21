// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; 

const Enrollment = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]); 
  const [loading, setLoading] = useState(false);

  // 🟢 File Selection aur Parsing Logic
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      console.log("File Selected:", selectedFile.name); 
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.readAsBinaryString(selectedFile);

      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          if (data && data.length > 0) {
            console.log("Data Loaded:", data);
            setFileData(data); // 🚩 Is se Upload button enable ho jayega
          } else {
            alert("Excel file khali hai!");
          }
        } catch (err) {
          console.error("XLSX Error:", err);
          alert("Excel read karne mein masla hai. 'npm install xlsx' check karein.");
        }
      };
    }
  };

  // 🟢 Database Upload Logic
  const handleUpload = async () => {
    // Button tabhi click hoga jab fileData mein data aa jaye
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/enrollment/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollments: fileData })
      });

      const result = await response.json();
      if (result.success) {
        alert(`${fileData.length} records successfully uploaded! ✅`);
        navigate('/dashboard');
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (error) {
      alert("Server error! Backend check karein.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    mainContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6', fontFamily: 'Arial' },
    card: { backgroundColor: 'white', width: '420px', padding: '35px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' },
    title: { color: '#006400', marginBottom: '10px' },
    inputGroup: { margin: '20px 0', textAlign: 'left' },
    fileInput: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '20px' },
    uploadBtn: { 
        width: '100%', 
        padding: '15px', 
        backgroundColor: '#006400', 
        color: 'white', 
        border: 'none', 
        borderRadius: '30px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        fontSize: '16px',
        transition: '0.3s'
    }
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>Upload Enrollment</h2>
        <p style={{fontSize: '14px', color: '#666'}}>Select Excel file (student_id, course_id)</p>

        <div style={styles.inputGroup}>
          {/* 🚩 Direct input use kar rahe hain taake click miss na ho */}
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileChange} 
            style={styles.fileInput}
          />
        </div>

        {fileData.length > 0 && (
          <div style={{color: 'green', marginBottom: '15px', fontWeight: 'bold'}}>
            ✅ {fileData.length} records ready to upload!
          </div>
        )}

        <button 
          style={{
            ...styles.uploadBtn, 
            backgroundColor: (fileData.length === 0 || loading) ? '#cccccc' : '#006400',
            cursor: (fileData.length === 0 || loading) ? 'not-allowed' : 'pointer'
          }} 
          onClick={handleUpload} 
          disabled={fileData.length === 0 || loading}
        >
          {loading ? "Processing..." : "Confirm & Upload"}
        </button>
      </div>
    </div>
  );
};

export default Enrollment;