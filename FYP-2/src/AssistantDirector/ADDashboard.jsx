// @ts-nocheck
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserTie, FaTimes, FaCalendarPlus, FaLink, 
  FaHourglassEnd, FaEdit, FaTrash 
} from 'react-icons/fa';

const ADDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState([]); 
  const [editId, setEditId] = useState(null); 

  const [formData, setFormData] = useState({
    title: '', semester: '7th', targetGroup: 'All', date: '', time: '',
    venue: '', description: '', deadlineDate: '', deadlineTime: '', attachmentLink: '' 
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/meetings/all");
      setMeetings(response.data);
    } catch (error) {
      console.error("❌ Error fetching meetings:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- MODIFIED SAVE LOGIC ---
  const handleSaveMeeting = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.venue) {
      alert("Please fill essential fields (Title, Date, Time, Venue)");
      return;
    }

    setLoading(true);
    
    // SQL Server k liye empty dates ko handle karna
    const cleanData = {
        ...formData,
        deadlineDate: formData.deadlineDate || null,
        deadlineTime: formData.deadlineTime || null,
        attachmentLink: formData.attachmentLink || null,
        description: formData.description || null
    };

    try {
      if (editId) {
        // UPDATE MODE
        const response = await axios.put(`http://localhost:5000/api/meetings/update/${editId}`, cleanData);
        if (response.data.success) alert("✅ Meeting Updated Successfully!");
      } else {
        // ADD MODE
        const response = await axios.post("http://localhost:5000/api/meetings/add", cleanData);
        if (response.data.success) alert("✅ Meeting Scheduled Successfully!");
      }
      
      closeModal();
      fetchMeetings();
    } catch (error) {
      console.error("❌ API Error:", error.response?.data || error.message);
      alert("Error: " + (error.response?.data?.message || "Data save nahi hua!"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        await axios.delete(`http://localhost:5000/api/meetings/delete/${id}`);
        fetchMeetings();
      } catch (error) {
        alert("Delete failed!");
      }
    }
  };

  // --- MODIFIED EDIT LOGIC (FORMATTING DATE/TIME) ---
  const handleEdit = (meeting) => {
    setEditId(meeting.meeting_id);
    
    // Helper function to extract YYYY-MM-DD
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    };

    // Helper function to extract HH:mm
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.toString().substring(0, 5);
    };

    setFormData({
      title: meeting.title ?? '',
      semester: meeting.semester ?? '', 
      targetGroup: meeting.target_degree ?? '', 
      date: formatDate(meeting.meeting_date),
      time: formatTime(meeting.meeting_time),
      venue: meeting.venue ?? '',
      description: meeting.agenda_description ?? '',
      deadlineDate: formatDate(meeting.deadline_date),
      deadlineTime: formatTime(meeting.deadline_time),
      attachmentLink: meeting.attachment_link ?? ''
    });
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({
      title: '', semester: '7th', targetGroup: 'All', date: '', time: '',
      venue: '', description: '', deadlineDate: '', deadlineTime: '', attachmentLink: '' 
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.welcomeBox}>
          <div style={styles.iconCircle}><FaUserTie size={25} color="white" /></div>
          <div>
            <h2 style={styles.welcomeTitle}>AD Dashboard</h2>
            <p style={styles.subTitle}>Manage FYP Meetings & Schedules</p>
          </div>
        </div>
        <button style={styles.addBtn} onClick={() => setShowModal(true)}>
          <FaCalendarPlus /> Schedule Meeting
        </button>
      </div>

      {/* --- MEETINGS TABLE --- */}
      <div style={styles.tableCard}>
        <h3 style={{ marginBottom: '20px', color: '#000' }}>Scheduled Meetings List</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Semester</th>
              <th style={styles.th}>Date & Time</th>
              <th style={styles.th}>Venue</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length > 0 ? meetings.map((m) => (
              <tr key={m.meeting_id} style={styles.tr}>
                <td style={styles.td}><strong>{m.title}</strong></td>
                <td style={styles.td}>{m.semester} ({m.target_degree})</td>
                <td style={styles.td}>{new Date(m.meeting_date).toLocaleDateString()} | {m.meeting_time}</td>
                <td style={styles.td}>{m.venue}</td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(m)} style={styles.editIconBtn} title="Edit"><FaEdit /></button>
                  <button onClick={() => handleDelete(m.meeting_id)} style={styles.deleteIconBtn} title="Delete"><FaTrash /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No meetings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL FOR ADD/EDIT --- */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: '#000' }}>{editId ? "Update Meeting" : "Create Meeting"}</h3>
              <FaTimes style={{ cursor: 'pointer', color: '#000' }} onClick={closeModal} />
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Meeting Title</label>
                <input name="title" value={formData.title} onChange={handleInputChange} style={styles.input} />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Semester</label>
                  <select name="semester" value={formData.semester} onChange={handleInputChange} style={styles.input}>
                    <option value="7th">7th Semester</option>
                    <option value="8th">8th Semester</option>
                  </select>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Target Degree</label>
                  <select name="targetGroup" value={formData.targetGroup} onChange={handleInputChange} style={styles.input}>
                    <option value="All">All Degrees</option>
                    <option value="BSCS">BSCS</option>
                    <option value="BSIT">BSIT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ ...styles.formGroup, flex: 2 }}>
                  <label style={styles.label}>Date & Time</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={styles.input} />
                    <input type="time" name="time" value={formData.time} onChange={handleInputChange} style={styles.input} />
                  </div>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Venue</label>
                  <input name="venue" value={formData.venue} onChange={handleInputChange} style={styles.input} />
                </div>
              </div>

              <div style={styles.highlightSection}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}><FaHourglassEnd color="#e67e22" /> Deadline Date</label>
                    <input type="date" name="deadlineDate" value={formData.deadlineDate} onChange={handleInputChange} style={styles.innerInput} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Deadline Time</label>
                    <input type="time" name="deadlineTime" value={formData.deadlineTime} onChange={handleInputChange} style={styles.innerInput} />
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label style={styles.label}><FaLink color="#2980b9" /> Resource Link</label>
                  <input name="attachmentLink" value={formData.attachmentLink} onChange={handleInputChange} style={styles.innerInput} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Instructions</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...styles.input, height: '60px', resize: 'none' }} />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button style={styles.submitBtn} onClick={handleSaveMeeting} disabled={loading}>
                {loading ? "Processing..." : (editId ? "Update Now" : "Schedule & Publish")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { marginLeft: '260px', padding: '35px', width: 'calc(100% - 260px)', minHeight: '100vh', backgroundColor: '#f8fafb', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  welcomeBox: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconCircle: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#005f4b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  welcomeTitle: { margin: 0, fontSize: '22px', color: '#000' },
  subTitle: { margin: 0, color: '#666', fontSize: '14px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#005f4b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  tableCard: { backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', color: '#666', fontSize: '14px' },
  td: { padding: '15px 12px', borderBottom: '1px solid #eee', color: '#333', fontSize: '14px' },
  tr: { transition: '0.3s' },
  editIconBtn: { background: 'none', border: 'none', color: '#2980b9', cursor: 'pointer', fontSize: '18px', marginRight: '15px' },
  deleteIconBtn: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalContent: { backgroundColor: 'white', width: '550px', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '95vh' },
  modalHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: '20px', overflowY: 'auto' },
  modalFooter: { padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
  highlightSection: { padding: '15px', backgroundColor: '#fdf7f2', borderRadius: '10px', marginBottom: '15px', border: '1px solid #ffe8cc' },
  innerInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' },
  cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' },
  submitBtn: { padding: '10px 25px', borderRadius: '8px', border: 'none', background: '#005f4b', color: 'white', cursor: 'pointer', fontWeight: 'bold' }
};

export default ADDashboard;