import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { FaCalendarDay, FaClock, FaMapPin, FaPlusCircle, FaTrashAlt, FaPenFancy, FaLock, FaGlobe, FaUserShield } from 'react-icons/fa';

const ManageEvents = () => {
  
  // --- 1. LOCAL STORAGE DATA ---
  const loggedInSocietyId = localStorage.getItem("societyId");
  const loggedInSocietyName = localStorage.getItem("societyName") || "Your Society";
  const lockedColor = localStorage.getItem("assignedColor") || "#00796B";

  // --- 2. STATE ---
  const [eventsList, setEventsList] = useState([]);
  const [formData, setFormData] = useState({
    society_id: loggedInSocietyId,
=======
import { FaCalendarDay, FaClock, FaMapPin, FaPlusCircle, FaTrashAlt, FaPenFancy } from 'react-icons/fa';

const ManageEvents = () => {
  
  // --- 1. STATE ---
  const [societies, setSocieties] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [formData, setFormData] = useState({
    society_id: '',
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
    title: '',
    date: '',
    timeVal: '',
    ampm: 'PM',
    venue: '',
<<<<<<< HEAD
    description: '',
    visibility: 'public' // ✅ Default visibility
=======
    description: ''
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
  });

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  useEffect(() => {
    fetchEvents();
  }, []);

=======
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

>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events/all');
      const data = await res.json();
<<<<<<< HEAD
      
      const myEvents = data.filter(ev => String(ev.society_id) === String(loggedInSocietyId));

      setEventsList(myEvents.map(ev => ({
=======
      // ✅ Mapping backend columns to frontend state
      setEventsList(data.map(ev => ({
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
        id: ev.id, 
        society: ev.society_name,
        title: ev.title,
        date: ev.date ? ev.date.split('T')[0] : '',
        time: ev.time || 'N/A',
        venue: ev.venue || 'No Venue',
<<<<<<< HEAD
        description: ev.description || '',
        visibility: ev.visibility || 'public' // ✅ Get visibility from backend
=======
        description: ev.description || ''
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
      })));
    } catch (err) { console.error("Events Fetch Error:", err); }
  };

<<<<<<< HEAD
=======
  // --- 3. FUNCTIONS ---
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
<<<<<<< HEAD
    if (!formData.title || !formData.date) {
        alert("Please fill in basic fields (Title and Date)!");
=======
    if (!formData.society_id || !formData.title || !formData.date) {
        alert("Please fill in basic fields (Society, Title, Date)!");
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
        return;
    }

    const fullTime = formData.timeVal ? `${formData.timeVal} ${formData.ampm}` : 'TBD';

<<<<<<< HEAD
    const payload = {
        society_id: loggedInSocietyId,
=======
    // ✅ Payload exactly matching your updated Controller
    const payload = {
        society_id: formData.society_id,
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
        title: formData.title,
        date: formData.date,
        time: fullTime,
        venue: formData.venue,
<<<<<<< HEAD
        description: formData.description,
        visibility: formData.visibility, // ✅ Added to payload
        event_type: 'Society' // Added as discussed for backend logic
=======
        description: formData.description
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
    };

    try {
        setLoading(true);
<<<<<<< HEAD
=======
        // Agar editId hai to update, warna add
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
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
<<<<<<< HEAD
    if (event.time && event.time.includes(' ')) {
        [tVal, tAmpm] = event.time.split(' ');
    }
    setFormData({
      society_id: loggedInSocietyId,
=======
    
    if (event.time && event.time.includes(' ')) {
        [tVal, tAmpm] = event.time.split(' ');
    }

    setFormData({
      society_id: '', // Society ID linking might need separate fetch if not in list
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
      title: event.title,
      date: event.date,
      timeVal: tVal,
      ampm: tAmpm,
      venue: event.venue,
<<<<<<< HEAD
      description: event.description,
      visibility: event.visibility // ✅ Load visibility for editing
=======
      description: event.description
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
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
<<<<<<< HEAD
    setFormData({ 
        society_id: loggedInSocietyId, 
        title: '', 
        date: '', 
        timeVal: '', 
        ampm: 'PM', 
        venue: '', 
        description: '',
        visibility: 'public' 
    });
    setEditId(null);
  };

=======
    setFormData({ society_id: '', title: '', date: '', timeVal: '', ampm: 'PM', venue: '', description: '' });
    setEditId(null);
  };

  // --- 4. STYLES ---
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
  const styles = {
    container: { padding: '40px', fontFamily: "'Segoe UI', sans-serif", display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start', backgroundColor: '#f4f7f6', minHeight: '100vh', boxSizing: 'border-box' },
    formCard: { flex: '0 0 350px', backgroundColor: '#00796B', padding: '25px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 30px rgba(0, 121, 107, 0.25)', height: 'fit-content' },
    headerTitle: { fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom:'25px', borderBottom:'1px solid rgba(255,255,255,0.2)', paddingBottom:'15px' },
    label: { fontSize: '11px', fontWeight: '700', marginBottom: '5px', display: 'block', color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase', letterSpacing:'0.5px' },
    input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', fontSize: '13px', outline: 'none', backgroundColor: 'white', color: '#333', marginBottom: '15px', boxSizing: 'border-box' },
<<<<<<< HEAD
    
    // ✅ Dropdown Styling
    select: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', fontSize: '13px', outline: 'none', backgroundColor: 'white', color: '#333', marginBottom: '15px', boxSizing: 'border-box', cursor: 'pointer', fontWeight: '500' },

    lockedSocietyBox: { padding: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: `2px solid ${lockedColor}`, color: 'white', fontWeight: 'bold', fontSize: '14px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' },
=======
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
    timeGroup: { display: 'flex', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' },
    timeInput: { flex: 2, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '13px' },
    ampmSelect: { flex: 1, padding: '10px', border: 'none', outline: 'none', backgroundColor: '#e0f2f1', color: '#00796B', fontWeight: 'bold', cursor: 'pointer', borderLeft: '1px solid #ddd', fontSize: '12px' },
    saveBtn: { width: '100%', backgroundColor: 'white', color: '#00796B', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '14px', textTransform:'uppercase', cursor: 'pointer', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    listSection: { flex: '0 0 350px', minWidth: '300px', height: '80vh', overflowY: 'auto', paddingRight: '5px' },
    listHeader: { color: '#004d40', fontSize: '18px', fontWeight:'bold', marginBottom: '15px', display:'flex', alignItems:'center', gap:'10px', position: 'sticky', top: 0, backgroundColor: '#f4f7f6', zIndex: 10 },
    gridContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
<<<<<<< HEAD
    eventCard: { backgroundColor: 'white', borderRadius: '8px', padding: '10px 12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: `4px solid ${lockedColor}`, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80px' },
    societyTag: { fontSize: '9px', color: lockedColor, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' },
    cardTitle: { margin: '0', color: '#2c3e50', fontSize: '14px', fontWeight: 'bold' },
    infoRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#666', marginTop: '4px' },
    descText: { fontSize: '11px', color: '#888', marginTop: '6px', borderTop: '1px solid #eee', paddingTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    deleteBtn: { position: 'absolute', top: '10px', right: '10px', background: '#fdecea', color: '#e74c3c', border: 'none', cursor: 'pointer', padding:'5px', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' },
    
    // Visibility Badge in Card
    visBadge: (isPub) => ({
        fontSize: '8px',
        padding: '2px 6px',
        borderRadius: '10px',
        backgroundColor: isPub ? '#e8f5e9' : '#fff3e0',
        color: isPub ? '#2e7d32' : '#ef6c00',
        marginLeft: 'auto',
        border: `1px solid ${isPub ? '#c8e6c9' : '#ffe0b2'}`
    })
=======
    eventCard: { backgroundColor: 'white', borderRadius: '8px', padding: '10px 12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '4px solid #00796B', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80px' },
    societyTag: { fontSize: '9px', color: '#00796B', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '3px' },
    cardTitle: { margin: '0', color: '#2c3e50', fontSize: '14px', fontWeight: 'bold' },
    infoRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#666', marginTop: '4px' },
    descText: { fontSize: '11px', color: '#888', marginTop: '6px', borderTop: '1px solid #eee', paddingTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    deleteBtn: { position: 'absolute', top: '10px', right: '10px', background: '#fdecea', color: '#e74c3c', border: 'none', cursor: 'pointer', padding:'5px', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' }
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.headerTitle}><FaPlusCircle size={18} /> {editId ? 'Edit Event' : 'Create New Event'}</div>

<<<<<<< HEAD
        <label style={styles.label}>Society Name (Locked)</label>
        <div style={styles.lockedSocietyBox}>
            <FaLock size={12} style={{opacity: 0.7}} /> {loggedInSocietyName}
        </div>
=======
        <label style={styles.label}>Society Name</label>
        <select style={styles.input} name="society_id" value={formData.society_id} onChange={handleChange}>
          <option value="" disabled>Select Society</option>
          {societies.map((soc) => <option key={soc.society_id} value={soc.society_id}>{soc.society_name}</option>)}
        </select>
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4

        <label style={styles.label}>Event Title</label>
        <input style={styles.input} type="text" name="title" placeholder="E.g. Seminar on AI" value={formData.title} onChange={handleChange} />

<<<<<<< HEAD
        {/* ✅ New Visibility Field */}
        <label style={styles.label}>👁️ Event Visibility</label>
        <select 
            style={{
                ...styles.select, 
                borderLeft: formData.visibility === 'private' ? '5px solid #ff9800' : '5px solid #4caf50'
            }} 
            name="visibility" 
            value={formData.visibility} 
            onChange={handleChange}
        >
            <option value="public">🌍 Public (All Students)</option>
            <option value="private">🔒 Private (Subscribers Only)</option>
        </select>

=======
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
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
<<<<<<< HEAD
                <div style={{display:'flex', alignItems:'center'}}>
                   <div style={styles.societyTag}>{event.society}</div>
                   {/* ✅ Visibility Badge in Card */}
                   <span style={styles.visBadge(event.visibility === 'public')}>
                     {event.visibility === 'public' ? <><FaGlobe /> PUBLIC</> : <><FaUserShield /> PRIVATE</>}
                   </span>
                </div>
                
                <button style={{...styles.deleteBtn, right: '45px', color: '#00796B', backgroundColor: '#e0f2f1'}} onClick={() => handleEdit(event)}><FaPenFancy size={12} /></button>
                <button style={styles.deleteBtn} onClick={handleDelete.bind(null, event.id)}><FaTrashAlt size={12} /></button>
                
                <h3 style={styles.cardTitle}>{event.title}</h3>
                <div style={styles.infoRow}><FaCalendarDay size={12} color={lockedColor} /> <span>{event.date}</span><span style={{margin:'0 8px', color:'#ccc'}}>|</span><FaClock size={12} color={lockedColor} /> <span>{event.time}</span></div>
=======
                <button style={{...styles.deleteBtn, right: '45px', color: '#00796B', backgroundColor: '#e0f2f1'}} onClick={() => handleEdit(event)}><FaPenFancy size={12} /></button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(event.id)}><FaTrashAlt size={12} /></button>
                <div style={styles.societyTag}>{event.society}</div>
                <h3 style={styles.cardTitle}>{event.title}</h3>
                <div style={styles.infoRow}><FaCalendarDay size={12} color="#00796B" /> <span>{event.date}</span><span style={{margin:'0 8px', color:'#ccc'}}>|</span><FaClock size={12} color="#00796B" /> <span>{event.time}</span></div>
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
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