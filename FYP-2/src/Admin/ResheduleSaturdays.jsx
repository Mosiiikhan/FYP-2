import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaPlus, FaTrash, FaPen, FaTimes, FaArrowRight } from 'react-icons/fa';

const RescheduleSaturdays = () => {

  // --- 1. STATE ---
  const [schedules, setSchedules] = useState([]); // Database se data yahan ayega
  const [showModal, setShowModal] = useState(false);
  
  // Form Fields
  const [saturdayDate, setSaturdayDate] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [reason, setReason] = useState('');

  // Edit Mode
  const [editId, setEditId] = useState(null);

  // ✅ 2. BACKEND INTEGRATION: Fetch Data
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/saturdays');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      const mappedData = data.map(s => {
        return {
          id: s.saturday_id,
          saturdayDate: s.working_date ? s.working_date.split('T')[0] : '',
          holidayDate: s.holiday_date ? s.holiday_date.split('T')[0] : 'N/A', // ✅ Direct from new column
          reason: s.reason
        };
      });
      setSchedules(mappedData);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  // --- 3. FUNCTIONS ---

  const handleDelete = async (id) => {
    if (window.confirm("Delete this schedule?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/saturdays/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchSchedules(); 
        }
      } catch (err) {
        alert("Delete failed!");
      }
    }
  };

  const handleEdit = (item) => {
    setSaturdayDate(item.saturdayDate);
    setHolidayDate(item.holidayDate);
    setReason(item.reason);
    setEditId(item.id);
    setShowModal(true);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setSaturdayDate('');
    setHolidayDate('');
    setReason('');
    setEditId(null);
  };

  const handleSave = async () => {
    if (!saturdayDate || !holidayDate || !reason) {
      alert("Please fill all fields!");
      return;
    }

    const dateObj = new Date(saturdayDate);
    if (dateObj.getDay() !== 6) {
      alert("Error: The 'Working Date' MUST be a Saturday! 🛑");
      return;
    }

    // ✅ Payload matches your 4-column Controller
    const payload = {
      working_date: saturdayDate,
      holiday_date: holidayDate,
      reason: reason
    };

    try {
      let response;
      if (editId) {
        response = await fetch(`http://localhost:5000/api/saturdays/update/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('http://localhost:5000/api/saturdays/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchSchedules(); 
      } else {
        alert("Server Error while saving");
      }
    } catch (err) {
      alert("Network Error: Could not connect to server!");
    }
  };

  // --- 4. STYLES (Kept exactly as you provided with Modal fix) ---
  const styles = {
    container: { padding: '30px', fontFamily: "'Segoe UI', sans-serif", color: '#333' },
    headerCard: {
      backgroundColor: '#009688', color: 'white', padding: '25px',
      borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    title: { fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' },
    addBtn: {
      backgroundColor: 'white', color: '#009688', border: 'none', padding: '10px 20px',
      borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
    },
    card: {
      backgroundColor: 'white', borderLeft: '6px solid #FF9800', 
      padding: '20px', marginBottom: '15px', borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    dateFlow: { display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' },
    dateBox: { display: 'flex', flexDirection: 'column', fontSize: '13px', color: '#555' },
    dateValue: { fontSize: '15px', fontWeight: 'bold', color: '#333' },
    actionBtn: {
      border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', transition: '0.2s'
    },
    overlay: {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    modal: {
      backgroundColor: 'white', padding: '30px', borderRadius: '15px',
      width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column', gap: '15px',
      position: 'relative', zIndex: 1001
    },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '12px', fontWeight: 'bold', color: '#555' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' },
    btnGroup: { display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' },
    saveBtn: { backgroundColor: '#009688', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    cancelBtn: { backgroundColor: '#e0e0e0', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <div>
          <div style={styles.title}><FaCalendarCheck /> Reschedule Saturdays</div>
          <p style={{fontSize:'13px', opacity:0.9, marginTop:'5px'}}>Cover lost working days by opening on Saturdays.</p>
        </div>
        <button style={styles.addBtn} onClick={handleAddNew}>
          <FaPlus /> Add Schedule
        </button>
      </div>

      {schedules.length === 0 ? (
        <p style={{textAlign:'center', color:'#888'}}>No rescheduled Saturdays found.</p>
      ) : (
        schedules.map((s) => (
          <div key={s.id} style={styles.card}>
            <div>
              <div style={{fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom:'5px'}}>{s.reason}</div>
              <div style={styles.dateFlow}>
                <div style={styles.dateBox}>
                  <span>Working On (Sat)</span>
                  <span style={{...styles.dateValue, color:'#009688'}}>{s.saturdayDate}</span>
                </div>
                <FaArrowRight color="#999" />
                <div style={styles.dateBox}>
                  <span>Instead Of</span>
                  <span style={{...styles.dateValue, color:'#d32f2f'}}>{s.holidayDate}</span>
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap:'10px'}}>
              <button style={{...styles.actionBtn, backgroundColor:'#e3f2fd', color:'#1976d2'}} onClick={() => handleEdit(s)}>Edit</button>
              <button style={{...styles.actionBtn, backgroundColor:'#ffebee', color:'#d32f2f'}} onClick={() => handleDelete(s.id)}>Delete</button>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
              <span style={{fontSize:'18px', fontWeight:'bold', color:'#009688'}}>{editId ? 'Edit Schedule' : 'Add Schedule'}</span>
              <FaTimes style={{cursor:'pointer'}} onClick={() => setShowModal(false)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Saturday (Working Day)</label>
              <input type="date" style={styles.input} value={saturdayDate} onChange={(e) => setSaturdayDate(e.target.value)} />
              <span style={{fontSize:'10px', color:'#FF9800'}}>* System will verify if it's a Saturday</span>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Replacement for (Original Holiday)</label>
              <input type="date" style={styles.input} value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Reason / Note</label>
              <input type="text" placeholder="e.g. Covering for Strike on 15th" style={styles.input} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div style={styles.btnGroup}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave}>{editId ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescheduleSaturdays;