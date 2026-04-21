// @ts-nocheck
import React, { useState, useEffect } from 'react';

const ManageHolidays = () => {
  // --- STATES ---
  const [holidays, setHolidays] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    definition_id: '',
    title: '',
    type: 'National',
    startDate: '',
    endDate: '',
    description: ''
  });

  // 🟢 1. FETCH DATA ON LOAD
  useEffect(() => {
    fetchDefinitions();
    fetchPublicHolidays();
  }, []);

  const fetchDefinitions = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/holidays/definitions");
        const data = await res.json();
        console.log("Fetched Definitions:", data); // 🚩 Ye check karein terminal/console mein
        setDefinitions(Array.isArray(data) ? data : []); // Safety check
    } catch (err) { 
        console.error("Definitions Load Error:", err); 
    }
};
  const fetchPublicHolidays = async () => {
    try {
      // 🚩 FIXED URL: 'all-events' use karein jo calendarController mein hai
      const res = await fetch("http://localhost:5000/api/calendar/all-events");
      const data = await res.json();
      
      // 🚩 FIXED FILTER: Database se 'holiday' type ka data uthana
      if (Array.isArray(data)) {
        const onlyHolidays = data.filter(item => 
          (item.type || "").toLowerCase().trim() === 'holiday'
        );

        setHolidays(onlyHolidays.map(h => ({
          id: h.id,
          title: h.title,
          type: h.type || 'Holiday',
          startDate: h.start_date, // Backend already YYYY-MM-DD bhej raha hai
          endDate: h.end_date
        })));
      }
    } catch (err) { console.error("Holidays Load Error:", err); }
  };

  // --- LOGIC ---
  const handleAddNew = () => {
    setFormData({ definition_id: '', title: '', type: 'National', startDate: '', endDate: '', description: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert("Please fill Name and Dates!");
      return;
    }

    const payload = {
      definition_id: formData.definition_id || null,
      holiday_name: formData.title,
      holiday_type: formData.type,
      start_date: formData.startDate,
      end_date: formData.endDate,
      description: formData.description || "Academic Holiday"
    };

    try {
      const response = await fetch("http://localhost:5000/api/holidays/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (result.success) {
        alert("Holiday Saved Successfully! ✅");
        fetchPublicHolidays(); // Refresh list to show new holiday
        setShowModal(false);
      }
    } catch (err) {
      alert("Error saving to Server");
    }
  };

  // --- STYLES (No changes here) ---
  const styles = {
    page: { width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', paddingTop: '30px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6' },
    mobileCard: { backgroundColor: 'white', width: '90%', maxWidth: '500px', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '15px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    searchInput: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', outline: 'none' },
    addBtn: { backgroundColor: '#000', color: 'white', border: 'none', width: '100%', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    listContainer: { flex: 1, overflowY: 'auto' },
    holidayCard: { backgroundColor: '#f0f9ff', borderRadius: '12px', padding: '15px', marginBottom: '10px', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#ffffff', width: '90%', maxWidth: '400px', padding: '25px', borderRadius: '15px' },
    label: { fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', display: 'block', color: '#555' },
    modalInput: { 
      width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #444', 
      boxSizing: 'border-box', marginBottom: '15px', backgroundColor: '#333', color: '#fff', outline: 'none' 
    },
    saveBtn: { width: '100%', padding: '12px', backgroundColor: '#05864e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#777', border: 'none', cursor: 'pointer' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.mobileCard}>
        <div style={styles.header}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>Manage Holidays</h2>
          <span style={{ fontSize: '20px' }}>📅</span>
        </div>

        <input style={styles.searchInput} placeholder="Search holidays..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <button style={styles.addBtn} onClick={handleAddNew}>+ Add New Holiday</button>

        <div style={styles.listContainer}>
          {holidays.filter(h => h.title.toLowerCase().includes(searchTerm.toLowerCase())).map((h) => (
            <div key={h.id} style={styles.holidayCard}>
              <div style={{ textAlign: 'center', minWidth: '50px', borderRight: '1px solid #ddd', marginRight: '15px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{h.startDate ? new Date(h.startDate).getDate() : '--'}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{h.startDate ? new Date(h.startDate).toLocaleString('default', { month: 'short' }) : '--'}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>{h.title}</div>
                <span style={{ fontSize: '10px', backgroundColor: '#87CEEB', padding: '2px 8px', borderRadius: '4px', color: '#004085', fontWeight: 'bold' }}>
                  {h.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3 style={{ marginTop: 0, color: '#333' }}>Add New Holiday</h3>
              
              <label style={styles.label}>Select Definition</label>
              <select style={styles.modalInput} value={formData.definition_id} 
                onChange={(e) => {
                  const def = definitions.find(d => d.definition_id === parseInt(e.target.value));
                  setFormData({ ...formData, definition_id: e.target.value, title: def ? def.holiday_name : '', type: def ? def.holiday_type : 'National' });
                }}>
                <option value="">-- Manual Entry --</option>
                {definitions.map(def => (
    <option key={def.definition_id} value={def.definition_id}>
        {def.holiday_name} {/* 🚩 Agar table mein 'name' hai to yahan 'name' likhein */}
    </option>
))}
              </select>

              <label style={styles.label}>Holiday Name</label>
              <input style={styles.modalInput} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Kashmir Day" />

              <label style={styles.label}>Holiday Type</label>
              <select style={styles.modalInput} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="National">National</option>
                <option value="Islamic">Islamic</option>
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Start Date</label>
                  <input type="date" style={styles.modalInput} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>End Date</label>
                  <input type="date" style={styles.modalInput} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>

              <button style={styles.saveBtn} onClick={handleSave}>Save Holiday</button>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
      `}</style>
    </div>
  );
};

export default ManageHolidays;