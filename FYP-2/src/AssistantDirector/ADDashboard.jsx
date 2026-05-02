// @ts-nocheck
<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserTie, FaTimes, FaCalendarPlus, FaLink, 
  FaHourglassEnd, FaEdit, FaTrash 
} from 'react-icons/fa';
=======
import React, { useState } from 'react';
import axios from 'axios';
import { FaUserTie, FaTimes, FaCalendarPlus, FaLink, FaHourglassEnd } from 'react-icons/fa';
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4

const ADDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
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

=======

  // 1. Form State (Backend ke columns se match karta hai)
  const [formData, setFormData] = useState({
    title: '', 
    semester: '7th', 
    targetGroup: 'All', 
    date: '', 
    time: '',
    venue: '', 
    description: '', 
    deadlineDate: '', 
    deadlineTime: '', 
    attachmentLink: '' 
  });

  // 2. Input Change Handler
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

<<<<<<< HEAD
  // --- MODIFIED SAVE LOGIC ---
  const handleSaveMeeting = async () => {
=======
  // 3. Save Data to Database (Axios Call)
  const handleSaveMeeting = async () => {
    // Validation
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
    if (!formData.title || !formData.date || !formData.time || !formData.venue) {
      alert("Please fill essential fields (Title, Date, Time, Venue)");
      return;
    }

    setLoading(true);
<<<<<<< HEAD
    
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
=======
    try {
      // Backend URL (Make sure server is running on port 5000)
      const response = await axios.post("http://localhost:5000/api/meetings/add", formData);

      if (response.data.success) {
        alert("✅ Meeting Scheduled & Saved Successfully!");
        setShowModal(false); // Modal close karo
        
        // Form Reset
        setFormData({
          title: '', semester: '7th', targetGroup: 'All', date: '', time: '',
          venue: '', description: '', deadlineDate: '', deadlineTime: '', attachmentLink: '' 
        });
      }
    } catch (error) {
      console.error("❌ Error saving to DB:", error);
      alert("Error: Data save nahi hua. Backend check karo!");
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  return (
    <div style={styles.container}>
      {/* Header Section */}
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
      <div style={styles.header}>
        <div style={styles.welcomeBox}>
          <div style={styles.iconCircle}><FaUserTie size={25} color="white" /></div>
          <div>
<<<<<<< HEAD
            <h2 style={styles.welcomeTitle}>AD Dashboard</h2>
            <p style={styles.subTitle}>Manage FYP Meetings & Schedules</p>
=======
            <h2 style={styles.welcomeTitle}>Welcome, Assistant Director</h2>
            <p style={styles.subTitle}>AD | FYP Coordination & Management</p>
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
          </div>
        </div>
        <button style={styles.addBtn} onClick={() => setShowModal(true)}>
          <FaCalendarPlus /> Schedule Meeting
        </button>
      </div>

<<<<<<< HEAD
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
=======
      {/* --- SCHEDULE MEETING MODAL --- */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: '#000' }}>Create Meeting & Task</h3>
              <FaTimes style={{ cursor: 'pointer', color: '#000' }} onClick={() => setShowModal(false)} />
            </div>
            
            {/* Modal Body - Scrollable */}
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Meeting Title</label>
                <input name="title" value={formData.title} onChange={handleInputChange} style={styles.input} placeholder="e.g. FYP-II Mid Term Presentation" />
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Semester</label>
                  <select name="semester" value={formData.semester} onChange={handleInputChange} style={styles.input}>
                    <option value="7th">7th Semester</option>
                    <option value="8th">8th Semester</option>
<<<<<<< HEAD
=======
                    <option value="Both">Both</option>
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
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
<<<<<<< HEAD
                  <label style={styles.label}>Date & Time</label>
=======
                  <label style={styles.label}>Meeting Date & Time</label>
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={styles.input} />
                    <input type="time" name="time" value={formData.time} onChange={handleInputChange} style={styles.input} />
                  </div>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Venue</label>
<<<<<<< HEAD
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
=======
                  <input name="venue" value={formData.venue} onChange={handleInputChange} style={styles.input} placeholder="Venue" />
                </div>
              </div>

              {/* Deadline & Link Section */}
              <div style={styles.highlightSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <FaHourglassEnd color="#e67e22" /> <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#e67e22' }}>Submission Deadline</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="date" name="deadlineDate" value={formData.deadlineDate} onChange={handleInputChange} style={styles.innerInput} />
                  <input type="time" name="deadlineTime" value={formData.deadlineTime} onChange={handleInputChange} style={styles.innerInput} />
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <FaLink color="#2980b9" /> <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#2980b9' }}>Additional Resource Link</span>
                  </div>
                  <input name="attachmentLink" value={formData.attachmentLink} onChange={handleInputChange} style={styles.innerInput} placeholder="Paste link (Google Drive/etc.)" />
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
                </div>
              </div>

              <div style={styles.formGroup}>
<<<<<<< HEAD
                <label style={styles.label}>Instructions</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...styles.input, height: '60px', resize: 'none' }} />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button style={styles.submitBtn} onClick={handleSaveMeeting} disabled={loading}>
                {loading ? "Processing..." : (editId ? "Update Now" : "Schedule & Publish")}
=======
                <label style={styles.label}>Agenda / Instructions</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...styles.input, height: '70px', resize: 'none' }} placeholder="Provide instructions for students..." />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button 
                style={styles.submitBtn} 
                onClick={handleSaveMeeting}
                disabled={loading}
              >
                {loading ? "Saving..." : "Schedule & Publish"}
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

<<<<<<< HEAD
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
=======
// Styles (UI bilkul waisa hi hai jaisa tumne manga tha)
const styles = {
  container: { marginLeft: '260px', padding: '35px', width: 'calc(100% - 260px)', boxSizing: 'border-box', minHeight: '100vh', backgroundColor: '#f8fafb' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' },
  modalContent: { backgroundColor: 'white', width: '560px', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  modalHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  modalBody: { padding: '20px', overflowY: 'auto', flexGrow: 1 },
  modalFooter: { padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#000' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', color: '#000', backgroundColor: '#fff' },
  highlightSection: { padding: '15px', backgroundColor: '#fdf7f2', borderRadius: '10px', marginBottom: '15px', border: '1px solid #ffe8cc' },
  innerInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', color: '#000' },
  cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontWeight: 'bold', color: '#000' },
  submitBtn: { padding: '10px 25px', borderRadius: '8px', border: 'none', background: '#005f4b', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  welcomeBox: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconCircle: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#005f4b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  welcomeTitle: { margin: 0, fontSize: '24px', color: '#000' },
  subTitle: { margin: 0, color: '#666' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#005f4b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
};

export default ADDashboard;