import React, { useState, useEffect } from 'react';
import { FaCalendarTimes, FaPlus, FaTrash, FaPen, FaTimes } from 'react-icons/fa';

const EmergencyHolidays = () => {

  // --- 1. STATE ---
  const [holidays, setHolidays] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [editId, setEditId] = useState(null);

  // --- 2. BACKEND INTEGRATION: Fetch Data ---
  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/emergencyholiday');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      const mappedData = data.map(h => ({
        id: h.emergency_id,
        title: h.reason,
        startDate: h.start_date ? h.start_date.split('T')[0] : '',
        endDate: h.end_date ? h.end_date.split('T')[0] : ''
      }));
      setHolidays(mappedData);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    }
  };

  const emergencyReasons = [
    "Select Reason...",
    "Strike / Dharna (Political)",
    "Smog / Air Quality Policy",
    "Security Threat / Law & Order",
    "Heavy Rainfall / Flood Alert",
    "Unexpected Public Holiday",
    "Mourning Day (Sog)",
    "Other"
  ];

  // --- 3. FUNCTIONS ---

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/emergencyholiday/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchHolidays(); 
        }
      } catch (err) {
        alert("Delete failed!");
      }
    }
  };

  const handleEdit = (holiday) => {
    setStartDate(holiday.startDate);
    setEndDate(holiday.endDate);
    const isStandardReason = emergencyReasons.includes(holiday.title);
    if (isStandardReason) {
      setSelectedReason(holiday.title);
      setCustomReason('');
    } else {
      setSelectedReason('Other');
      setCustomReason(holiday.title);
    }
    setEditId(holiday.id);
    setShowModal(true);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setSelectedReason('');
    setCustomReason('');
    setEditId(null);
  };

  const handleSave = async () => {
    if (!startDate || !endDate || !selectedReason || selectedReason === "Select Reason...") {
      alert("Please fill Start Date, End Date and Reason!");
      return;
    }
    
    const finalTitle = selectedReason === "Other" ? customReason : selectedReason;
    
    const holidayPayload = {
      reason: finalTitle,
      start_date: startDate,
      end_date: endDate
    };

    try {
      let response;
      if (editId) {
        response = await fetch(`http://localhost:5000/api/emergencyholiday/update/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(holidayPayload)
        });
      } else {
        response = await fetch('http://localhost:5000/api/emergencyholiday/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(holidayPayload)
        });
      }

      const result = await response.json();

      // ✅ result.success check add kiya hai
      if (response.ok && (result.success || !editId)) { 
        setShowModal(false);
        resetForm();
        fetchHolidays(); 
      } else {
        alert("Server Error: " + (result.message || "Operation failed"));
      }
    } catch (err) {
      alert("Network Error: Could not connect to server!");
    }
  };

  const formatDateDisplay = (start, end) => {
    return start === end ? `📅 ${start}` : `📅 ${start} ➔ ${end}`;
  };

  // --- 4. STYLES ---
  const styles = {
    container: { padding: '30px', fontFamily: "'Segoe UI', sans-serif", color: '#333' },
    headerCard: { backgroundColor: '#009688', color: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' },
    addBtn: { backgroundColor: 'white', color: '#009688', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    card: { backgroundColor: 'white', borderLeft: '6px solid #d32f2f', padding: '15px 20px', marginBottom: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333' },
    cardDate: { fontSize: '13px', color: '#666', marginTop: '5px', fontWeight: '500' },
    actions: { display: 'flex', gap: '10px' }, // Gap kam kiya hai
    iconBtn: { width: '85px', height: '35px', borderRadius: '6px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', gap: '5px', fontSize: '12px' },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '15px' },
    modalHeader: { fontSize: '18px', fontWeight: 'bold', color: '#009688', display:'flex', justifyContent:'space-between'},
    row: { display: 'flex', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
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
          <div style={styles.title}><FaCalendarTimes /> Emergency Holidays</div>
          <p style={{fontSize:'13px', opacity:0.9, marginTop:'5px'}}>Manage unexpected closures securely.</p>
        </div>
        <button style={styles.addBtn} onClick={handleAddNew}>
          <FaPlus /> Add New
        </button>
      </div>

      {holidays.length === 0 ? (
        <p style={{textAlign:'center', color:'#888'}}>No holidays found in database.</p>
      ) : (
        holidays.map((h) => (
          <div key={h.id} style={styles.card}>
            <div>
              <div style={styles.cardTitle}>{h.title}</div>
              <div style={styles.cardDate}>{formatDateDisplay(h.startDate, h.endDate)}</div>
            </div>
            <div style={styles.actions}>
              <button style={{...styles.iconBtn, backgroundColor:'#e3f2fd', color:'#1976d2'}} onClick={() => handleEdit(h)}><FaPen size={12} /> Edit</button>
              <button style={{...styles.iconBtn, backgroundColor:'#ffebee', color:'#d32f2f'}} onClick={() => handleDelete(h.id)}><FaTrash size={12} />Delete</button>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <span>{editId ? 'Edit Holiday' : 'Add Holiday'}</span>
              <FaTimes style={{cursor:'pointer', color:'black'}} onClick={() => setShowModal(false)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Reason</label>
              <select style={styles.input} value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
                {emergencyReasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
              </select>
            </div>
            {selectedReason === "Other" && (
              <div style={styles.inputGroup}>
                <input type="text" placeholder="Type reason..." style={styles.input} value={customReason} onChange={(e) => setCustomReason(e.target.value)} />
              </div>
            )}
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>From (Start)</label>
                <input type="date" style={styles.input} value={startDate} onChange={(e) => { setStartDate(e.target.value); if(endDate === '') setEndDate(e.target.value); }} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>To (End)</label>
                <input type="date" style={styles.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
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

export default EmergencyHolidays;