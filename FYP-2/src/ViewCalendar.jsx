// @ts-nocheck
import React, { useState, useEffect } from 'react'; 
import { FaCalendarAlt, FaList, FaChevronLeft, FaChevronRight, FaTimes, FaClock, FaMapMarkerAlt, FaBookOpen, FaExclamationTriangle, FaBriefcase, FaUsers, FaPlus, FaCheckCircle, FaChevronDown, FaInfoCircle, FaHourglassHalf, FaStickyNote, FaCalendarWeek, FaFlagCheckered, FaBell, FaArrowRight, FaFileExcel, FaIdCard } from 'react-icons/fa';

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

  // 🚩 Student ID Mismatch Logic
  const studentIdFromStorage = localStorage.getItem('studentId');
  const userIdFromStorage = localStorage.getItem('userId');
  const studentId = (userRole?.toLowerCase() === 'student') ? (studentIdFromStorage || userIdFromStorage) : userIdFromStorage;

  const [selectedDateData, setSelectedDateData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [multipleEventsList, setMultipleEventsList] = useState([]);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const getShortTitle = (title, maxLength) => {
    if (!title) return "";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 2) + "..";
  };

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
              // 🚩 Fixed description mapping
              description: item.description || item.agenda_description || "",
              societyName: item.society_name || "",
              seatNo: item.seat_no || "-",
              rowNo: item.row_no || "-",
              courseCode: item.course_code || "N/A"
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
        window.location.reload();
      }
    } catch (err) { console.error("Action Error:", err); }
  };

  const handleDateClick = (day, monthIndex, year) => {
    if (!day) return;
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const formattedDisplayDate = `${String(day).padStart(2, '0')}-${String(monthIndex + 1).padStart(2, '0')}-${year}`;

    let rawDayEvents = [];

    const foundEmergency = emergencyHolidays.find(h => dateStr >= h.start_date.split('T')[0] && dateStr <= h.end_date.split('T')[0]);
    if (foundEmergency) rawDayEvents.push({ date: formattedDisplayDate, title: "Emergency Closure", type: "Emergency", isEmergency: true, description: foundEmergency.reason, color: 'black' });

    const foundSaturday = rescheduledSaturdays.find(s => s.working_date.split('T')[0] === dateStr);
    if (foundSaturday) {
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
      rawDayEvents.push({ date: formattedDisplayDate, dayName: dayName, title: "Working Saturday", type: "Rescheduled Day", isSaturday: true, description: foundSaturday.reason || "Academic replacement day", color: '#007bff', venue: foundSaturday.replacement_day });
    }

    const filteredEvents = events.filter(e => {
        if (e.type === 'semester') return dateStr === e.start;
        return (dateStr >= e.start && dateStr <= e.end);
    });

    filteredEvents.forEach(e => {
        let eventData = { ...e, date: formattedDisplayDate };
        const lowerTitle = e.title?.toLowerCase() || "";
        if (lowerTitle.includes("exam") || e.type === 'exam') {
            eventData.isExam = true;
            eventData.examType = lowerTitle.includes("mid") ? "MIDS" : "FINALS";
            eventData.venue = e.roomNo || "TBA";
        } else if (e.type === 'holiday') {
            eventData.isHoliday = true;
        } else if (e.type === 'semester') {
            eventData.isSemester = true;
        } else {
            eventData.isRegularEvent = true;
        }
        rawDayEvents.push(eventData);
    });

    const uniqueEvents = rawDayEvents.filter((event, index, self) =>
        index === self.findIndex((t) => (
            t.title.trim().toLowerCase() === event.title.trim().toLowerCase()
        ))
    );

    if (uniqueEvents.length === 0) return;

    if (uniqueEvents.length === 1) {
      setSelectedDateData(uniqueEvents[0]);
      setIsModalOpen(true);
    } else {
      setMultipleEventsList(uniqueEvents);
      setIsSelectionModalOpen(true);
    }
  };

  const getEventsForDate = (day, monthIndex, year) => {
    if (!day) return [];
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let items = [];

    const isEmergency = emergencyHolidays.find(h => dateStr >= h.start_date.split('T')[0] && dateStr <= h.end_date.split('T')[0]);
    if (isEmergency) items.push({ title: "Emergency Closure", color: "black", shortTitle: "Closure" });

    const isSaturdayWork = rescheduledSaturdays.find(s => s.working_date.split('T')[0] === dateStr);
    if (isSaturdayWork) items.push({ title: "Working Saturday", color: "#007bff", shortTitle: "Work Sat" });

    const dayEvents = events.filter(e => {
        if (e.type === 'semester') return dateStr === e.start;
        return (dateStr >= e.start && dateStr <= e.end);
    });

    const uniqueDayEvents = dayEvents.filter((ev, idx, arr) => 
        idx === arr.findIndex((t) => t.title.trim().toLowerCase() === ev.title.trim().toLowerCase())
    );

    return items.concat(uniqueDayEvents);
  };

  const getDisplayTitle = (title, viewMode) => {
    if (!title) return "";
    if (viewMode === 'annual') {
      return getShortTitle(title, 6);
    } else {
      return getShortTitle(title, 20);
    }
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
        <div style={styles.legendItem}><div style={{...styles.colorBox, border: '2px solid gold', backgroundColor:'#fff'}}></div><span>Multiple Events</span></div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <h3 style={{margin:0, color:'#05864e'}}>Academic Calendar</h3>
          {userRole === 'student' && (
            <div style={{position: 'relative'}}>
              <button onClick={() => setShowNotifications(!showNotifications)} style={styles.bellButton}>
                <FaBell size={18} color="#555" />
                {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
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
                      const eventsForDate = d ? getEventsForDate(d, mIdx, currentYear) : [];
                      const hasEvent = eventsForDate.length > 0;
                      const mainEvent = hasEvent ? eventsForDate[0] : null;
                      const isMultiple = eventsForDate.length > 1;
                      const displayTitle = hasEvent ? (isMultiple ? `(${eventsForDate.length})` : getDisplayTitle(mainEvent.title, 'annual')) : "";
                      
                      return (
                        <div 
                          key={idx} 
                          style={d ? { 
                            ...styles.dayCell, 
                            backgroundColor: hasEvent ? (mainEvent?.color || '#05864e') : '#f8f9fa',
                            color: hasEvent ? 'white' : '#555',
                            border: isMultiple ? '2px solid gold' : '1px solid #e9ecef',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '34px',
                            fontWeight: isMultiple ? 'bold' : 'normal'
                          } : styles.emptyCell} onClick={() => d && handleDateClick(d, mIdx, currentYear)}>
                          {d}
                          {d && hasEvent && displayTitle && (
                            <span style={{ fontSize: '7px', marginTop: '1px', display: 'block', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', padding: '1px 2px', borderRadius: '2px' }}>
                              {displayTitle}
                            </span>
                          )}
                        </div>
                      );
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
                const eventsForDate = d ? getEventsForDate(d, selectedMonth, currentYear) : [];
                const hasEvent = eventsForDate.length > 0;
                const mainEvent = hasEvent ? eventsForDate[0] : null;
                const isMultiple = eventsForDate.length > 1;
                const displayTitle = hasEvent ? (isMultiple ? `(${eventsForDate.length}) ${getDisplayTitle(mainEvent.title, 'monthly')}` : getDisplayTitle(mainEvent.title, 'monthly')) : "";
                
                return (
                  <div key={idx} onClick={() => d && handleDateClick(d, selectedMonth, currentYear)} style={d ? { ...styles.bigDayCell, backgroundColor: hasEvent ? (mainEvent?.color || '#05864e') : 'white', cursor: 'pointer', border: isMultiple ? '3px solid gold' : '1px solid #dee2e6', borderRadius: '8px', margin: '2px', transition: 'all 0.2s ease' } : styles.bigEmptyCell}>
                    {d && <span style={{...styles.dateNum, color: hasEvent ? 'white' : '#333'}}>{d}</span>}
                    {d && hasEvent && displayTitle && (
                      <span style={{...styles.eventTitleDisplay, backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px', fontSize: '9px', marginTop: '4px', display: 'block', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {displayTitle}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <Legend />
          </div>
        ))}
      </div>

      {/* --- SELECTION MODAL --- */}
      {isSelectionModalOpen && (
          <div style={styles.modalOverlay} onClick={() => setIsSelectionModalOpen(false)}>
              <div style={styles.selectionModalContent} onClick={e => e.stopPropagation()}>
                  <div style={styles.selectionHeader}>
                      <h3 style={{margin:0, fontSize:'18px'}}>Events on {multipleEventsList[0]?.date}</h3>
                      <FaTimes style={{cursor:'pointer'}} onClick={() => setIsSelectionModalOpen(false)} />
                  </div>
                  <div style={styles.selectionBody}>
                      {multipleEventsList.map((ev, i) => (
                          <div 
                            key={i} 
                            style={{...styles.selectionItem, borderLeft: `5px solid ${ev.color || '#05864e'}`}}
                            onClick={() => {
                                setSelectedDateData(ev);
                                setIsSelectionModalOpen(false);
                                setIsModalOpen(true);
                            }}
                          >
                              <div style={{flex:1}}>
                                  <div style={{fontWeight:'bold', fontSize:'14px', color:'#333'}}>{ev.title}</div>
                                  <div style={{fontSize:'12px', color:'#666'}}>{ev.type?.toUpperCase() || 'EVENT'} • {ev.startTime || 'All Day'}</div>
                              </div>
                              <FaArrowRight color="#ccc" />
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- DETAIL MODAL (Updated with Description Logic) --- */}
      {isModalOpen && selectedDateData && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={{...styles.modalContent, borderTop: `8px solid ${selectedDateData.color || '#05864e'}`}} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.headerInfo}>
                <span style={{...styles.typeBadge, backgroundColor: selectedDateData.color || '#05864e'}}>
                   {(selectedDateData.isExam || selectedDateData.type === 'exam') ? 'OFFICIAL EXAM SLIP' : selectedDateData.type?.toUpperCase()}
                </span>
                <h3 style={styles.modalTitle}>{selectedDateData.title}</h3>
              </div>
              <FaTimes style={styles.closeIcon} onClick={() => setIsModalOpen(false)} />
            </div>
            
            <div style={styles.modalBody}>
              {(selectedDateData.isExam || selectedDateData.type === 'exam') ? (
                <div style={styles.examSlipContainer}>
                    <div style={styles.slipHeader}>BIIT EXAMINATION SEATING PLAN</div>
                    <div style={styles.slipInfoGrid}>
                        <div style={styles.slipRow}><FaIdCard color="#666" /> <div><strong>Student Name:</strong> <span>{localStorage.getItem('userName') || 'Mohsin Ishfaq'}</span></div></div>
                        <div style={styles.slipRow}><FaBookOpen color="#666" /> <div><strong>Course:</strong> <span>{selectedDateData.courseCode || 'N/A'} - {selectedDateData.title.replace('Exam: ', '')}</span></div></div>
                        <div style={styles.slipRow}><FaCalendarAlt color="#666" /> <div><strong>Date:</strong> <span>{selectedDateData.date}</span></div></div>
                        <div style={styles.slipRow}><FaClock color="#666" /> <div><strong>Time Slot:</strong> <span>{selectedDateData.startTime || 'Check Schedule'}</span></div></div>
                    </div>
                    
                    <div style={styles.seatingHighlight}>
                        <div style={styles.seatBox}>
                            <small>ROOM / HALL</small>
                            <div style={styles.seatValueText}>{selectedDateData.roomNo || 'TBA'}</div>
                        </div>
                        <div style={styles.seatBox}>
                            <small>ROW NO</small>
                            <div style={styles.seatValueText}>{selectedDateData.rowNo || '-'}</div>
                        </div>
                        <div style={{...styles.seatBox, borderRight:'none'}}>
                            <small>SEAT NO</small>
                            <div style={styles.seatValueText}>{selectedDateData.seatNo || '-'}</div>
                        </div>
                    </div>

                    {/* 🚩 AD Instructions Box in Exam Slip */}
                    {selectedDateData.description && (
                      <div style={{marginTop:'15px', padding:'10px', background:'#fff4f4', borderRadius:'8px', borderLeft:'4px solid #dc3545'}}>
                        <strong style={{fontSize:'12px', color:'#dc3545'}}>Instructions:</strong>
                        <p style={{fontSize:'13px', margin:'5px 0 0 0', color:'#333', lineHeight:'1.4'}}>
                          {selectedDateData.description}
                        </p>
                      </div>
                    )}

                    <p style={{fontSize: '10px', color: '#888', marginTop: '15px', textAlign: 'center', fontStyle: 'italic'}}>
                        * Please bring your official ID Card. Arrive 15 mins early.
                    </p>
                </div>
              ) : (
                <div style={styles.infoGridMain}>
                    <div style={styles.infoRow}><FaCalendarAlt style={styles.rowIcon} /><div><strong>Date:</strong> <span>{selectedDateData.date}</span></div></div>
                    {selectedDateData.startTime && selectedDateData.startTime !== "N/A" && <div style={styles.infoRow}><FaClock style={styles.rowIcon} /><div><strong>Time:</strong> <span>{selectedDateData.startTime}</span></div></div>}
                    {(selectedDateData.roomNo || selectedDateData.venue) && <div style={styles.infoRow}><FaMapMarkerAlt style={styles.rowIcon} /><div><strong>Venue:</strong> <span>{selectedDateData.roomNo || selectedDateData.venue}</span></div></div>}
                    
                    {/* 🚩 AD/Admin Description for Holidays/Meetings/Activities */}
                    <div style={styles.infoRow}>
                        <FaFileExcel style={{...styles.rowIcon, color: '#1D6F42'}} />
                        <div>
                            <strong>Details / Instructions:</strong> 
                            <div style={{marginTop:'8px', padding:'10px', background:'#f8f9fa', borderRadius:'6px', borderLeft:'4px solid #1D6F42', fontSize:'13px', whiteSpace:'pre-wrap', color:'#333', lineHeight:'1.5'}}>
                                {selectedDateData.description || "No specific instructions for this day."}
                            </div>
                        </div>
                    </div>
                </div>
              )}
            </div>
            <button style={{...styles.closeBtn, background: selectedDateData.color || '#05864e'}} onClick={() => setIsModalOpen(false)}>Close Details</button>
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
  miniCard: { border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  miniHeader: { backgroundColor: '#05864e', color: 'white', padding: '4px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' },
  miniWeekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f1f1f1', padding: '4px 0' },
  weekDay: { fontSize: '8px', textAlign: 'center', fontWeight: 'bold', color: '#555' },
  miniDateGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px', gap: '1px' },
  dayCell: { fontSize: '10px', textAlign: 'center', height: '34px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: '500', transition: 'all 0.2s ease' },
  emptyCell: { backgroundColor: 'transparent' },
  monthlyContainer: { height: '100%', display: 'flex', flexDirection: 'column' },
  monthNav: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' },
  navBtn: { padding: '5px 10px', cursor: 'pointer', border: '1px solid #ddd', background: 'white', borderRadius: '5px' },
  bigCalendar: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', backgroundColor: 'transparent' },
  bigWeekHeader: { backgroundColor: '#05864e', color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', borderRadius: '6px' },
  bigDayCell: { minHeight: '95px', padding: '8px', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', margin: '1px', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  bigEmptyCell: { backgroundColor: '#f9f9f9', minHeight: '95px', borderRadius: '8px', margin: '1px' },
  dateNum: { fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', display: 'block' },
  eventTitleDisplay: { fontSize: '9px', marginTop: '4px', padding: '2px 4px', borderRadius: '4px', display: 'block', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
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
  closeBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.5px' },
  selectionModalContent: { backgroundColor: 'white', borderRadius: '12px', width: '350px', padding: '20px', boxShadow: '0 20px 25px rgba(0,0,0,0.2)' },
  selectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px' },
  selectionBody: { display:'flex', flexDirection:'column', gap:'10px' },
  selectionItem: { display:'flex', alignItems:'center', padding:'12px', background:'#f8f9fa', borderRadius:'8px', cursor:'pointer', transition:'transform 0.2s' },
  legendWrapper: { marginTop: '25px', padding: '15px', borderTop: '2px solid #eee', backgroundColor: '#fdfdfd' },
  legendHeader: { margin: '0 0 12px 0', fontSize: '15px', color: '#05864e', display: 'flex', alignItems: 'center', gap: '8px' },
  legendGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#444' },
  colorBox: { width: '18px', height: '18px', borderRadius: '4px', boxShadow: 'inset 0 0 2px rgba(0,0,0,0.2)' },
  examSlipContainer: { border: '2px dashed #05864e', padding: '18px', borderRadius: '12px', backgroundColor: '#f9fefc' },
  slipHeader: { textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: '#05864e', marginBottom: '15px', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' },
  slipInfoGrid: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  slipRow: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#333' },
  seatingHighlight: { display: 'flex', justifyContent: 'space-between', background: '#05864e', padding: '15px', borderRadius: '10px', color: 'white', textAlign: 'center' },
  seatBox: { flex: 1, borderRight: '1px solid rgba(255,255,255,0.3)' },
  seatValueText: { fontSize: '22px', fontWeight: 'bold', marginTop: '5px' },
};

export default ViewCalendar;