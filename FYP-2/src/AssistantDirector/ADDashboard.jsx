// @ts-nocheck
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserTie, FaTimes, FaCalendarPlus, FaLink, 
  FaHourglassEnd, FaEdit, FaTrash, FaChevronDown 
} from 'react-icons/fa';

const ADDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState([]); 
  const [editId, setEditId] = useState(null); 
  const [showDegreeDropdown, setShowDegreeDropdown] = useState(false);

  const degreesList = ["CS", "AI", "SE"];

  const [formData, setFormData] = useState({
    title: '', semester: '7', targetDegrees: [], date: '', time: '',
    venue: '', description: '', deadlineDate: '', deadlineTime: '', attachmentLink: '' 
  });

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/meetings/all");
      setMeetings(response.data);
    } catch (error) { console.error("❌ Error fetching meetings:", error); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDegreeChange = (deg) => {
    setFormData(prev => {
      const currentDegrees = prev.targetDegrees;
      if (currentDegrees.includes(deg)) {
        return { ...prev, targetDegrees: currentDegrees.filter(d => d !== deg) };
      } else {
        return { ...prev, targetDegrees: [...currentDegrees, deg] };
      }
    });
  };

  const handleSaveMeeting = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.venue) {
      alert("Please fill essential fields (Title, Date, Time, Venue)");
      return;
    }
    if (formData.targetDegrees.length === 0) {
      alert("Please select at least one Degree");
      return;
    }

    setLoading(true);

    // FIX: Map payload keys to match what backend expects in the provided controller
    const payload = {
      ...formData,
      targetDegrees: formData.targetDegrees // Backend loop handles this array
    };

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/meetings/update/${editId}`, payload);
        alert("✅ Meeting Updated Successfully!");
      } else {
        const response = await axios.post("http://localhost:5000/api/meetings/add", payload);
        if (response.data.success) alert("✅ Meeting Scheduled Successfully!");
      }
      closeModal();
      fetchMeetings();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Data save nahi hua!"));
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`http://localhost:5000/api/meetings/delete/${id}`);
        fetchMeetings();
      } catch (error) { alert("Delete failed!"); }
    }
  };

  const handleEdit = (meeting) => {
    setEditId(meeting.meeting_id);
    const formatDate = (dateStr) => (!dateStr || dateStr === 'null') ? '' : new Date(dateStr).toISOString().split('T')[0];
    const formatTime = (timeStr) => (!timeStr || timeStr === 'null') ? '' : timeStr.toString().substring(0, 5);

    setFormData({
      title: meeting.title ?? '',
      semester: meeting.semester ?? '7', 
      // FIX: Ensure targetDegrees state is populated during edit
      targetDegrees: meeting.target_degree ? [meeting.target_degree] : [], 
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
    setShowDegreeDropdown(false);
    setFormData({
      title: '', semester: '7', targetDegrees: [], date: '', time: '',
      venue: '', description: '', deadlineDate: '', deadlineTime: '', attachmentLink: '' 
    });
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
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', color: '#000', fontSize: '14px', fontWeight: 'bold' },
    td: { padding: '15px 12px', borderBottom: '1px solid #eee', color: '#000', fontSize: '14px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    modalContent: { backgroundColor: 'white', width: '580px', borderRadius: '16px', display: 'flex', flexDirection: 'column', maxHeight: '95vh', color: '#000' },
    modalHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalBody: { padding: '20px', overflowY: 'auto' },
    modalFooter: { padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    formGroup: { marginBottom: '15px', position: 'relative' },
    label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#000' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', color: '#000', backgroundColor: '#fff' },
    dropdownSelector: { 
      width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', 
      backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#000' 
    },
    dropdownMenu: { 
      position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', 
      border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '5px', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
    },
    dropdownItem: { padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: '0.2s', color: '#000' },
    cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', color: '#000' },
    submitBtn: { padding: '10px 25px', borderRadius: '8px', border: 'none', background: '#005f4b', color: 'white', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
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

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Target Group</th>
              <th style={styles.th}>Date & Time</th>
              <th style={styles.th}>Venue</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((m) => (
              <tr key={m.meeting_id}>
                <td style={styles.td}><strong>{m.title}</strong></td>
                <td style={styles.td}>
                  {m.semester === 'both' ? '7th & 8th' : `${m.semester}th`} Sem | {m.target_degree}
                </td>
                <td style={styles.td}>{new Date(m.meeting_date).toLocaleDateString()} | {m.meeting_time}</td>
                <td style={styles.td}>{m.venue}</td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(m)} style={{background:'none', border:'none', color:'#2980b9', cursor:'pointer', marginRight:'10px'}}><FaEdit /></button>
                  <button onClick={() => handleDelete(m.meeting_id)} style={{background:'none', border:'none', color:'#e74c3c', cursor:'pointer'}}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Semester</label>
                  <select name="semester" value={formData.semester} onChange={handleInputChange} style={styles.input}>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                    <option value="both">Both (7th & 8th)</option>
                  </select>
                </div>
                
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Select Degrees</label>
                  <div 
                    style={styles.dropdownSelector} 
                    onClick={() => setShowDegreeDropdown(!showDegreeDropdown)}
                  >
                    <span style={{ color: '#000' }}>
                      {formData.targetDegrees.length === 0 
                        ? "Select Degrees" 
                        : formData.targetDegrees.join(", ")}
                    </span>
                    <FaChevronDown size={12} color="#000" />
                  </div>

                  {showDegreeDropdown && (
                    <div style={styles.dropdownMenu}>
                      {degreesList.map(deg => (
                        <div 
                          key={deg} 
                          style={styles.dropdownItem}
                          onClick={() => handleDegreeChange(deg)}
                        >
                          <input 
                            type="checkbox" 
                            checked={formData.targetDegrees.includes(deg)} 
                            readOnly 
                          />
                          <span style={{color:'#000', fontSize:'14px'}}>{deg}</span>
                        </div>
                      ))}
                    </div>
                  )}
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

              <div style={styles.formGroup}>
                <label style={styles.label}>Instructions</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...styles.input, height: '60px', resize: 'none' }} />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button style={styles.submitBtn} onClick={handleSaveMeeting} disabled={loading}>
                {loading ? "Processing..." : (editId ? "Update Now" : "Schedule")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ADDashboard;