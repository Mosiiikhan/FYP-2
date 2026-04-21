// @ts-nocheck
import React, { useState } from 'react';
import axios from 'axios';
import { FaUserTie, FaTimes, FaCalendarPlus, FaLink, FaHourglassEnd } from 'react-icons/fa';

const ADDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Save Data to Database (Axios Call)
  const handleSaveMeeting = async () => {
    // Validation
    if (!formData.title || !formData.date || !formData.time || !formData.venue) {
      alert("Please fill essential fields (Title, Date, Time, Venue)");
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.welcomeBox}>
          <div style={styles.iconCircle}><FaUserTie size={25} color="white" /></div>
          <div>
            <h2 style={styles.welcomeTitle}>Welcome, Assistant Director</h2>
            <p style={styles.subTitle}>AD | FYP Coordination & Management</p>
          </div>
        </div>
        <button style={styles.addBtn} onClick={() => setShowModal(true)}>
          <FaCalendarPlus /> Schedule Meeting
        </button>
      </div>

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
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Semester</label>
                  <select name="semester" value={formData.semester} onChange={handleInputChange} style={styles.input}>
                    <option value="7th">7th Semester</option>
                    <option value="8th">8th Semester</option>
                    <option value="Both">Both</option>
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
                  <label style={styles.label}>Meeting Date & Time</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={styles.input} />
                    <input type="time" name="time" value={formData.time} onChange={handleInputChange} style={styles.input} />
                  </div>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Venue</label>
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
                </div>
              </div>

              <div style={styles.formGroup}>
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
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
};

export default ADDashboard;