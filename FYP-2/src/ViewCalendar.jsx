// @ts-nocheck
import React, { useState, useEffect } from 'react'; 
import { FaCalendarAlt, FaList, FaChevronLeft, FaChevronRight, FaTimes, FaClock, FaMapMarkerAlt, FaBookOpen, FaExclamationTriangle, FaBriefcase, FaUsers, FaPlus, FaCheckCircle, FaChevronDown, FaInfoCircle, FaHourglassHalf, FaStickyNote, FaCalendarWeek, FaFlagCheckered, FaBell, FaArrowRight, FaFileExcel, FaIdCard, FaFilter } from 'react-icons/fa';

const ViewCalendar = () => {
  const [viewMode, setViewMode] = useState('annual'); 
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(2026); 
  const [events, setEvents] = useState([]);
  const [emergencyHolidays, setEmergencyHolidays] = useState([]); 
  const [rescheduledSaturdays, setRescheduledSaturdays] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [filterShow, setFilterShow] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    mids: true, finals: true, holiday: true, society: true,
    meeting: true, semester: true, activity: true, emergency: true, saturday: true
  });

  const [societies, setSocieties] = useState([]);
  const [subscribedNames, setSubscribedNames] = useState([]); 
  const [showDropdown, setShowDropdown] = useState(false);
  const userRole = localStorage.getItem('userRole'); 

  const studentIdFromStorage = localStorage.getItem('studentId');
  const userIdFromStorage    = localStorage.getItem('userId');
  const studentId = (userRole?.toLowerCase() === 'student')
    ? (studentIdFromStorage || userIdFromStorage)
    : userIdFromStorage;

  const [selectedDateData, setSelectedDateData]       = useState(null);
  const [isModalOpen, setIsModalOpen]                 = useState(false);
  const [multipleEventsList, setMultipleEventsList]   = useState([]);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [notifications, setNotifications]             = useState([]);
  const [unreadCount, setUnreadCount]                 = useState(0);
  const [showNotifications, setShowNotifications]     = useState(false);

  const getShortTitle = (title, maxLength) => {
    if (!title) return "";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 2) + "..";
  };

  const toggleFilter    = (f) => setActiveFilters(prev => ({ ...prev, [f]: !prev[f] }));
  const clearAllFilters = () => setActiveFilters({ mids:true,finals:true,holiday:true,society:true,meeting:true,semester:true,activity:true,emergency:true,saturday:true });
  const getActiveFilterCount = () => Object.values(activeFilters).filter(v => v).length;

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filteredEvents = events.filter(event => {
  const type  = (event.type  || "").toLowerCase().trim();
  const title = (event.title || "").toLowerCase();

  if (type === 'exam' || type.includes('exam')) {
    if (title.includes('mid'))   return activeFilters.mids;
    if (title.includes('final')) return activeFilters.finals;
    return activeFilters.mids || activeFilters.finals;
  }
  if (type === 'holiday')                                                    return activeFilters.holiday;
  if (type === 'society' || type === 'social' || type.includes('society') || type.includes('social')) return activeFilters.society;
  if (type === 'meeting')                                                    return activeFilters.meeting;
  if (type === 'semester')                                                   return activeFilters.semester;
  if (type === 'activity')                                                   return activeFilters.activity;
  if (type === 'emergency')                                                  return activeFilters.emergency;
  if (type === 'saturday')                                                   return activeFilters.saturday;

  // Fallback: pink color = society event
  if (event.color === '#e810b2')                                             return activeFilters.society;

  return true;
});

  // ── Fetch all data ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response       = await fetch(`http://localhost:5000/api/calendar/all-events?studentId=${studentId}&role=${userRole}`);
        const data           = await response.json();
        const societyResponse = await fetch(`http://localhost:5000/api/events/all?studentId=${studentId}&role=${userRole}`);
        const societyData    = await societyResponse.json();

        if (userRole === 'student') {
          const listRes  = await fetch(`http://localhost:5000/api/events/societies-status?studentId=${studentId}`);
          const listData = await listRes.json();
          setSocieties(listData.allSocieties || []);
          setSubscribedNames(listData.subscribedNames || []);
        }

        const emergencyResponse = await fetch(`http://localhost:5000/api/emergencyholiday`);
        setEmergencyHolidays(await emergencyResponse.json());

        const satResponse = await fetch(`http://localhost:5000/api/saturdays`);
        setRescheduledSaturdays(await satResponse.json());

        let combinedEvents = [];
        if (Array.isArray(data)) {
          const formattedRegular = data.map(item => {
            const eventType = (item.type || "").toLowerCase().trim();
            let finalColor  = item.color_code;
            if (eventType.includes('exam')) finalColor = '#dc3545';
            else if (eventType === 'holiday')  finalColor = '#87CEEB';
            else if (eventType === 'activity') finalColor = '#f39c12';
            else if (eventType === 'semester') finalColor = '#05864e';
            else if (eventType === 'meeting')  finalColor = '#FF5733';
            else if (eventType === 'emergency')finalColor = '#000000';
            else if (eventType === 'saturday') finalColor = '#007bff';
            else if (eventType === 'Society Event')  finalColor = '#e810b2';
            else if (!finalColor)              finalColor = '#e810b2';

            return {
              id:          item.id,
              title:       item.title,
              type:        eventType,
              start:       item.start_date ? item.start_date.split('T')[0] : "",
              end:         item.end_date   ? item.end_date.split('T')[0]   : "",
              color:       finalColor,
              startTime:   item.start_time  || "N/A",
              roomNo:      item.room_no     || "TBA",
              // ✅ description: text columns are CAST to VARCHAR(MAX) in backend
              description: item.description || item.agenda_description || "",
              societyName: item.society_name || "",
              // ✅ Seating plan — null-safe
              seatNo:      (item.seat_no !== null && item.seat_no !== undefined && item.seat_no !== '') ? item.seat_no : '-',
              rowNo:       (item.row_no  !== null && item.row_no  !== undefined && item.row_no  !== '') ? item.row_no  : '-',
              courseCode:  item.course_code || 'N/A',
              // ✅ roll_no from backend (resolved from Students table, not localStorage)
              rollNo:      item.roll_no || studentId || 'N/A',
            };
          });
          combinedEvents = [...formattedRegular];
        }

        if (Array.isArray(societyData)) {
          const formattedSocieties = societyData.map(s => ({
            id:          s.id,
            title:       s.title,
            type:        'society',
            start:       s.date ? s.date.split('T')[0] : "",
            end:         s.date ? s.date.split('T')[0] : "",
            color:       s.color || '#e810b2',
            venue:       s.venue,
            description: s.description || s.agenda_description || "",
            societyName: s.society_name,
            startTime:   s.time || "TBA",
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
    } catch (error) { console.error("Error fetching notifications:", error); }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/read/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      setNotifications(prev => prev.map(n =>
        (n.notification_id === notificationId || n.id === notificationId)
          ? { ...n, is_read: true, isRead: true } : n
      ));
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } catch (error) { console.error("Error marking notification as read:", error); }
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
        setSubscribedNames(prev => isSub ? prev.filter(n => n !== socName) : [...prev, socName]);
        window.location.reload();
      }
    } catch (err) { console.error("Action Error:", err); }
  };

  // ── Date click ────────────────────────────────────────────────────────────
  const handleDateClick = (day, monthIndex, year) => {
    if (!day) return;
    const dateStr            = `${year}-${String(monthIndex + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const formattedDisplayDate = `${String(day).padStart(2,'0')}-${String(monthIndex+1).padStart(2,'0')}-${year}`;

    let rawDayEvents = [];

    // Emergency
    const foundEmergency = emergencyHolidays.find(h =>
      dateStr >= h.start_date.split('T')[0] && dateStr <= h.end_date.split('T')[0]
    );
    if (foundEmergency && activeFilters.emergency) {
      rawDayEvents.push({
        date: formattedDisplayDate,
        title: "Emergency Closure",
        type: "Emergency",
        isEmergency: true,
        description: foundEmergency.reason || foundEmergency.description || "Emergency closure declared by administration.",
        color: 'black',
        startTime: "N/A",
        roomNo: "N/A"
      });
    }

    // Working Saturday
    const foundSaturday = rescheduledSaturdays.find(s => s.working_date.split('T')[0] === dateStr);
    if (foundSaturday && activeFilters.saturday) {
      rawDayEvents.push({
        date: formattedDisplayDate,
        dayName: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' }),
        title: "Working Saturday",
        type: "Rescheduled Day",
        isSaturday: true,
        description: [
          foundSaturday.reason || "Academic replacement day",
          foundSaturday.replacement_day ? `Replacement for: ${foundSaturday.replacement_day}` : ""
        ].filter(Boolean).join("\n"),
        color: '#007bff',
        venue: foundSaturday.replacement_day,
        startTime: "N/A",
        roomNo: "N/A"
      });
    }

    // Regular filtered events
    const dayFiltered = filteredEvents.filter(e => {
      if (e.type === 'semester') return dateStr === e.start;
      return dateStr >= e.start && dateStr <= e.end;
    });

    dayFiltered.forEach(e => {
      let eventData = { ...e, date: formattedDisplayDate };
      const lowerTitle = (e.title || "").toLowerCase();

      if (lowerTitle.includes("exam") || e.type === 'exam') {
        eventData.isExam     = true;
        eventData.examType   = lowerTitle.includes("mid") ? "MIDS" : "FINALS";
        // ✅ Explicitly carry seating plan fields — no data loss through spread
        eventData.seatNo     = (e.seatNo !== null && e.seatNo !== undefined && e.seatNo !== '') ? e.seatNo : '-';
        eventData.rowNo      = (e.rowNo  !== null && e.rowNo  !== undefined && e.rowNo  !== '') ? e.rowNo  : '-';
        eventData.courseCode = e.courseCode || 'N/A';
        eventData.roomNo     = e.roomNo     || 'TBA';
        eventData.rollNo     = e.rollNo     || studentId || 'N/A';
      } else if (e.type === 'holiday')  { eventData.isHoliday      = true; }
        else if (e.type === 'semester') { eventData.isSemester     = true; }
        else                            { eventData.isRegularEvent = true; }

      rawDayEvents.push(eventData);
    });

    // Deduplicate by title
    const uniqueEvents = rawDayEvents.filter((ev, idx, self) =>
      idx === self.findIndex(t => t.title.trim().toLowerCase() === ev.title.trim().toLowerCase())
    );

    if (uniqueEvents.length === 0) return;
    if (uniqueEvents.length === 1) { setSelectedDateData(uniqueEvents[0]); setIsModalOpen(true); }
    else { setMultipleEventsList(uniqueEvents); setIsSelectionModalOpen(true); }
  };

  const getEventsForDate = (day, monthIndex, year) => {
    if (!day) return [];
    const dateStr = `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    let items = [];

    const isEmergency = emergencyHolidays.find(h =>
      dateStr >= h.start_date.split('T')[0] && dateStr <= h.end_date.split('T')[0]
    );
    if (isEmergency && activeFilters.emergency) items.push({ title:"Emergency Closure", color:"black" });

    const isSaturdayWork = rescheduledSaturdays.find(s => s.working_date.split('T')[0] === dateStr);
    if (isSaturdayWork && activeFilters.saturday) items.push({ title:"Working Saturday", color:"#007bff" });

    const dayEvents = filteredEvents.filter(e => {
      if (e.type === 'semester') return dateStr === e.start;
      return dateStr >= e.start && dateStr <= e.end;
    });

    const uniqueDayEvents = dayEvents.filter((ev, idx, arr) =>
      idx === arr.findIndex(t => t.title.trim().toLowerCase() === ev.title.trim().toLowerCase())
    );

    return [...items, ...uniqueDayEvents];
  };

  const getDisplayTitle = (title, mode) => getShortTitle(title, mode === 'annual' ? 6 : 20);

  const generateDays = (year, monthIndex) => {
    const firstDay    = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);
    return arr;
  };

  // ── Modal body renderer ───────────────────────────────────────────────────
  const renderModalBody = (data) => {
    const isExamEvent = data.isExam || data.type === 'exam';

    if (isExamEvent) {
      return (
        <div style={styles.examSlipContainer}>
          <div style={styles.slipHeader}>🎓 BIIT OFFICIAL EXAMINATION SLIP</div>
          <div style={styles.slipInfoGrid}>

            {/* ✅ FIX: Show Roll No (from DB) instead of student name (not stored in DB) */}
            <div style={styles.slipRow}>
              <FaIdCard color="#05864e" size={14}/>
              <div>
                <strong>Roll No:</strong>{' '}
                <span style={{fontWeight:'bold', color:'#05864e'}}>
                  {data.rollNo || studentId || 'N/A'}
                </span>
              </div>
            </div>

            <div style={styles.slipRow}>
              <FaBookOpen color="#666" size={14}/>
              <div>
                <strong>Course:</strong>{' '}
                <span>
                  {data.courseCode && data.courseCode !== 'N/A' ? `${data.courseCode} — ` : ''}
                  {data.title.replace('Exam: ', '')}
                </span>
              </div>
            </div>

            <div style={styles.slipRow}>
              <FaCalendarAlt color="#666" size={14}/>
              <div><strong>Date:</strong> <span>{data.date}</span></div>
            </div>

            <div style={styles.slipRow}>
              <FaClock color="#666" size={14}/>
              <div>
                <strong>Time:</strong>{' '}
                <span>{data.startTime && data.startTime !== 'N/A' ? data.startTime : 'Check Official Schedule'}</span>
              </div>
            </div>

            <div style={styles.slipRow}>
              <FaMapMarkerAlt color="#666" size={14}/>
              <div><strong>Room / Hall:</strong> <span>{data.roomNo || 'TBA'}</span></div>
            </div>

          </div>

          {/* ✅ FIX: Seating Plan — always visible, shows '-' with notice if not yet assigned */}
          <div style={styles.seatingLabel}>📋 Seating Assignment</div>
          <div style={styles.seatingHighlight}>
            <div style={styles.seatBox}>
              <small style={styles.seatSmall}>ROOM / HALL</small>
              <div style={styles.seatValueText}>{data.roomNo || 'TBA'}</div>
            </div>
            <div style={styles.seatBox}>
              <small style={styles.seatSmall}>ROW NO</small>
              <div style={styles.seatValueText}>{data.rowNo || '-'}</div>
            </div>
            <div style={{...styles.seatBox, borderRight:'none'}}>
              <small style={styles.seatSmall}>SEAT NO</small>
              <div style={styles.seatValueText}>{data.seatNo || '-'}</div>
            </div>
          </div>

          {/* Notice when seating not yet assigned */}
          {(!data.seatNo || data.seatNo === '-') && (
            <p style={styles.seatNotice}>
              ⚠️ Seating plan not yet assigned. Check back closer to exam date.
            </p>
          )}

          {/* Instructions if any */}
          {data.description && data.description.trim() !== '' && (
            <div style={styles.instructionBox}>
              <strong style={{fontSize:'12px', color:'#dc3545'}}>📋 Instructions:</strong>
              <p style={{fontSize:'13px', margin:'5px 0 0', color:'#333', lineHeight:'1.5'}}>
                {data.description}
              </p>
            </div>
          )}

          <p style={styles.slipFooter}>
            * Please bring your official ID Card. Arrive 15 minutes early.
          </p>
        </div>
      );
    }

    // ── Non-exam events ───────────────────────────────────────────────────────
    return (
      <div style={styles.infoGridMain}>

        <div style={styles.infoRow}>
          <FaCalendarAlt style={styles.rowIcon}/>
          <div><strong>Date:</strong> <span>{data.date}</span></div>
        </div>

        {data.startTime && data.startTime !== "N/A" && (
          <div style={styles.infoRow}>
            <FaClock style={styles.rowIcon}/>
            <div><strong>Time:</strong> <span>{data.startTime}</span></div>
          </div>
        )}

        {((data.roomNo && data.roomNo !== "N/A" && data.roomNo !== "TBA") || data.venue) && (
          <div style={styles.infoRow}>
            <FaMapMarkerAlt style={styles.rowIcon}/>
            <div>
              <strong>Venue:</strong>{' '}
              <span>{(data.roomNo && data.roomNo !== "N/A" && data.roomNo !== "TBA") ? data.roomNo : data.venue}</span>
            </div>
          </div>
        )}

        {/* ✅ FIX: Description for ALL non-exam event types
             - Emergency  → reason from API
             - Saturday   → reason + replacement day
             - Holiday    → description from Public_Holidays table
             - Meeting    → agenda_description from FYP_Meetings table
             - Society/Activity/Semester → description from Academic_Calendar table
             Label changes contextually by event type */}
        <div style={styles.infoRow}>
          <FaFileExcel style={{...styles.rowIcon, color:'#1D6F42'}}/>
          <div style={{width:'100%'}}>
            <strong>
              {data.isEmergency              ? 'Reason / Details:' :
               data.isSaturday               ? 'Reason / Replacement Info:' :
               data.type === 'meeting'        ? 'Meeting Agenda:' :
               data.type === 'holiday'        ? 'Holiday Details:' :
               (data.type === 'society' || data.type === 'activity') ? 'Event Details:' :
               'Details / Instructions:'}
            </strong>
            <div style={{
              marginTop: '8px',
              padding: '10px',
              background:   data.isEmergency ? '#fff3f3' : data.isSaturday ? '#f0f4ff' : '#f8f9fa',
              borderRadius: '6px',
              borderLeft:   `4px solid ${data.isEmergency ? '#dc3545' : data.isSaturday ? '#007bff' : '#1D6F42'}`,
              fontSize:     '13px',
              whiteSpace:   'pre-wrap',
              color:        '#333',
              lineHeight:   '1.5'
            }}>
              {data.description && data.description.trim() !== ''
                ? data.description
                : data.isEmergency
                  ? "Emergency closure declared by administration."
                  : data.isSaturday
                    ? "This is a scheduled working Saturday."
                    : "No additional details provided."}
            </div>
          </div>
        </div>

        {data.isSaturday && data.venue && (
          <div style={styles.infoRow}>
            <FaCalendarWeek style={styles.rowIcon}/>
            <div><strong>Replacing Holiday:</strong> <span>{data.venue}</span></div>
          </div>
        )}

      </div>
    );
  };

  const Legend = () => (
    <div style={styles.legendWrapper}>
      <h4 style={styles.legendHeader}><FaInfoCircle /> Calendar Legend</h4>
      <div style={styles.legendGrid}>
        {[
          {color:'#dc3545', label:'Mid Exams'},
          {color:'#b71c1c', label:'Final Exams'},
          {color:'#87CEEB', label:'Holidays'},
          {color:'#e810b2', label:'Society Events'},
          {color:'#007bff', label:'Working Saturday'},
          {color:'#FF5733', label:'FYP Meetings'},
          {color:'#f39c12', label:'Activities'},
          {color:'#05864e', label:'Semester'},
          {color:'#000000', label:'Emergency'},
          {color:'#fff',    label:'Multiple Events', border:'2px solid gold'},
        ].map(({color,label,border}) => (
          <div key={label} style={styles.legendItem}>
            <div style={{...styles.colorBox, backgroundColor:color, border: border||'none'}}/>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <h3 style={{margin:0, color:'#05864e'}}>Academic Calendar</h3>

          {/* Notifications Bell */}
          {userRole === 'student' && (
            <div style={{position:'relative'}}>
              <button onClick={() => setShowNotifications(!showNotifications)} style={styles.bellButton}>
                <FaBell size={18} color="#555" />
                {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div style={styles.notificationOverlay} onClick={() => setShowNotifications(false)}>
                  <div style={styles.notificationModal} onClick={e => e.stopPropagation()}>
                    <div style={styles.notificationModalHeader}>
                      <div style={styles.notificationModalTitle}>
                        <FaBell size={16} color="#05864e" /><span>Notifications</span>
                      </div>
                      <button onClick={() => setShowNotifications(false)} style={styles.notificationModalClose}>×</button>
                    </div>
                    <div style={styles.notificationModalBody}>
                      {notifications.length > 0 ? notifications.map(notif => (
                        <div
                          key={notif.notification_id || notif.id}
                          style={{...styles.notificationModalItem, backgroundColor:(notif.is_read||notif.isRead)?'#f9f9f9':'#e8f5e9'}}
                          onClick={() => !(notif.is_read||notif.isRead) && markAsRead(notif.notification_id||notif.id)}
                        >
                          <div style={styles.notificationModalIcon}>
                            <FaInfoCircle size={14} color={(notif.is_read||notif.isRead)?'#999':'#05864e'}/>
                          </div>
                          <div style={styles.notificationModalContent}>
                            <p style={styles.notificationModalMessage}>{notif.message}</p>
                            <small style={styles.notificationModalDate}>
                              {notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}
                            </small>
                          </div>
                        </div>
                      )) : (
                        <div style={styles.noNotificationsModal}>
                          <FaBell size={30} color="#ccc"/><p>No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Societies Dropdown */}
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
                        <span style={{flex:1, fontSize:'12px'}}>{soc.society_name}</span>
                        <button onClick={() => handleToggleSubscribe(soc.society_name)}
                          style={{...styles.inlineSubBtn, background: isSubscribed?'#05864e':'#e810b2'}}>
                          {isSubscribed ? <FaCheckCircle size={10}/> : <FaPlus size={10}/>}
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
          {/* Filter */}
          <div style={{position:'relative'}}>
            <button
              style={{padding:'5px 12px', border:'1px solid #05864e', background: filterShow?'#05864e':'#e8f5e9', color: filterShow?'white':'#05864e', borderRadius:'5px', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', gap:'8px', fontWeight:'bold'}}
              onClick={() => setFilterShow(!filterShow)}
            >
              <FaFilter size={12} color={filterShow?'white':'#05864e'}/> Filter
              {getActiveFilterCount() < 9 && (
                <span style={{marginLeft:'4px', backgroundColor: filterShow?'white':'#05864e', color: filterShow?'#05864e':'white', borderRadius:'10px', padding:'0px 6px', fontSize:'10px', fontWeight:'bold'}}>
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
            {filterShow && (
              <div style={styles.filterDropdown}>
                <div style={styles.filterHeader}>
                  <span>Show Categories:</span>
                  <button onClick={clearAllFilters} style={styles.clearFilterBtn}>Show All</button>
                </div>
                {[
                  {id:'mids',label:'Mid Exams',color:'#dc3545'},
                  {id:'finals',label:'Final Exams',color:'#b71c1c'},
                  {id:'holiday',label:'Holidays',color:'#87CEEB'},
                  {id:'society',label:'Society Events',color:'#e810b2'},
                  {id:'saturday',label:'Working Saturday',color:'#007bff'},
                  {id:'meeting',label:'FYP Meetings',color:'#FF5733'},
                  {id:'activity',label:'Activities',color:'#f39c12'},
                  {id:'semester',label:'Semester',color:'#05864e'},
                  {id:'emergency',label:'Emergency',color:'#000000'},
                ].map(f => (
                  <div key={f.id} style={styles.filterItem} onClick={() => toggleFilter(f.id)}>
                    <input type="checkbox" checked={activeFilters[f.id]} readOnly style={{cursor:'pointer'}}/>
                    <div style={{...styles.colorBox, backgroundColor:f.color, width:'14px', height:'14px', borderRadius:'3px'}}/>
                    <span style={{fontSize:'12px', color: activeFilters[f.id]?'#333':'#aaa'}}>{f.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button style={viewMode==='annual'?styles.activeBtn:styles.btn} onClick={() => setViewMode('annual')}><FaList /> Annual</button>
          <button style={viewMode==='monthly'?styles.activeBtn:styles.btn} onClick={() => setViewMode('monthly')}><FaCalendarAlt /> Monthly</button>
        </div>
      </div>

      {/* Calendar Content */}
      <div style={styles.content}>
        {loading ? (
          <div style={{textAlign:'center', padding:'40px', color:'#05864e'}}>Loading calendar...</div>
        ) : viewMode === 'annual' ? (
          <>
            <div style={styles.annualGrid}>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((mName,mIdx) => (
                <div key={mIdx} style={styles.miniCard}>
                  <div style={styles.miniHeader}>{mName} {currentYear}</div>
                  <div style={styles.miniWeekRow}>
                    {['S','M','T','W','T','F','S'].map((wd,i) => <span key={i} style={styles.weekDay}>{wd}</span>)}
                  </div>
                  <div style={styles.miniDateGrid}>
                    {generateDays(currentYear, mIdx).map((d, idx) => {
                      const evForDate  = d ? getEventsForDate(d, mIdx, currentYear) : [];
                      const hasEvent   = evForDate.length > 0;
                      const mainEvent  = hasEvent ? evForDate[0] : null;
                      const isMultiple = evForDate.length > 1;
                      const label      = hasEvent ? (isMultiple ? `(${evForDate.length})` : getDisplayTitle(mainEvent.title,'annual')) : "";
                      return (
                        <div
                          key={idx}
                          onClick={() => d && handleDateClick(d, mIdx, currentYear)}
                          style={d ? {
                            ...styles.dayCell,
                            backgroundColor: hasEvent ? (mainEvent?.color||'#05864e') : '#f8f9fa',
                            color:           hasEvent ? 'white' : '#555',
                            border:          isMultiple ? '2px solid gold' : '1px solid #e9ecef',
                            cursor:          'pointer',
                            flexDirection:   'column',
                            minHeight:       '34px',
                            fontWeight:      isMultiple ? 'bold' : 'normal'
                          } : styles.emptyCell}
                        >
                          {d}
                          {d && hasEvent && label && (
                            <span style={{fontSize:'7px',marginTop:'1px',display:'block',textAlign:'center',maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'white',backgroundColor:'rgba(0,0,0,0.3)',padding:'1px 2px',borderRadius:'2px'}}>
                              {label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <Legend/>
          </>
        ) : (
          <div style={styles.monthlyContainer}>
            <div style={styles.monthNav}>
              <button onClick={() => setSelectedMonth(p => p===0?11:p-1)} style={styles.navBtn}><FaChevronLeft/></button>
              <h2 style={{margin:0, color:'#05864e'}}>
                {["January","February","March","April","May","June","July","August","September","October","November","December"][selectedMonth]} {currentYear}
              </h2>
              <button onClick={() => setSelectedMonth(p => p===11?0:p+1)} style={styles.navBtn}><FaChevronRight/></button>
            </div>
            <div style={styles.bigCalendar}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} style={styles.bigWeekHeader}>{d}</div>)}
              {generateDays(currentYear, selectedMonth).map((d,idx) => {
                const evForDate  = d ? getEventsForDate(d, selectedMonth, currentYear) : [];
                const hasEvent   = evForDate.length > 0;
                const mainEvent  = hasEvent ? evForDate[0] : null;
                const isMultiple = evForDate.length > 1;
                const label      = hasEvent ? (isMultiple ? `(${evForDate.length}) ${getDisplayTitle(mainEvent.title,'monthly')}` : getDisplayTitle(mainEvent.title,'monthly')) : "";
                return (
                  <div
                    key={idx}
                    onClick={() => d && handleDateClick(d, selectedMonth, currentYear)}
                    style={d ? {...styles.bigDayCell, backgroundColor:hasEvent?(mainEvent?.color||'#05864e'):'white', cursor:'pointer', border:isMultiple?'3px solid gold':'1px solid #dee2e6', borderRadius:'8px', margin:'2px'} : styles.bigEmptyCell}
                  >
                    {d && <span style={{...styles.dateNum, color:hasEvent?'white':'#333'}}>{d}</span>}
                    {d && hasEvent && label && (
                      <span style={{...styles.eventTitleDisplay, backgroundColor:'rgba(0,0,0,0.5)', padding:'2px 4px', borderRadius:'4px', fontSize:'9px', marginTop:'4px', display:'block', textAlign:'center', maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                        {label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <Legend/>
          </div>
        )}
      </div>

      {/* Selection Modal */}
      {isSelectionModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsSelectionModalOpen(false)}>
          <div style={styles.selectionModalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.selectionHeader}>
              <h3 style={{margin:0, fontSize:'18px'}}>Events on {multipleEventsList[0]?.date}</h3>
              <FaTimes style={{cursor:'pointer'}} onClick={() => setIsSelectionModalOpen(false)}/>
            </div>
            <div style={styles.selectionBody}>
              {multipleEventsList.map((ev,i) => (
                <div
                  key={i}
                  style={{...styles.selectionItem, borderLeft:`5px solid ${ev.color||'#05864e'}`}}
                  onClick={() => { setSelectedDateData(ev); setIsSelectionModalOpen(false); setIsModalOpen(true); }}
                >
                  <div style={{flex:1}}>
                    <div style={{fontWeight:'bold', fontSize:'14px', color:'#333'}}>{ev.title}</div>
                    <div style={{fontSize:'12px', color:'#666'}}>{ev.type?.toUpperCase()||'EVENT'} • {ev.startTime||'All Day'}</div>
                  </div>
                  <FaArrowRight color="#ccc"/>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isModalOpen && selectedDateData && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={{...styles.modalContent, borderTop:`8px solid ${selectedDateData.color||'#05864e'}`}} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.headerInfo}>
                <span style={{...styles.typeBadge, backgroundColor:selectedDateData.color||'#05864e'}}>
                  {(selectedDateData.isExam||selectedDateData.type==='exam') ? 'OFFICIAL EXAM SLIP' :
                   selectedDateData.isEmergency ? 'EMERGENCY' :
                   selectedDateData.isSaturday  ? 'WORKING DAY' :
                   selectedDateData.type?.toUpperCase()}
                </span>
                <h3 style={styles.modalTitle}>{selectedDateData.title}</h3>
              </div>
              <FaTimes style={styles.closeIcon} onClick={() => setIsModalOpen(false)}/>
            </div>
            <div style={styles.modalBody}>
              {renderModalBody(selectedDateData)}
            </div>
            <button style={{...styles.closeBtn, background:selectedDateData.color||'#05864e'}} onClick={() => setIsModalOpen(false)}>
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const styles = {
  container:              { padding:'10px 20px', backgroundColor:'white', borderRadius:'10px', height:'90vh', display:'flex', flexDirection:'column' },
  topBar:                 { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', borderBottom:'1px solid #eee' },
  bellButton:             { position:'relative', background:'transparent', border:'none', cursor:'pointer', padding:'8px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' },
  badge:                  { position:'absolute', top:'-5px', right:'-5px', backgroundColor:'#dc3545', color:'white', borderRadius:'50%', padding:'2px 6px', fontSize:'10px', fontWeight:'bold', minWidth:'18px', textAlign:'center' },
  notificationOverlay:    { position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 },
  notificationModal:      { backgroundColor:'white', borderRadius:'16px', width:'400px', maxWidth:'90%', maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.2)', overflow:'hidden' },
  notificationModalHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', backgroundColor:'#f8f9fa', borderBottom:'1px solid #e9ecef' },
  notificationModalTitle: { display:'flex', alignItems:'center', gap:'10px', fontSize:'16px', fontWeight:'bold', color:'#05864e' },
  notificationModalClose: { background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#999', lineHeight:1, padding:'0 4px' },
  notificationModalBody:  { flex:1, overflowY:'auto', padding:'12px' },
  notificationModalItem:  { display:'flex', gap:'12px', padding:'14px', borderRadius:'10px', marginBottom:'8px', cursor:'pointer', border:'1px solid #e9ecef' },
  notificationModalIcon:  { flexShrink:0, marginTop:'2px' },
  notificationModalContent:{ flex:1 },
  notificationModalMessage:{ margin:0, fontSize:'13px', color:'#333', lineHeight:'1.5' },
  notificationModalDate:  { fontSize:'10px', color:'#999', marginTop:'6px', display:'block' },
  noNotificationsModal:   { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px', color:'#999', textAlign:'center' },
  dropdownToggle:         { padding:'6px 12px', background:'#e810b2', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', fontSize:'12px', display:'flex', alignItems:'center', gap:'8px' },
  dropdownMenu:           { position:'absolute', top:'100%', left:0, background:'white', boxShadow:'0 8px 16px rgba(0,0,0,0.1)', borderRadius:'8px', width:'220px', zIndex:1000, marginTop:'5px', border:'1px solid #eee', padding:'10px' },
  dropdownItem:           { display:'flex', alignItems:'center', padding:'8px', borderBottom:'1px solid #f5f5f5', color:'#333' },
  inlineSubBtn:           { padding:'4px 8px', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  applyBtn:               { width:'100%', marginTop:'10px', background:'#05864e', color:'white', border:'none', borderRadius:'4px', padding:'6px', cursor:'pointer', fontSize:'11px', fontWeight:'bold' },
  buttonGroup:            { display:'flex', gap:'10px', alignItems:'center' },
  btn:                    { padding:'5px 12px', border:'1px solid #ccc', background:'white', borderRadius:'5px', cursor:'pointer', fontSize:'12px' },
  activeBtn:              { padding:'5px 12px', background:'#05864e', color:'white', borderRadius:'5px', border:'none', cursor:'pointer', fontSize:'12px' },
  filterDropdown:         { position:'absolute', top:'100%', right:0, background:'white', boxShadow:'0 8px 16px rgba(0,0,0,0.15)', borderRadius:'8px', width:'220px', zIndex:1002, marginTop:'5px', border:'1px solid #e0e0e0', padding:'10px' },
  filterHeader:           { display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'12px', fontWeight:'bold', marginBottom:'10px', color:'#05864e', borderBottom:'1px solid #f0f0f0', paddingBottom:'5px' },
  clearFilterBtn:         { background:'none', border:'none', color:'#dc3545', fontSize:'11px', cursor:'pointer' },
  filterItem:             { display:'flex', alignItems:'center', gap:'10px', padding:'6px 0', cursor:'pointer', borderRadius:'4px' },
  content:                { flex:1, overflowY:'auto' },
  annualGrid:             { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'10px' },
  miniCard:               { border:'1px solid #ddd', borderRadius:'8px', overflow:'hidden', boxShadow:'0 2px 4px rgba(0,0,0,0.05)' },
  miniHeader:             { backgroundColor:'#05864e', color:'white', padding:'4px', textAlign:'center', fontSize:'11px', fontWeight:'bold' },
  miniWeekRow:            { display:'grid', gridTemplateColumns:'repeat(7, 1fr)', backgroundColor:'#f1f1f1', padding:'4px 0' },
  weekDay:                { fontSize:'8px', textAlign:'center', fontWeight:'bold', color:'#555' },
  miniDateGrid:           { display:'grid', gridTemplateColumns:'repeat(7, 1fr)', padding:'4px', gap:'1px' },
  dayCell:                { fontSize:'10px', textAlign:'center', height:'34px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:'6px', fontWeight:'500', transition:'all 0.2s ease' },
  emptyCell:              { backgroundColor:'transparent' },
  monthlyContainer:       { height:'100%', display:'flex', flexDirection:'column' },
  monthNav:               { display:'flex', justifyContent:'center', alignItems:'center', gap:'20px', marginBottom:'10px' },
  navBtn:                 { padding:'5px 10px', cursor:'pointer', border:'1px solid #ddd', background:'white', borderRadius:'5px' },
  bigCalendar:            { display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px' },
  bigWeekHeader:          { backgroundColor:'#05864e', color:'white', padding:'10px', textAlign:'center', fontWeight:'bold', fontSize:'12px', borderRadius:'6px' },
  bigDayCell:             { minHeight:'95px', padding:'8px', display:'flex', flexDirection:'column', backgroundColor:'#fff', border:'1px solid #dee2e6', borderRadius:'8px', margin:'1px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  bigEmptyCell:           { backgroundColor:'#f9f9f9', minHeight:'95px', borderRadius:'8px', margin:'1px' },
  dateNum:                { fontWeight:'bold', fontSize:'14px', marginBottom:'4px', display:'block' },
  eventTitleDisplay:      { fontSize:'9px', marginTop:'4px', padding:'2px 4px', borderRadius:'4px', display:'block', textAlign:'center', maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  modalOverlay:           { position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 },
  modalContent:           { backgroundColor:'white', borderRadius:'12px', width:'440px', maxHeight:'90vh', overflowY:'auto', padding:0, boxShadow:'0 20px 25px -5px rgba(0,0,0,0.2)' },
  modalHeader:            { display:'flex', justifyContent:'space-between', padding:'20px', backgroundColor:'#f8fafc' },
  headerInfo:             { display:'flex', flexDirection:'column', gap:'8px' },
  typeBadge:              { padding:'4px 10px', color:'white', borderRadius:'20px', fontSize:'10px', fontWeight:'bold', width:'fit-content' },
  modalTitle:             { margin:0, fontSize:'20px', color:'#1e293b', fontWeight:'700' },
  closeIcon:              { cursor:'pointer', fontSize:'20px', color:'#94a3b8' },
  modalBody:              { padding:'20px' },
  infoGridMain:           { display:'flex', flexDirection:'column', gap:'15px' },
  infoRow:                { display:'flex', alignItems:'flex-start', gap:'12px', color:'#475569', fontSize:'14px' },
  rowIcon:                { marginTop:'3px', color:'#64748b', fontSize:'16px', flexShrink:0 },
  closeBtn:               { width:'100%', padding:'14px', color:'white', border:'none', cursor:'pointer', fontWeight:'bold', fontSize:'14px', letterSpacing:'0.5px' },
  selectionModalContent:  { backgroundColor:'white', borderRadius:'12px', width:'350px', padding:'20px', boxShadow:'0 20px 25px rgba(0,0,0,0.2)' },
  selectionHeader:        { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px' },
  selectionBody:          { display:'flex', flexDirection:'column', gap:'10px' },
  selectionItem:          { display:'flex', alignItems:'center', padding:'12px', background:'#f8f9fa', borderRadius:'8px', cursor:'pointer' },
  legendWrapper:          { marginTop:'25px', padding:'15px', borderTop:'2px solid #eee', backgroundColor:'#fdfdfd' },
  legendHeader:           { margin:'0 0 12px 0', fontSize:'15px', color:'#05864e', display:'flex', alignItems:'center', gap:'8px' },
  legendGrid:             { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'10px' },
  legendItem:             { display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'#444' },
  colorBox:               { width:'16px', height:'16px', borderRadius:'3px', boxShadow:'inset 0 0 2px rgba(0,0,0,0.2)', flexShrink:0 },
  // Exam Slip
  examSlipContainer:      { border:'2px dashed #05864e', padding:'18px', borderRadius:'12px', backgroundColor:'#f9fefc' },
  slipHeader:             { textAlign:'center', fontWeight:'bold', fontSize:'13px', color:'#05864e', marginBottom:'15px', borderBottom:'1px solid #e0e0e0', paddingBottom:'8px', letterSpacing:'0.5px' },
  slipInfoGrid:           { display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' },
  slipRow:                { display:'flex', alignItems:'center', gap:'10px', fontSize:'13px', color:'#333' },
  seatingLabel:           { fontSize:'12px', fontWeight:'bold', color:'#05864e', marginBottom:'8px', marginTop:'4px' },
  seatingHighlight:       { display:'flex', justifyContent:'space-around', background:'#05864e', padding:'14px 10px', borderRadius:'10px', color:'white', textAlign:'center', marginBottom:'8px' },
  seatBox:                { flex:1, borderRight:'1px solid rgba(255,255,255,0.3)', paddingRight:'6px' },
  seatSmall:              { opacity:0.8, fontSize:'9px', letterSpacing:'1px', display:'block', marginBottom:'4px' },
  seatValueText:          { fontSize:'22px', fontWeight:'bold' },
  seatNotice:             { fontSize:'11px', color:'#e67e22', marginTop:'6px', textAlign:'center', fontStyle:'italic' },
  instructionBox:         { marginTop:'14px', padding:'10px', background:'#fff4f4', borderRadius:'8px', borderLeft:'4px solid #dc3545' },
  slipFooter:             { fontSize:'10px', color:'#888', marginTop:'14px', textAlign:'center', fontStyle:'italic' },
};

export default ViewCalendar;
