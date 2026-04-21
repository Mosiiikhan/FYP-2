import React, { useState, useRef } from 'react'; // 🟢 useRef add kiya
import { useNavigate } from 'react-router-dom';

const Datesheet = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // 🟢 Input field ka reference
  const [file, setFile] = useState(null);
  const [semester, setSemester] = useState('Spring'); 
  const [examType, setExamType] = useState('Mid-Term');
  const [loading, setLoading] = useState(false);

  // 🟢 Manual click trigger function
  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log("File detected:", selectedFile.name);
    }
  };

  const handlePublish = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester', semester);
    formData.append('examType', examType);

    try {
      const response = await fetch("http://localhost:5000/api/exams/upload-datesheet", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        alert("Published Successfully! ✅");
        navigate('/dashboard');
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      alert("Backend not responding.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    mainContainer: { width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', fontFamily: "'Segoe UI', sans-serif" },
    card: { backgroundColor: 'white', width: '400px', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' },
    header: { marginBottom: '20px', textAlign: 'center' },
    label: { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' },
    select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px' },
    // 🟢 Box styling updated for better click area
    dashedBox: {
      border: file ? '2px solid #006400' : '2px dashed #006400',
      borderRadius: '12px', padding: '40px 20px', cursor: 'pointer',
      backgroundColor: file ? '#f0fff0' : '#fafafa', textAlign: 'center',
      marginBottom: '20px', transition: '0.2s'
    },
    publishBtn: { width: '100%', padding: '14px', backgroundColor: loading ? '#ccc' : '#006400', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{color: '#006400', margin: 0}}>Upload Datesheet</h2>
        </div>

        <label style={styles.label}>Semester</label>
        <select style={styles.select} value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="Spring">Spring</option>
          <option value="Fall">Fall</option>
        </select>

        <label style={styles.label}>Exam Type</label>
        <select style={styles.select} value={examType} onChange={(e) => setExamType(e.target.value)}>
          <option value="Mid-Term">Mid-Term</option>
          <option value="Final-Term">Final-Term</option>
        </select>

        {/* 🟢 Label ki jagah Div use ki aur onClick lagaya */}
        <div style={styles.dashedBox} onClick={handleBoxClick}>
          <div style={{fontSize: '40px'}}>{file ? "📄" : "📤"}</div>
          <div style={{fontWeight: 'bold', marginTop: '10px'}}>
            {file ? file.name : "Click to select Excel file"}
          </div>
          {file && <div style={{fontSize: '12px', color: '#666'}}>{(file.size / 1024).toFixed(1)} KB</div>}
        </div>

        {/* 🟢 Hidden Input with Ref */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".xlsx, .xls"
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />

        <button style={styles.publishBtn} onClick={handlePublish} disabled={loading}>
          {loading ? "Processing..." : "Publish Now"}
        </button>
      </div>
    </div>
  );
};

export default Datesheet;