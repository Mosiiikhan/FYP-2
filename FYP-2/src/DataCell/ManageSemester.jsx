// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageSemester = () => {
  const navigate = useNavigate();
  
  // --- 1. STATES ---
  const [year, setYear] = useState('2026');
  const [activeTab, setActiveTab] = useState('Fall'); 

  const [semesterData, setSemesterData] = useState({
    Fall: { durationStart: '', durationEnd: '', midStart: '', midEnd: '', studentStart: '', studentEnd: '', finalStart: '', finalEnd: '', breakStart: '', breakEnd: '' },
    Spring: { durationStart: '', durationEnd: '', midStart: '', midEnd: '', studentStart: '', studentEnd: '', finalStart: '', finalEnd: '', breakStart: '', breakEnd: '' },
    Summer: { durationStart: '', durationEnd: '', midStart: '', midEnd: '', studentStart: '', studentEnd: '', finalStart: '', finalEnd: '', breakStart: '', breakEnd: '' }
  });

  const currentData = semesterData[activeTab] || {};

  const handleDateChange = (field, value) => {
    setSemesterData(prevData => ({
      ...prevData,
      [activeTab]: { ...prevData[activeTab], [field]: value }
    }));
  };

  // --- 2. LOGIC (FIXED CONNECTION) ---
  const handleSave = async () => {
    const payload = {
        events: [
            { title: `${activeTab} Semester ${year}`, type: "Semester", start: currentData.durationStart, end: currentData.durationEnd, color: "#05864e" },
            { title: "Mid Term Exams", type: "Exam", start: currentData.midStart, end: currentData.midEnd, color: "#6fb696" },
            { title: "Student Week", type: "Activity", start: currentData.studentStart, end: currentData.studentEnd, color: "#a5992a" },
            { title: "Final Exams", type: "Exam", start: currentData.finalStart, end: currentData.finalEnd, color: "#004d40" },
            { title: "Semester Break", type: "Holiday", start: currentData.breakStart, end: currentData.breakEnd, color: "#ffc107" }
        ].filter(event => event.start && event.end)
    };

    if (payload.events.length === 0) {
        alert("At least one date range must be filled!");
        return;
    }

    try {
        // 👇 FIXED URL & HEADERS
        const response = await fetch("http://127.0.0.1:5000/api/calendar/manage-semester", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Server error occurred");
        }

        const result = await response.json();
        alert(`✅ ${activeTab} ${year} Schedule Saved Successfully!`);
        navigate('/dashboard'); 

    } catch (error) {
        console.error("Save Error Detail:", error);
        // Agar yahan "Failed to fetch" aye to iska matlab backend band hai
        alert("Server Error! Check if your Node.js Terminal is running on port 5000");
    }
  };

  const goBack = () => navigate('/dashboard');

  // --- 3. STYLES (No Changes Here) ---
  const styles = {
    page: { width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', paddingTop: '20px', paddingBottom: '20px', fontFamily: 'sans-serif' },
    card: { backgroundColor: 'white', width: '95%', maxWidth: '500px', borderRadius: '15px', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #eee', paddingBottom: '10px' },
    tabsRow: { display: 'flex', backgroundColor: '#f0f0f0', borderRadius: '25px', padding: '5px', marginBottom: '15px' },
    tabBtn: { flex: 1, padding: '10px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
    contentArea: { flex: 1, overflowY: 'auto', paddingRight: '5px', maxHeight: '60vh' },
    subHeading: { fontSize: '12px', fontWeight: 'bold', color: '#006400', marginTop: '15px', marginBottom: '8px', borderBottom: '1px solid #eee' },
    inputRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
    inputGroup: { flex: 1 },
    label: { fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '3px', display: 'block' },
    input: { width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' },
    saveBtn: { backgroundColor: '#006400', color: 'white', width: '100%', padding: '15px', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' },
    backBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }
  };

  const getTabStyle = (tabName) => ({
    ...styles.tabBtn,
    backgroundColor: activeTab === tabName ? 'white' : 'transparent',
    color: activeTab === tabName ? '#006400' : '#666'
  });

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button onClick={goBack} style={styles.backBtn}>⬅</button>
          <h2 style={{color: '#006400', margin: 0, fontSize: '18px'}}>Manage Semester</h2>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} style={{padding: '5px', width: '60px'}} />
        </div>
        <div style={styles.tabsRow}>
          {['Fall', 'Spring', 'Summer'].map(t => (
            <button key={t} style={getTabStyle(t)} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>
        <div style={styles.contentArea}>
          <div style={styles.subHeading}>SEMESTER DURATION</div>
          <div style={styles.inputRow}>
            <div style={styles.inputGroup}><label style={styles.label}>Start Date</label><input type="date" style={styles.input} value={currentData.durationStart} onChange={(e) => handleDateChange('durationStart', e.target.value)} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>End Date</label><input type="date" style={styles.input} value={currentData.durationEnd} onChange={(e) => handleDateChange('durationEnd', e.target.value)} /></div>
          </div>
          <div style={styles.subHeading}>MID TERM EXAMS</div>
          <div style={styles.inputRow}>
            <div style={styles.inputGroup}><label style={styles.label}>Start Date</label><input type="date" style={styles.input} value={currentData.midStart} onChange={(e) => handleDateChange('midStart', e.target.value)} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>End Date</label><input type="date" style={styles.input} value={currentData.midEnd} onChange={(e) => handleDateChange('midEnd', e.target.value)} /></div>
          </div>
          <div style={styles.subHeading}>STUDENT WEEK</div>
          <div style={styles.inputRow}>
            <div style={styles.inputGroup}><label style={styles.label}>Start Date</label><input type="date" style={styles.input} value={currentData.studentStart} onChange={(e) => handleDateChange('studentStart', e.target.value)} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>End Date</label><input type="date" style={styles.input} value={currentData.studentEnd} onChange={(e) => handleDateChange('studentEnd', e.target.value)} /></div>
          </div>
          <div style={styles.subHeading}>FINAL EXAMS</div>
          <div style={styles.inputRow}>
            <div style={styles.inputGroup}><label style={styles.label}>Start Date</label><input type="date" style={styles.input} value={currentData.finalStart} onChange={(e) => handleDateChange('finalStart', e.target.value)} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>End Date</label><input type="date" style={styles.input} value={currentData.finalEnd} onChange={(e) => handleDateChange('finalEnd', e.target.value)} /></div>
          </div>
          <div style={styles.subHeading}>SEMESTER BREAK</div>
          <div style={styles.inputRow}>
            <div style={styles.inputGroup}><label style={styles.label}>Start Date</label><input type="date" style={styles.input} value={currentData.breakStart} onChange={(e) => handleDateChange('breakStart', e.target.value)} /></div>
            <div style={styles.inputGroup}><label style={styles.label}>End Date</label><input type="date" style={styles.input} value={currentData.breakEnd} onChange={(e) => handleDateChange('breakEnd', e.target.value)} /></div>
          </div>
        </div>
        <button style={styles.saveBtn} onClick={handleSave}>Save {activeTab} Changes</button>
      </div>
    </div>
  );
};

export default ManageSemester;