import React, { useState, useEffect } from 'react';
import { FaCalendarDay, FaClock, FaMapPin, FaPlusCircle, FaTrashAlt, FaPenFancy } from 'react-icons/fa';

const ManageEvents = () => {
  
  // --- 1. STATE ---
  const [societies, setSocieties] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [formData, setFormData] = useState({
    society_id: '',
    title: '',
    date: '',
    timeVal: '',
    ampm: 'PM',
    venue: '',
    description: ''
  });

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- 2. BACKEND CONNECTIVITY ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const socRes = await fetch('http://localhost:5000/api/events/societies');
      const socData = await socRes.json();
      setSocieties(socData);
      fetchEvents();
    } catch (err) {
      console.error("Initial Fetch Error:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events/all');
      const data = await res.json();
      // ✅ Mapping backend columns to frontend state
      setEventsList(data.map(ev => ({
        id: ev.id, 
        society: ev.society_name,
        title: ev.title,
        date: ev.date ? ev.date.split('T')[0] : '',
        time: ev.time || 'N/A',
        venue: ev.venue || 'No Venue',
        description: ev.description || ''
      })));
    } catch (err) { console.error("Events Fetch Error:", err); }
  };

  // --- 3. FUNCTIONS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.society_id || !formData.title || !formData.date) {
        alert("Please fill in basic fields (Society, Title, Date)!");
        return;
    }

    const fullTime = formData.timeVal ? `${formData.timeVal} ${formData.ampm}` : 'TBD';

    // ✅ Payload exactly matching your updated Controller
    const payload = {
        society_id: formData.society_id,
        title: formData.title,
        date: formData.date,
        time: fullTime,
        venue: formData.venue,
        description: formData.description
    };

    try {
        setLoading(true);
        // Agar editId hai to update, warna add
        const url = editId 
            ? `http://localhost:5000/api/events/update/${editId}` 
            : 'http://localhost:5000/api/events/add';
            
        const response = await fetch(url, {
            method: editId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert(editId ? "Event Updated! ✨" : "Event Created Successfully! ✅");
            resetForm();
            fetchEvents();
        } else {
            const result = await response.json();
            alert("Error: " + result.message);
        }
    } catch (err) {
        alert("Server connection failed!");
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditId(event.id);
    let tVal = '';
    let tAmpm = 'PM';
    
    if (event.time && event.time.includes(' ')) {
        [tVal, tAmpm] = event.time.split(' ');
    }

    setFormData({
      society_id: '', // Society ID linking might need separate fetch if not in list
      title: event.title,
      date: event.date,
      timeVal: tVal,
      ampm: tAmpm,
      venue: event.venue,
      description: event.description
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this event?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/events/delete/${id}`, { method: 'DELETE' });
        if (res.ok) fetchEvents();
      } catch (err) { alert("Delete failed!"); }
    }
  };

  const resetForm = () => {
    setFormData({ society_id: '', title: '', date: '', timeVal: '', ampm: 'PM', venue: '', description: '' });
    setEditId(null);
  };

  // --- 4. STYLES ---
  const styles = {
    container: { padding: '40px', fontFamily: "'Segoe UI', sans-serif", display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start', backgroundColor: '#f4f7f6', minHeight: '100vh', boxSizing: 'border-box' },
    formCard: { flex: '0 0 350px', backgroundColor: '#00796B', padding: '25px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 30px rgba(0, 121, 107, 0.25)', height: 'fit-content' },
    headerTitle: { fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom:'25px', borderBottom:'1px solid rgba(255,255,255,0.2)', paddingBottom:'15px' },
    label: { fontSize: '11px', fontWeight: '700', marginBottom: '5px', display: 'block', color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase', letterSpacing:'0.5px' },
    input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', fontSize: '13px', outline: 'none', backgroundColor: 'white', color: '#333', marginBottom: '15px', boxSizing: 'border-box' },
    timeGroup: { display: 'flex', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' },
    timeInput: { flex: 2, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '13px' },
    ampmSelect: { flex: 1, padding: '10px', border: 'none', outline: 'none', backgroundColor: '#e0f2f1', color: '#00796B', fontWeight: 'bold', cursor: 'pointer', borderLeft: '1px solid #ddd', fontSize: '12px' },
    saveBtn: { width: '100%', backgroundColor: 'white', color: '#00796B', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '14px', textTransform:'uppercase', cursor: 'pointer', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    listSection: { flex: '0 0 350px', minWidth: '300px', height: '80vh', overflowY: 'auto', paddingRight: '5px' },
    listHeader: { color: '#004d40', fontSize: '18px', fontWeight:'bold', marginBottom: '15px', display:'flex', alignItems:'center', gap:'10px', position: 'sticky', top: 0, backgroundColor: '#f4f7f6', zIndex: 10 },
    gridContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
    eventCard: { backgroundColor: 'white', borderRadius: '8px', padding: '10px 12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '4px solid #00796B', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80px' },
    societyTag: { fontSize: '9px', color: '#00796B', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '3px' },
    cardTitle: { margin: '0', color: '#2c3e50', fontSize: '14px', fontWeight: 'bold' },
    infoRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#666', marginTop: '4px' },
    descText: { fontSize: '11px', color: '#888', marginTop: '6px', borderTop: '1px solid #eee', paddingTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    deleteBtn: { position: 'absolute', top: '10px', right: '10px', background: '#fdecea', color: '#e74c3c', border: 'none', cursor: 'pointer', padding:'5px', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.headerTitle}><FaPlusCircle size={18} /> {editId ? 'Edit Event' : 'Create New Event'}</div>

        <label style={styles.label}>Society Name</label>
        <select style={styles.input} name="society_id" value={formData.society_id} onChange={handleChange}>
          <option value="" disabled>Select Society</option>
          {societies.map((soc) => <option key={soc.society_id} value={soc.society_id}>{soc.society_name}</option>)}
        </select>

        <label style={styles.label}>Event Title</label>
        <input style={styles.input} type="text" name="title" placeholder="E.g. Seminar on AI" value={formData.title} onChange={handleChange} />

        <label style={styles.label}>📅 Date</label>
        <input style={{...styles.input, cursor:'pointer'}} type="date" name="date" value={formData.date} onChange={handleChange} onClick={(e) => e.target.showPicker()} />

        <label style={styles.label}>⏰ Time (Optional)</label>
        <div style={styles.timeGroup}>
          <input style={styles.timeInput} type="text" name="timeVal" placeholder="00:00" value={formData.timeVal} onChange={handleChange} />
          <select style={styles.ampmSelect} name="ampm" value={formData.ampm} onChange={handleChange}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        <label style={styles.label}>📍 Venue</label>
        <input style={styles.input} type="text" name="venue" placeholder="E.g. Auditorium" value={formData.venue} onChange={handleChange} />

        <label style={styles.label}>📝 Description</label>
        <textarea style={{...styles.input, height:'70px', resize:'none', marginBottom:0}} name="description" placeholder="Brief details..." value={formData.description} onChange={handleChange}></textarea>

        <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
          {loading ? 'Processing...' : (editId ? 'Update Event' : 'Save Event')}
        </button>
      </div>

      <div style={styles.listSection}>
        <div style={styles.listHeader}><FaPenFancy size={16} /> Scheduled Events</div>
        <div style={styles.gridContainer}>
          {eventsList.length === 0 ? (
            <div style={{textAlign:'center', color:'#aaa', marginTop:'20px'}}>No events found.</div>
          ) : (
            eventsList.map((event) => (
              <div key={event.id} style={styles.eventCard}>
                <button style={{...styles.deleteBtn, right: '45px', color: '#00796B', backgroundColor: '#e0f2f1'}} onClick={() => handleEdit(event)}><FaPenFancy size={12} /></button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(event.id)}><FaTrashAlt size={12} /></button>
                <div style={styles.societyTag}>{event.society}</div>
                <h3 style={styles.cardTitle}>{event.title}</h3>
                <div style={styles.infoRow}><FaCalendarDay size={12} color="#00796B" /> <span>{event.date}</span><span style={{margin:'0 8px', color:'#ccc'}}>|</span><FaClock size={12} color="#00796B" /> <span>{event.time}</span></div>
                <div style={styles.infoRow}><FaMapPin size={12} color="#e74c3c" /> <span>{event.venue}</span></div>
                <p style={styles.descText}>{event.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;