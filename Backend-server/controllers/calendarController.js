const { connectDB, sql } = require('../config/db');
const IslamicController = require('./Admin/IslamicHolidaysController');

// 1. Admin Side: Semester Timeline Save (Existing)
exports.manageSemester = async (req, res) => {
    try {
        const { events } = req.body;
        const pool = req.app.locals.db;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            for (const event of events) {
                await transaction.request()
                    .input('title', sql.VarChar, event.title)
                    .input('type', sql.VarChar, event.type)
                    .input('start', sql.Date, event.start)
                    .input('end', sql.Date, event.end)
                    .input('color', sql.VarChar, event.color)
                    .query(`INSERT INTO Academic_Calendar 
                            (event_title, event_type, start_date, end_date, color_code, visibility) 
                            VALUES (@title, @type, @start, @end, @color, 'public')`);
            }
            await transaction.commit();
            res.status(200).json({ success: true, message: "Semester Timeline Updated Successfully! ✅" });
        } catch (err) {
            await transaction.rollback();
            res.status(500).json({ success: false, message: "Database Error" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 2. 🟢 MAIN FIX: Semester-wise Events Fetching with SEATING PLAN data (course_code, seat_no, row_no)
exports.getAllEvents = async (req, res) => {
    try {
        const { studentId, role } = req.query; 
        const pool = req.app.locals.db;
        
        const normalizedRole = role ? role.toString().toLowerCase().trim() : '';
        const isStudent = (normalizedRole === 'student' && studentId && studentId !== 'undefined');

        let query = "";
        
        // --- PART 1: Academic & Society Events ---
        if (isStudent) {
            query = `
                SELECT CAST(AC.event_id AS VARCHAR) as id, AC.event_title as title, AC.event_type as type, 
                       CONVERT(VARCHAR, AC.start_date, 23) as start_date, CONVERT(VARCHAR, AC.end_date, 23) as end_date, 
                       AC.color_code, AC.event_time as start_time, AC.venue as room_no,
                       NULL as course_code, NULL as seat_no, NULL as row_no
                FROM Academic_Calendar AC
                LEFT JOIN Societies S ON AC.society_id = S.society_id
                WHERE LOWER(TRIM(AC.visibility)) = 'public'
                UNION
                SELECT CAST(AC.event_id AS VARCHAR) as id, AC.event_title as title, AC.event_type as type, 
                       CONVERT(VARCHAR, AC.start_date, 23) as start_date, CONVERT(VARCHAR, AC.end_date, 23) as end_date, 
                       AC.color_code, AC.event_time as start_time, AC.venue as room_no,
                       NULL as course_code, NULL as seat_no, NULL as row_no
                FROM Academic_Calendar AC
                INNER JOIN Societies S ON AC.society_id = S.society_id
                INNER JOIN User_Event_Preferences UEP ON LOWER(TRIM(UEP.event_type)) = LOWER(TRIM(S.society_name))
                WHERE LOWER(TRIM(AC.visibility)) = 'private' AND UEP.user_id = @studentId`;
        } else {
            query = `SELECT CAST(AC.event_id AS VARCHAR) as id, AC.event_title as title, AC.event_type as type, 
                            CONVERT(VARCHAR, AC.start_date, 23) as start_date, CONVERT(VARCHAR, AC.end_date, 23) as end_date, 
                            AC.color_code, AC.event_time as start_time, AC.venue as room_no,
                            NULL as course_code, NULL as seat_no, NULL as row_no
                     FROM Academic_Calendar AC`;
        }

        // --- PART 2: Public Holidays ---
        query += ` UNION ALL
                  SELECT CAST(PH.holiday_id AS VARCHAR) as id, PH.holiday_name as title, 'holiday' as type, 
                         CONVERT(VARCHAR, PH.start_date, 23) as start_date, CONVERT(VARCHAR, PH.end_date, 23) as end_date, 
                         '#87CEEB' as color_code, NULL as start_time, NULL as room_no,
                         NULL as course_code, NULL as seat_no, NULL as row_no
                  FROM Public_Holidays PH`;

        // --- PART 3: FYP Meetings (Synced with AD's Notif Logic) ---
        if (isStudent) {
            query += ` UNION ALL
                      SELECT CAST(M.meeting_id AS VARCHAR) as id, 'FYP Meeting: ' + M.title as title, 'meeting' as type, 
                             CONVERT(VARCHAR, M.meeting_date, 23) as start_date, CONVERT(VARCHAR, M.meeting_date, 23) as end_date, 
                             '#FF5733' as color_code, 
                             CONVERT(VARCHAR, M.meeting_time, 108) as start_time, 
                             M.venue as room_no,
                             NULL as course_code, NULL as seat_no, NULL as row_no
                      FROM FYP_Meetings M
                      WHERE EXISTS (
                          SELECT 1 FROM Notifications N 
                          WHERE N.user_id = @studentId 
                          AND N.title LIKE '%' + M.title + '%'
                      )`;
        } else {
            query += ` UNION ALL
                      SELECT CAST(M.meeting_id AS VARCHAR) as id, 'FYP Meeting: ' + M.title as title, 'meeting' as type, 
                             CONVERT(VARCHAR, M.meeting_date, 23) as start_date, CONVERT(VARCHAR, M.meeting_date, 23) as end_date, 
                             '#FF5733' as color_code, 
                             CONVERT(VARCHAR, M.meeting_time, 108) as start_time, 
                             M.venue as room_no,
                             NULL as course_code, NULL as seat_no, NULL as row_no
                      FROM FYP_Meetings M`;
        }

        // --- PART 4: Exams with COURSE CODE and SEATING PLAN ---
        if (normalizedRole === 'admin' || normalizedRole === 'datacell' || normalizedRole === 'chairperson' || normalizedRole === 'assistant director') {
            query += ` UNION ALL
                      SELECT CAST(e.exam_id AS VARCHAR) as id, 'Exam: ' + c.course_name as title, 'exam' as type, 
                             CONVERT(VARCHAR, e.exam_date, 23) as start_date, CONVERT(VARCHAR, e.exam_date, 23) as end_date, 
                             ISNULL(e.color_code, '#dc3545') as color_code, 
                             CAST(e.start_time AS VARCHAR) as start_time, 
                             e.room_no,
                             c.course_code,
                             NULL as seat_no,
                             NULL as row_no
                      FROM Exam_Schedule e 
                      JOIN Courses c ON e.course_id = c.course_id`;
        } else if (isStudent) {
            query += ` UNION ALL
                      SELECT 
                        CAST(e.exam_id AS VARCHAR) as id, 
                        'Exam: ' + c.course_name as title, 
                        'exam' as type, 
                        CONVERT(VARCHAR, e.exam_date, 23) as start_date, 
                        CONVERT(VARCHAR, e.exam_date, 23) as end_date, 
                        ISNULL(e.color_code, '#dc3545') as color_code, 
                        CONVERT(VARCHAR, e.start_time, 108) as start_time, 
                        e.room_no as room_no,
                        c.course_code as course_code,
                        CAST(sp.seat_no AS VARCHAR) as seat_no,
                        CAST(sp.row_no AS VARCHAR) as row_no
                      FROM Exam_Schedule e 
                      JOIN Courses c ON e.course_id = c.course_id
                      JOIN Enrollments en ON e.course_id = en.course_id
                      LEFT JOIN SeatingPlan sp ON e.exam_id = sp.exam_id AND sp.student_id = en.student_id
                      WHERE en.student_id = @studentId`;
        }

        const finalSQL = `SELECT * FROM (${query}) AS AllEvents ORDER BY start_date DESC`;
        const request = pool.request();
        if (isStudent) request.input('studentId', sql.Int, parseInt(studentId));

        const result = await request.query(finalSQL);
        let finalData = result.recordset || [];

        // Islamic Holidays Integration
        try {
            const currentYear = new Date().getFullYear();
            const islamicHolidays = await IslamicController.getIslamicHolidays(pool, currentYear);
            if (Array.isArray(islamicHolidays)) {
                const formatted = islamicHolidays.map(h => ({
                    id: `ih-${h.id || Math.random()}`,
                    title: h.title,
                    type: 'holiday',
                    start_date: h.date || h.start_date,
                    end_date: h.date || h.start_date,
                    color_code: '#87CEEB',
                    start_time: null,
                    room_no: 'N/A',
                    course_code: null,
                    seat_no: null,
                    row_no: null
                }));
                finalData = [...finalData, ...formatted];
            }
        } catch (e) { console.error("Holidays error"); }

        res.status(200).json(finalData);
        
    } catch (err) {
        console.error("Backend Error:", err.message);
        res.status(500).json({ error: "Fetch failed: " + err.message });
    }
};