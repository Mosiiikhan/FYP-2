// @ts-nocheck
import React, { useState, useEffect } from 'react'; 
import { FaCalendarAlt, FaList, FaChevronLeft, FaChevronRight, FaTimes, FaClock, FaMapMarkerAlt, FaBookOpen, FaExclamationTriangle, FaBriefcase, FaUsers, FaPlus, FaCheckCircle, FaChevronDown, FaInfoCircle, FaHourglassHalf, FaStickyNote, FaCalendarWeek, FaFlagCheckered } from 'react-icons/fa';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const testStudentId = studentId; 
        
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
            else if (!finalColor) finalColor = '#05864e';

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
            color: '#e810b2', 
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
        date: formattedDisplayDate,
        dayName: dayName,
        title: "Working Saturday", 
        type: "Rescheduled Day", 
        isSaturday: true, 
        reason: foundSaturday.reason || "Academic replacement day",
        replacementDay: foundSaturday.replacement_day || "To be announced",
        additionalInfo: foundSaturday.additional_info || "",
        color: '#007bff' 
      });
      setIsModalOpen(true); return;
    }

    const foundSociety = events.find(e => e.type === 'society' && e.start === dateStr);
    if (foundSociety) {
      setSelectedDateData({ ...foundSociety, date: formattedDisplayDate, isSociety: true });
      setIsModalOpen(true); return;
    }

    const foundActivity = events.find(e => (e.type === 'activity') && (dateStr >= e.start && dateStr <= e.end));
    if (foundActivity) {
      setSelectedDateData({
        ...foundActivity,
        date: formattedDisplayDate,
        isSportsEvent: true,
        eventName: foundActivity.title,
        eventDate: formattedDisplayDate,
        eventTime: foundActivity.startTime || "09:00 AM - 05:00 PM",
        eventVenue: foundActivity.roomNo || foundActivity.venue || "Main Campus",
        organizingSociety: foundActivity.societyName || "Student Affairs Department",
        eventDescription: foundActivity.description || "Various activities planned for this week.",
        color: '#f39c12'
      });
      setIsModalOpen(true); return;
    }

    const foundExam = events.find(e => (e.type?.includes("exam")) && (dateStr >= e.start && dateStr <= e.end));
    if (foundExam) {
      let examType = "Exam";
      if (foundExam.title?.toLowerCase().includes("mid")) examType = "MIDS";
      else if (foundExam.title?.toLowerCase().includes("final")) examType = "FINALS";
      setSelectedDateData({ ...foundExam, date: formattedDisplayDate, isExam: true, examType: examType, courseName: foundExam.title, venue: foundExam.roomNo || foundExam.venue || "TBA" });
      setIsModalOpen(true);
    }
  };

  const getEventStyle = (day, monthIndex, year) => {
    if (!day) return { style: styles.emptyCell, title: "" };
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // 1. Emergency Holiday (Highest Priority)
    const isEmergency = emergencyHolidays.find(h => dateStr >= h.start_date.split('T')[0] && dateStr <= h.end_date.split('T')[0]);
    if (isEmergency) return { style: { ...styles.dayCell, backgroundColor: 'black', color: 'white', fontWeight: 'bold' }, title: isEmergency.reason };
    
    // 2. Working Saturday
    const isSaturdayWork = rescheduledSaturdays.find(s => s.working_date.split('T')[0] === dateStr);
    if (isSaturdayWork) return { style: { ...styles.dayCell, backgroundColor: '#007bff', color: 'white', fontWeight: 'bold' }, title: "Working Saturday" };
    
    // 3. Society & Sports Events
    const isSociety = events.find(e => e.type === 'society' && e.start === dateStr);
    if (isSociety) return { style: { ...styles.dayCell, backgroundColor: isSociety.color, color: 'white' }, title: isSociety.title };
    
    const isActivity = events.find(e => e.type === 'activity' && (dateStr >= e.start && dateStr <= e.end));
    if (isActivity) return { style: { ...styles.dayCell, backgroundColor: '#f39c12', color: 'white' }, title: isActivity.title };
    
    // 4. Exams & Holidays
    let highlightEvent = events.find(e => dateStr >= e.start && dateStr <= e.end && (e.type.includes("exam") || e.type === "holiday"));
    
    // 5. Semester Logic (Fix: Highlight ONLY on Start Date)
    const semStart = events.find(e => e.type === "semester" && e.start === dateStr);

    let style = { ...styles.dayCell, backgroundColor: 'white', color: '#333' };
    let displayTitle = ""; 

    if (highlightEvent) {
      style = { ...style, backgroundColor: highlightEvent.color, color: 'white' };
      if (dateStr === highlightEvent.start) displayTitle = highlightEvent.title;
    } else if (semStart) {
      style = { ...style, backgroundColor: semStart.color, color: 'white', fontWeight: 'bold' };
      displayTitle = semStart.title;
    }

    return { style, title: displayTitle };
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
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#87CEEB'}}></div><span>National Holidays</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#e810b2'}}></div><span>Societies Events</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#007bff'}}></div><span>Working Saturday</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#f39c12'}}></div><span>Student Week / Sports Week</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'black'}}></div><span>Emergency Closure</span></div>
        <div style={styles.legendItem}><div style={{...styles.colorBox, backgroundColor:'#05864e'}}></div><span>Semester Events</span></div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <h3 style={{margin:0}}>Academic Calendar</h3>
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
                  <div style={styles.miniWeekRow}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => <span key={i} style={styles.weekDay}>{wd}</span>)}</div>
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
                <span style={{...styles.typeBadge, backgroundColor: selectedDateData.color || '#05864e'}}>
                  {selectedDateData.isExam ? 'EXAMS' : 
                   selectedDateData.isSaturday ? 'RESCHEDULED DAY' :
                   selectedDateData.isSportsEvent ? 'STUDENT WEEK / SPORTS' :
                   (selectedDateData.type?.toUpperCase() || 'EVENT')}
                </span>
                <h3 style={styles.modalTitle}>
                  {selectedDateData.isExam ? 'Exams' : 
                   selectedDateData.isSaturday ? 'Working Saturday' :
                   selectedDateData.isSportsEvent ? selectedDateData.eventName || 'Student Week' :
                   selectedDateData.title}
                </h3>
              </div>
              <FaTimes style={styles.closeIcon} onClick={() => setIsModalOpen(false)} />
            </div>

            <div style={styles.modalBody}>
              <div style={styles.infoGridMain}>
                {selectedDateData.isExam && (
                  <>
                    <div style={styles.infoRow}><FaBookOpen style={styles.rowIcon} /> <div><strong>Exam Type:</strong> <span>{selectedDateData.examType}</span></div></div>
                    <div style={styles.infoRow}><FaCalendarAlt style={styles.rowIcon} /> <div><strong>Date:</strong> <span>{selectedDateData.date}</span></div></div>
                    {selectedDateData.startTime !== "N/A" && <div style={styles.infoRow}><FaClock style={styles.rowIcon} /> <div><strong>Time Slot:</strong> <span>{selectedDateData.startTime}</span></div></div>}
                    <div style={styles.infoRow}><FaBookOpen style={styles.rowIcon} /> <div><strong>Course Name:</strong> <span>{selectedDateData.courseName}</span></div></div>
                    <div style={styles.infoRow}><FaMapMarkerAlt style={styles.rowIcon} /> <div><strong>Venue:</strong> <span>{selectedDateData.venue || selectedDateData.roomNo}</span></div></div>
                  </>
                )}

                {selectedDateData.isSaturday && (
                  <>
                    <div style={styles.infoRow}><FaCalendarWeek style={styles.rowIcon} /> <div><strong>Day:</strong> <span>{selectedDateData.dayName}</span></div></div>
                    <div style={styles.infoRow}><FaCalendarAlt style={styles.rowIcon} /> <div><strong>Date:</strong> <span>{selectedDateData.date}</span></div></div>
                    <div style={styles.infoRow}><FaExclamationTriangle style={styles.rowIcon} /> <div><strong>Reason:</strong> <span>{selectedDateData.reason}</span></div></div>
                    <div style={styles.infoRow}><FaCalendarWeek style={styles.rowIcon} /> <div><strong>Replacement For:</strong> <span>{selectedDateData.replacementDay}</span></div></div>
                    {selectedDateData.additionalInfo && <div style={styles.infoRow}><FaStickyNote style={styles.rowIcon} /> <div><strong>Additional Info:</strong> <span>{selectedDateData.additionalInfo}</span></div></div>}
                  </>
                )}

                {selectedDateData.isSportsEvent && (
                  <>
                    <div style={styles.infoRow}><FaFlagCheckered style={styles.rowIcon} /> <div><strong>Event:</strong> <span>{selectedDateData.eventName}</span></div></div>
                    <div style={styles.infoRow}><FaCalendarAlt style={styles.rowIcon} /> <div><strong>Date:</strong> <span>{selectedDateData.date}</span></div></div>
                    <div style={styles.infoRow}><FaClock style={styles.rowIcon} /> <div><strong>Time:</strong> <span>{selectedDateData.eventTime}</span></div></div>
                    <div style={styles.infoRow}><FaMapMarkerAlt style={styles.rowIcon} /> <div><strong>Venue:</strong> <span>{selectedDateData.eventVenue}</span></div></div>
                    <div style={styles.infoRow}><FaUsers style={styles.rowIcon} /> <div><strong>Organized By:</strong> <span>{selectedDateData.organizingSociety}</span></div></div>
                  </>
                )}

                {selectedDateData.isSociety && !selectedDateData.isSportsEvent && (
                  <>
                    <div style={styles.infoRow}><FaCalendarAlt style={styles.rowIcon} /> <div><strong>Date:</strong> <span>{selectedDateData.date}</span></div></div>
                    <div style={styles.infoRow}><FaClock style={styles.rowIcon} /> <div><strong>Time:</strong> <span>{selectedDateData.startTime}</span></div></div>
                    <div style={styles.infoRow}><FaMapMarkerAlt style={styles.rowIcon} /> <div><strong>Venue:</strong> <span>{selectedDateData.venue || selectedDateData.roomNo}</span></div></div>
                    <div style={styles.infoRow}><FaUsers style={styles.rowIcon} /> <div><strong>Society:</strong> <span>{selectedDateData.societyName}</span></div></div>
                  </>
                )}

                {selectedDateData.isEmergency && (
                  <>
                    <div style={styles.infoRow}><FaCalendarAlt style={styles.rowIcon} /> <div><strong>Date:</strong> <span>{selectedDateData.date}</span></div></div>
                    <div style={styles.infoRow}><FaExclamationTriangle style={styles.rowIcon} /> <div><strong>Reason:</strong> <span>{selectedDateData.description}</span></div></div>
                  </>
                )}
              </div>
              
              {selectedDateData.isExam && (
                <div style={styles.sittingPlanSection}>
                  <h4 style={styles.descTitle}><FaExclamationTriangle /> Sitting Plan</h4>
                  <div style={styles.sittingPlanPlaceholder}>
                    <p style={styles.placeholderText}>📍 <strong>Venue:</strong> {selectedDateData.venue || "To be announced"}</p>
                    <p style={styles.noteText}><em>Note: Detailed seat allocation will be available soon.</em></p>
                  </div>
                </div>
              )}
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
  miniWeekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f1f1f1' },
  weekDay: { fontSize: '8px', textAlign: 'center' },
  miniDateGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '2px', gap: '1px' },
  dayCell: { fontSize: '10px', textAlign: 'center', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyCell: { backgroundColor: 'transparent' },
  monthlyContainer: { height: '100%', display: 'flex', flexDirection: 'column' },
  monthNav: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' },
  navBtn: { padding: '5px 10px', cursor: 'pointer', border: '1px solid #ddd' },
  bigCalendar: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#ddd' },
  bigWeekHeader: { backgroundColor: '#05864e', color: 'white', padding: '10px', textAlign: 'center' },
  bigDayCell: { minHeight: '95px', padding: '5px', display: 'flex', flexDirection: 'column' },
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
  descSection: { marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' },
  descTitle: { margin: '0 0 8px 0', fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' },
  descText: { fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0, fontStyle: 'italic' },
  closeBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.5px' },
  sittingPlanSection: { marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' },
  sittingPlanPlaceholder: { backgroundColor: '#fff5f5', padding: '12px', borderRadius: '8px', border: '1px solid #fed7d7' },
  placeholderText: { fontSize: '13px', color: '#c53030', margin: '0 0 8px 0' },
  noteText: { fontSize: '12px', color: '#718096', margin: 0 }
};

export default ViewCalendar;