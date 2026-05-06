// @ts-nocheck
import React, { useState, useEffect } from 'react'; 
import { FaCalendarAlt, FaList, FaChevronLeft, FaChevronRight, FaTimes, FaClock, FaMapMarkerAlt, FaBookOpen, FaExclamationTriangle, FaBriefcase, FaUsers, FaPlus, FaCheckCircle, FaChevronDown, FaInfoCircle, FaHourglassHalf, FaStickyNote, FaCalendarWeek, FaFlagCheckered, FaBell } from 'react-icons/fa';

const ViewCalendar = () => {
  const [viewMode, setViewMode] = useState('annual'); 
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(2026); 
  const [events, setEvents] = useState([]);
  const [emergencyHolidays, setEmergencyHolidays] = useState([]); 
  const [rescheduledSaturdays, setRescheduledSaturdays] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [societies, setSocieties] = useState([]);
  const [subscribedNames, setSubscribedNames] = useState([]); 
  const [showDropdown, setShowDropdown] = useState(false);
  const userRole = localStorage.getItem('userRole'); 
  const studentId = localStorage.getItem('userId');

  const [selectedDateData, setSelectedDateData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const testStudentId = studentId; 
        
        // 🚩 MASTER FIX: Sending 'role' to backend for strict filtering
        const response = await fetch(`http://localhost:5000/api/calendar/all-events?studentId=${testStudentId}&role=${userRole}`);
        const data = await response.json();
        
        const societyResponse = await fetch(`http://localhost:5000/api/events/all?studentId=${testStudentId}&role=${userRole}`);
        const societyData = await societyResponse.json();

        if (userRole === 'student') {
          const listRes = await fetch(`http://localhost:5000/api/events/societies-status?studentId=${testStudentId}`);
          const listData = await listRes.json();
          setSocieties(listData.allSocieties || []);
          setSubscribedNames(listData.subscribedNames || []); 
        }

        const emergencyResponse = await fetch(`http://localhost:5000/api/emergencyholiday`);
        const emergencyData = await emergencyResponse.json();
        setEmergencyHolidays(emergencyData);

        const satResponse = await fetch(`http://localhost:5000/api/saturdays`);
        const satData = await satResponse.json();
        setRescheduledSaturdays(satData);

        let combinedEvents = [];
        if (Array.isArray(data)) {
          const formattedRegular = data.map(item => {
            const eventType = (item.type || "").toLowerCase().trim();
            let finalColor = item.color_code;
            if (eventType.includes('exam')) finalColor = '#dc3545';
            else if (eventType === 'holiday') finalColor = '#87CEEB';
            else if (eventType === 'activity') finalColor = '#f39c12';
            else if (eventType === 'semester') finalColor = '#05864e';
            else if (!finalColor) finalColor = '#e810b2';

            return {
              id: item.id,
              title: item.title,
              type: eventType,
              start: item.start_date ? item.start_date.split('T')[0] : "",
              end: item.end_date ? item.end_date.split('T')[0] : "",
              color: finalColor,
              startTime: item.start_time || "N/A",
              roomNo: item.room_no || "TBA",
              description: item.description || "",
              societyName: item.society_name || ""
            };
          });
          combinedEvents = [...formattedRegular];
        }

        if (Array.isArray(societyData)) {
          const formattedSocieties = societyData.map(s => ({
            id: s.id,
            title: s.title,
            type: 'society',
            start: s.date ? s.date.split('T')[0] : "",
            end: s.date ? s.date.split('T')[0] : "",
            color: s.color || '#e810b2', 
            venue: s.venue,
            description: s.description,
            societyName: s.society_name,
            startTime: s.time || "TBA"
          }));
          combinedEvents = [...combinedEvents, ...formattedSocieties];
        }

        setEvents(combinedEvents);
        setLoading(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [userRole, studentId]);

  useEffect(() => {
    if (userRole === 'student') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/list?studentId=${studentId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead && !n.is_read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/read/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId })
      });
      setNotifications(prev => 
        prev.map(n => (n.notification_id === notificationId || n.id === notificationId) ? { ...n, is_read: true, isRead: true } : n)
      );
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleToggleSubscribe = async (socName) => {
    const isSub = subscribedNames.includes(socName);
    const endpoint = isSub ? 'unsubscribe' : 'subscribe';
    try {
      const res = await fetch(`http://localhost:5000/api/events/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, society_name: socName })
      });
      const result = await res.json();
      if (result.success) {
        setSubscribedNames(prev => isSub ? prev.filter(name => name !== socName) : [...prev, socName]);
        // Data refresh taake calendar events update hon
        window.location.reload();
      }
    } catch (err) { console.error("Action Error:", err); }
  };

  const handleDateClick = (day, monthIndex, year) => {
    if (!day) return;
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const formattedDisplayDate = `${String(day).padStart(2, '0')}-${String(monthIndex + 1).padStart(2, '0')}-${year}`;

    const foundEmergency = emergencyHolidays.find(h => dateStr >= h.start_date.split('T')[0] && dateStr <= h.end_date.split('T')[0]);
    if (foundEmergency) {
      setSelectedDateData({ date: formattedDisplayDate, title: "Emergency Closure", type: "Emergency", isEmergency: true, description: foundEmergency.reason, color: 'black' });
      setIsModalOpen(true); return;
    }

    const foundSaturday = rescheduledSaturdays.find(s => s.working_date.split('T')[0] === dateStr);
    if (foundSaturday) {
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
      setSelectedDateData({ 
        date: formattedDisplayDate, dayName: dayName, title: "Working Saturday", type: "Rescheduled Day", isSaturday: true, reason: foundSaturday.reason || "Academic replacement day", replacementDay: foundSaturday.replacement_day || "To be announced", additionalInfo: foundSaturday.additional_info || "", color: '#007bff' 
      });
      setIsModalOpen(true); return;
    }

    const foundExam = events.find(e => (e.type?.includes("exam")) && (dateStr >= e.start && dateStr <= e.end));
    if (foundExam) {
      let examType = foundExam.title?.toLowerCase().includes("mid") ? "MIDS" : foundExam.title?.toLowerCase().includes("final") ? "FINALS" : "Exam";
      setSelectedDateData({ ...foundExam, date: formattedDisplayDate, isExam: true, examType: examType, courseName: foundExam.title, venue: foundExam.roomNo || foundExam.venue || "TBA" });
      setIsModalOpen(true); return;
    }

    const foundHoliday = events.find(e => (e.type === 'holiday') && (dateStr >= e.start && dateStr <= e.end));
    if (foundHoliday) {
      setSelectedDateData({ ...foundHoliday, date: formattedDisplayDate, isHoliday: true, color: '#87CEEB' });
      setIsModalOpen(true); return;
    }

    const foundSemester = events.find(e => (e.type === 'semester') && (dateStr === e.start));
    if (foundSemester) {
      setSelectedDateData({ ...foundSemester, date: formattedDisplayDate, isSemester: true, color: '#05864e' });
      setIsModalOpen(true); return;
    }

    const foundRegularEvent = events.find(e => e.type !== 'semester' && (dateStr >= e.start && dateStr <= e.end));
    if (foundRegularEvent) {
      setSelectedDateData({ ...foundRegularEvent, date: formattedDisplayDate, isRegularEvent: true, color: foundRegularEvent.color || '#e810b2' });
      setIsModalOpen(true); return;
    }
  };

  const getEventStyle = (day, monthIndex, year) => {
    if (!day) return { style: styles.emptyCell, title: "" };
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const isEmergency = emergencyHolidays.find(h => dateStr >= h.start_date.split('T')[0] && dateStr <= h.end_date.split('T')[0]);
    if (isEmergency) return { style: { ...styles.dayCell, backgroundColor: 'black', color: 'white', fontWeight: 'bold' }, title: isEmergency.reason };
    
    const isSaturdayWork = rescheduledSaturdays.find(s => s.working_date.split('T')[0] === dateStr);
    if (isSaturdayWork) return { style: { ...styles.dayCell, backgroundColor: '#007bff', color: 'white', fontWeight: 'bold' }, title: "Working Saturday" };
    
    const semesterStart = events.find(e => e.type === 'semester' && dateStr === e.start);
    if (semesterStart) return { style: { ...styles.dayCell, backgroundColor: '#05864e', color: 'white', fontWeight: 'bold' }, title: semesterStart.title };
    
    const eventForDate = events.find(e => e.type !== 'semester' && (dateStr >= e.start && dateStr <= e.end));
    if (eventForDate) {
      let bgColor = eventForDate.color;
      let displayTitle = dateStr === eventForDate.start ? eventForDate.title : "";
      return { style: { ...styles.dayCell, backgroundColor: bgColor, color: 'white' }, title: displayTitle };
    }
    
    return { style: { ...styles.dayCell, backgroundColor: 'white', color: '#333' }, title: "" };
  };

  const generateDays = (year, monthIndex) => {
    const firstDay = new Date(year, monthIndex, 1).getDay(); 
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); 
    let daysArray = [];
    for (let i = 0; i < firstDay; i++) daysArray.push(null);
    for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);
    return daysArray;
  };

  const Legend = () => (
    <div style={styles.legendWrapper}>
      <h4 style={styles.legendHeader}><FaInfoCircle /> Calendar Legend</h4>
      <div style={styles.legendGrid}>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#dc3545'}}></div><span>Exams (Mid/Final)</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#87CEEB'}}></div><span>Holidays</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#e810b2'}}></div><span>Society Events</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#007bff'}}></div><span>Working Saturday</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#f39c12'}}></div><span>Student Week / Activities</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'black'}}></div><span>Emergency Closure</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#05864e'}}></div><span>Semester Start</span></div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <h3 style={{margin:0}}>Academic Calendar</h3>
          {userRole === 'student' && (
            <div style={{position: 'relative'}}>
              <button onClick={() => setShowNotifications(!showNotifications)} style={styles.bellButton}>
                <FaBell size={18} color="#555" />
                {unreadCount > 0 && <span style={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {showNotifications && (
                <div style={styles.notificationDropdown}>
                  <div style={styles.notificationHeader}>
                    <span>Notifications</span>
                    <button onClick={() => setShowNotifications(false)} style={styles.closeNotifBtn}>×</button>
                  </div>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.notification_id || notif.id} 
                        style={{...styles.notificationItem, backgroundColor: (notif.is_read || notif.isRead) ? '#f9f9f9' : '#fff3e0'}} 
                        onClick={() => !(notif.is_read || notif.isRead) && markAsRead(notif.notification_id || notif.id)}
                      >
                        <p style={styles.notifMessage}>{notif.message}</p>
                        <small style={styles.notifDate}>{notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}</small>
                      </div>
                    ))
                  ) : <div style={styles.noNotifications}>No notifications</div>}
                </div>
              )}
            </div>
          )}
          {userRole === 'student' && (
            <div style={{position:'relative'}}>
              <button onClick={() => setShowDropdown(!showDropdown)} style={styles.dropdownToggle}>
                <FaUsers /> Societies List <FaChevronDown fontSize="10px"/>
              </button>
              {showDropdown && (
                <div style={styles.dropdownMenu}>
                  {societies.length > 0 ? societies.map(soc => {
                    const isSubscribed = subscribedNames.includes(soc.society_name);
                    return (
                      <div key={soc.society_id} style={styles.dropdownItem}>
                        <span style={{flex: 1, fontSize:'12px'}}>{soc.society_name}</span>
                        <button onClick={() => handleToggleSubscribe(soc.society_name)} style={{ ...styles.inlineSubBtn, background: isSubscribed ? '#05864e' : '#e810b2' }}>
                          {isSubscribed ? <FaCheckCircle size={10} /> : <FaPlus size={10} />}
                        </button>
                      </div>
                    );
                  }) : <div style={{padding:'10px', fontSize:'12px'}}>No societies found</div>}
                  <button style={styles.applyBtn} onClick={() => window.location.reload()}>Apply & Refresh</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={styles.buttonGroup}>
          <button style={viewMode === 'annual' ? styles.activeBtn : styles.btn} onClick={() => setViewMode('annual')}><FaList /> Annual</button>
          <button style={viewMode === 'monthly' ? styles.activeBtn : styles.btn} onClick={() => setViewMode('monthly')}><FaCalendarAlt /> Monthly</button>
        </div>
      </div>
      
      <div style={styles.content}>
        {loading ? <div style={{textAlign:'center', padding:'20px'}}>Loading...</div> : (viewMode === 'annual' ? (
          <>
            <div style={styles.annualGrid}>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((mName, mIdx) => (
                <div key={mIdx} style={styles.miniCard}>
                  <div style={styles.miniHeader}>{mName} {currentYear}</div>
                  <div style={styles.miniWeekRow}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => <span key={i} style={styles.weekDay}>{wd}</span>)}
                  </div>
                  <div style={styles.miniDateGrid}>
                    {generateDays(currentYear, mIdx).map((d, idx) => {
                      const { style } = getEventStyle(d, mIdx, currentYear);
                      return <div key={idx} style={d ? { ...style, cursor: 'pointer' } : styles.emptyCell} onClick={() => handleDateClick(d, mIdx, currentYear)}>{d}</div>;
                    })}
                  </div>
                </div>
              ))}
            </div>
            <Legend />
          </>
        ) : (
          <div style={styles.monthlyContainer}>
            <div style={styles.monthNav}>
              <button onClick={() => setSelectedMonth(p => p === 0 ? 11 : p - 1)} style={styles.navBtn}><FaChevronLeft /></button>
              <h2 style={{margin:0, color:'#05864e'}}>{["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][selectedMonth]} {currentYear}</h2>
              <button onClick={() => setSelectedMonth(p => p === 11 ? 0 : p + 1)} style={styles.navBtn}><FaChevronRight /></button>
            </div>
            <div style={styles.bigCalendar}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={styles.bigWeekHeader}>{d}</div>)}
              {generateDays(currentYear, selectedMonth).map((d, idx) => {
                const { style, title } = getEventStyle(d, selectedMonth, currentYear);
                return (
                  <div key={idx} onClick={() => handleDateClick(d, selectedMonth, currentYear)} style={d ? { ...styles.bigDayCell, backgroundColor: style.backgroundColor, cursor: 'pointer' } : styles.bigEmptyCell}>
                    {d && <span style={{...styles.dateNum, color: style.backgroundColor === 'white' ? '#333' : 'white'}}>{d}</span>}
                    {d && title && <span style={{...styles.eventTitleDisplay, color: 'white'}}>{title}</span>}
                  </div>
                );
              })}
            </div>
            <Legend />
          </div>
        ))}
      </div>

      {isModalOpen && selectedDateData && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={{...styles.modalContent, borderTop: `8px solid ${selectedDateData.color || '#05864e'}`}} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.headerInfo}>
                <span style={{...styles.typeBadge, backgroundColor: selectedDateData.color || '#05864e'}}>{selectedDateData.isExam ? 'EXAMS' : selectedDateData.isSaturday ? 'RESCHEDULED DAY' : selectedDateData.isEmergency ? 'EMERGENCY' : selectedDateData.isHoliday ? 'HOLIDAY' : selectedDateData.isSemester ? 'SEMESTER' : 'EVENT'}</span>
                <h3 style={styles.modalTitle}>{selectedDateData.isExam ? 'Exams' : selectedDateData.isSaturday ? 'Working Saturday' : selectedDateData.isEmergency ? 'Emergency Closure' : selectedDateData.title}</h3>
              </div>
              <FaTimes style={styles.closeIcon} onClick={() => setIsModalOpen(false)} />
            </div>
            <div style={styles.modalBody}>
              <div style={styles.infoGridMain}>
                <div style={styles.infoRow}><FaCalendarAlt style={styles.rowIcon} /><div><strong>Date:</strong> <span>{selectedDateData.date}</span></div></div>
                <div style={styles.infoRow}><FaStickyNote style={styles.rowIcon} /><div><strong>Info:</strong> <span>{selectedDateData.description || "No further details."}</span></div></div>
              </div>
            </div>
            <button style={{...styles.closeBtn, background: selectedDateData.color || '#05864e'}} onClick={() => setIsModalOpen(false)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '10px 20px', backgroundColor: 'white', borderRadius: '10px', height: '90vh', display: 'flex', flexDirection: 'column' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee' },
  bellButton: { position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#dc3545', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', minWidth: '18px', textAlign: 'center' },
  notificationDropdown: { position: 'absolute', top: '100%', right: 0, width: '300px', maxHeight: '400px', overflowY: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 1001, marginTop: '5px', border: '1px solid #eee' },
  notificationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #eee', fontWeight: 'bold', backgroundColor: '#f8f9fa', borderRadius: '8px 8px 0 0' },
  closeNotifBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' },
  notificationItem: { padding: '12px 15px', borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' },
  notifMessage: { margin: '0 0 5px 0', fontSize: '13px', color: '#333' },
  notifDate: { fontSize: '10px', color: '#999' },
  noNotifications: { padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' },
  dropdownToggle: { padding:'6px 12px', background:'#e810b2', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', fontSize:'12px', display:'flex', alignItems:'center', gap:'8px' },
  dropdownMenu: { position:'absolute', top:'100%', left:0, background:'white', boxShadow:'0 8px 16px rgba(0,0,0,0.1)', borderRadius:'8px', width:'220px', zIndex:1000, marginTop:'5px', border:'1px solid #eee', padding:'10px' },
  dropdownItem: { display:'flex', alignItems:'center', padding:'8px', borderBottom:'1px solid #f5f5f5', color:'#333' },
  inlineSubBtn: { padding:'4px 8px', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  applyBtn: { width:'100%', marginTop:'10px', background:'#05864e', color:'white', border:'none', borderRadius:'4px', padding:'6px', cursor:'pointer', fontSize:'11px', fontWeight:'bold' },
  buttonGroup: { display: 'flex', gap: '10px' },
  btn: { padding: '5px 12px', border: '1px solid #ccc', background: 'white', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
  activeBtn: { padding: '5px 12px', background: '#05864e', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '12px' },
  content: { flex: 1, overflowY: 'auto' },
  annualGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  miniCard: { border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' },
  miniHeader: { backgroundColor: '#05864e', color: 'white', padding: '2px', textAlign: 'center', fontSize: '11px' },
  miniWeekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f1f1f1', padding: '2px 0' },
  weekDay: { fontSize: '8px', textAlign: 'center', fontWeight: 'bold', color: '#555' },
  miniDateGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '2px', gap: '1px' },
  dayCell: { fontSize: '10px', textAlign: 'center', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px' },
  emptyCell: { backgroundColor: 'transparent' },
  monthlyContainer: { height: '100%', display: 'flex', flexDirection: 'column' },
  monthNav: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' },
  navBtn: { padding: '5px 10px', cursor: 'pointer', border: '1px solid #ddd', background: 'white', borderRadius: '5px' },
  bigCalendar: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#ddd' },
  bigWeekHeader: { backgroundColor: '#05864e', color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' },
  bigDayCell: { minHeight: '95px', padding: '5px', display: 'flex', flexDirection: 'column', backgroundColor: 'white' },
  bigEmptyCell: { backgroundColor: '#f9f9f9', minHeight: '95px' },
  dateNum: { fontWeight: 'bold', fontSize: '14px' },
  eventTitleDisplay: { fontSize: '10px', marginTop: 'auto', textAlign: 'center', padding: '2px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)' },
  legendWrapper: { marginTop: '25px', padding: '15px', borderTop: '2px solid #eee', backgroundColor: '#fdfdfd' },
  legendHeader: { margin: '0 0 12px 0', fontSize: '15px', color: '#05864e', display: 'flex', alignItems: 'center', gap: '8px' },
  legendGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#444' },
  colorBox: { width: '18px', height: '18px', borderRadius: '4px', boxShadow: 'inset 0 0 2px rgba(0,0,0,0.2)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalContent: { backgroundColor: 'white', borderRadius: '12px', width: '420px', padding: '0', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', padding: '20px', backgroundColor: '#f8fafc' },
  headerInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  typeBadge: { padding: '4px 10px', color: 'white', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', width: 'fit-content' },
  modalTitle: { margin: 0, fontSize: '20px', color: '#1e293b', fontWeight: '700' },
  closeIcon: { cursor: 'pointer', fontSize: '20px', color: '#94a3b8', transition: 'color 0.2s' },
  modalBody: { padding: '20px' },
  infoGridMain: { display: 'flex', flexDirection: 'column', gap: '15px' },
  infoRow: { display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#475569', fontSize: '14px' },
  rowIcon: { marginTop: '3px', color: '#64748b', fontSize: '16px' },
  closeBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.5px' }
};

export default ViewCalendar;