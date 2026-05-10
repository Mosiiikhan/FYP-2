const { connectDB, sql } = require('../config/db');
const IslamicController = require('./Admin/IslamicHolidaysController');

// 1. Admin Side: Semester Timeline Save (UNCHANGED)
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

// 2. All Events Fetch (role-aware)
exports.getAllEvents = async (req, res) => {
    try {
        const { studentId, role } = req.query;
        const pool = req.app.locals.db;

        const normalizedRole = role ? role.toString().toLowerCase().trim() : '';
        const isStudent = (normalizedRole === 'student' && studentId && studentId !== 'undefined');

        // ─────────────────────────────────────────────────────────────────────
        // STEP 0: Resolve student_id (INT PK) and roll_no from Students table
        // ─────────────────────────────────────────────────────────────────────
        let resolvedStudentId = null;
        let resolvedRollNo    = null;

        if (isStudent) {
            const raw       = studentId.toString().trim();
            const isNumeric = /^\d+$/.test(raw);

            const lookupQuery = `
                SELECT TOP 1 student_id, roll_no
                FROM Students
                WHERE roll_no = @raw
                ${isNumeric ? `
                UNION
                SELECT TOP 1 student_id, roll_no
                FROM Students
                WHERE user_id = @rawInt
                UNION
                SELECT TOP 1 student_id, roll_no
                FROM Students
                WHERE student_id = @rawInt
                ` : ''}
            `;

            const lookupReq = pool.request().input('raw', sql.VarChar, raw);
            if (isNumeric) lookupReq.input('rawInt', sql.Int, parseInt(raw, 10));

            const lookupResult = await lookupReq.query(lookupQuery);
            if (lookupResult.recordset.length > 0) {
                resolvedStudentId = lookupResult.recordset[0].student_id;
                resolvedRollNo    = lookupResult.recordset[0].roll_no;
            }
            console.log(`[Calendar] studentId="${raw}", resolved student_id=${resolvedStudentId}, roll_no=${resolvedRollNo}`);
        }

        // ─────────────────────────────────────────────────────────────────────
        // 🟢 STEP 1: SMART CATEGORY CHECK (Mids vs Finals)
        // Check separately if Mids or Finals exist in Exam_Schedule
        // ─────────────────────────────────────────────────────────────────────
        const examTypeCheckResult = await pool.request().query(`
            SELECT 
                COUNT(CASE WHEN LOWER(exam_type) LIKE '%mid%' THEN 1 END) as midCount,
                COUNT(CASE WHEN LOWER(exam_type) LIKE '%final%' THEN 1 END) as finalCount
            FROM Exam_Schedule
        `);
        
        const midsUploaded = examTypeCheckResult.recordset[0].midCount > 0;
        const finalsUploaded = examTypeCheckResult.recordset[0].finalCount > 0;

        let typesToExclude = [];
        if (midsUploaded) {
            typesToExclude.push("'mid'", "'mids'", "'mid exam'", "'midterm'", "'midterms'");
        }
        if (finalsUploaded) {
            typesToExclude.push("'final'", "'finals'", "'final exam'", "'final term'");
        }

        const acExamExcludeClause = typesToExclude.length > 0
            ? `AND LOWER(TRIM(AC.event_type)) NOT IN (${typesToExclude.join(',')})`
            : '';

        // ─────────────────────────────────────────────────────────────────────
        // STEP 2: Check which optional columns actually exist (UNCHANGED)
        // ─────────────────────────────────────────────────────────────────────
        const colCheckResult = await pool.request().query(`
            SELECT TABLE_NAME, COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME IN ('Academic_Calendar','Public_Holidays','FYP_Meetings')
              AND COLUMN_NAME IN ('description','agenda_description')
        `);

        const existingCols = {};
        colCheckResult.recordset.forEach(row => {
            if (!existingCols[row.TABLE_NAME]) existingCols[row.TABLE_NAME] = [];
            existingCols[row.TABLE_NAME].push(row.COLUMN_NAME.toLowerCase());
        });

        const acDesc = (existingCols['Academic_Calendar'] || []).includes('description')
            ? `ISNULL(CAST(AC.description AS VARCHAR(MAX)), '')`
            : `NULL`;

        const phDesc = (existingCols['Public_Holidays'] || []).includes('description')
            ? `ISNULL(CAST(PH.description AS VARCHAR(MAX)), '')`
            : `NULL`;

        const hasAgenda = (existingCols['FYP_Meetings'] || []).includes('agenda_description');
        const hasDesc   = (existingCols['FYP_Meetings'] || []).includes('description');
        let mDesc;
        if (hasAgenda && hasDesc) {
            mDesc = `ISNULL(CAST(M.agenda_description AS VARCHAR(MAX)), ISNULL(CAST(M.description AS VARCHAR(MAX)), ''))`;
        } else if (hasAgenda) {
            mDesc = `ISNULL(CAST(M.agenda_description AS VARCHAR(MAX)), '')`;
        } else if (hasDesc) {
            mDesc = `ISNULL(CAST(M.description AS VARCHAR(MAX)), '')`;
        } else {
            mDesc = `NULL`;
        }

        let query = "";

        // ── PART 1: Academic Calendar Events ─────────────────────────────────
        if (isStudent) {
            query = `
                SELECT CAST(AC.event_id AS VARCHAR) as id, AC.event_title as title, AC.event_type as type,
                       CONVERT(VARCHAR, AC.start_date, 23) as start_date, CONVERT(VARCHAR, AC.end_date, 23) as end_date,
                       AC.color_code, AC.event_time as start_time, AC.venue as room_no, NULL as course_code,
                       NULL as seat_no, NULL as row_no, ${acDesc} as description, NULL as roll_no
                FROM Academic_Calendar AC
                LEFT JOIN Societies S ON AC.society_id = S.society_id
                WHERE LOWER(TRIM(AC.visibility)) = 'public' ${acExamExcludeClause}
                UNION
                SELECT CAST(AC.event_id AS VARCHAR) as id, AC.event_title as title, AC.event_type as type,
                       CONVERT(VARCHAR, AC.start_date, 23) as start_date, CONVERT(VARCHAR, AC.end_date, 23) as end_date,
                       AC.color_code, AC.event_time as start_time, AC.venue as room_no, NULL as course_code,
                       NULL as seat_no, NULL as row_no, ${acDesc} as description, NULL as roll_no
                FROM Academic_Calendar AC
                INNER JOIN Societies S ON AC.society_id = S.society_id
                INNER JOIN User_Event_Preferences UEP ON LOWER(TRIM(UEP.event_type)) = LOWER(TRIM(S.society_name))
                WHERE LOWER(TRIM(AC.visibility)) = 'private' AND UEP.user_id = @studentId ${acExamExcludeClause}`;
        } else {
            query = `SELECT CAST(AC.event_id AS VARCHAR) as id, AC.event_title as title, AC.event_type as type,
                            CONVERT(VARCHAR, AC.start_date, 23) as start_date, CONVERT(VARCHAR, AC.end_date, 23) as end_date,
                            AC.color_code, AC.event_time as start_time, AC.venue as room_no, NULL as course_code,
                            NULL as seat_no, NULL as row_no, ${acDesc} as description, NULL as roll_no
                     FROM Academic_Calendar AC WHERE 1=1 ${acExamExcludeClause}`;
        }

        // ── PART 2: Public Holidays ───────────────────────────────────────────
        query += ` UNION ALL SELECT CAST(PH.holiday_id AS VARCHAR) as id, PH.holiday_name as title, 'holiday' as type,
                   CONVERT(VARCHAR, PH.start_date, 23) as start_date, CONVERT(VARCHAR, PH.end_date, 23) as end_date,
                   '#87CEEB' as color_code, NULL as start_time, NULL as room_no, NULL as course_code, NULL as seat_no,
                   NULL as row_no, ${phDesc} as description, NULL as roll_no FROM Public_Holidays PH`;

        // ── PART 3: FYP Meetings ──────────────────────────────────────────────
        if (isStudent) {
            query += ` UNION ALL SELECT CAST(M.meeting_id AS VARCHAR) as id, 'FYP Meeting: ' + M.title as title, 'meeting' as type,
                       CONVERT(VARCHAR, M.meeting_date, 23) as start_date, CONVERT(VARCHAR, M.meeting_date, 23) as end_date,
                       '#FF5733' as color_code, CONVERT(VARCHAR, M.meeting_time, 108) as start_time, M.venue as room_no,
                       NULL as course_code, NULL as seat_no, NULL as row_no, ${mDesc} as description, NULL as roll_no
                FROM FYP_Meetings M WHERE EXISTS (SELECT 1 FROM Notifications N WHERE N.user_id = @studentId AND N.title LIKE '%' + M.title + '%')`;
        } else {
            query += ` UNION ALL SELECT CAST(M.meeting_id AS VARCHAR) as id, 'FYP Meeting: ' + M.title as title, 'meeting' as type,
                       CONVERT(VARCHAR, M.meeting_date, 23) as start_date, CONVERT(VARCHAR, M.meeting_date, 23) as end_date,
                       '#FF5733' as color_code, CONVERT(VARCHAR, M.meeting_time, 108) as start_time, M.venue as room_no,
                       NULL as course_code, NULL as seat_no, NULL as row_no, ${mDesc} as description, NULL as roll_no FROM FYP_Meetings M`;
        }

        // ── PART 4: Exam Schedule ─────────────────────────────────────────────
        const isPrivileged = ['admin','datacell','chairperson','assistant director'].includes(normalizedRole);
        if (isPrivileged) {
            query += ` UNION ALL SELECT CAST(e.exam_id AS VARCHAR) as id, 'Exam: ' + c.course_name as title, 'exam' as type,
                       CONVERT(VARCHAR, e.exam_date, 23) as start_date, CONVERT(VARCHAR, e.exam_date, 23) as end_date,
                       ISNULL(e.color_code, '#dc3545') as color_code, CONVERT(VARCHAR, e.start_time, 108) as start_time,
                       ISNULL(e.room_no, 'TBA') as room_no, c.course_code, NULL as seat_no, NULL as row_no,
                       CAST('' AS VARCHAR(MAX)) as description, NULL as roll_no FROM Exam_Schedule e JOIN Courses c ON e.course_id = c.course_id`;
        } else if (isStudent && resolvedStudentId !== null) {
            query += ` UNION ALL SELECT CAST(e.exam_id AS VARCHAR) as id, 'Exam: ' + c.course_name as title, 'exam' as type,
                       CONVERT(VARCHAR, e.exam_date, 23) as start_date, CONVERT(VARCHAR, e.exam_date, 23) as end_date,
                       ISNULL(e.color_code, '#dc3545') as color_code, CONVERT(VARCHAR, e.start_time, 108) as start_time,
                       ISNULL(e.room_no, 'TBA') as room_no, c.course_code, ISNULL(sp.seat_no, '-') as seat_no, 
                       ISNULL(sp.row_no, '-') as row_no, CAST('' AS VARCHAR(MAX)) as description, @rollNo as roll_no
                FROM Exam_Schedule e JOIN Courses c ON c.course_id = e.course_id JOIN Enrollments en ON en.course_id = e.course_id AND en.student_id = @resolvedStudentId
                LEFT JOIN SeatingPlan sp ON sp.exam_id = e.exam_id AND sp.student_id = @resolvedStudentId AND sp.course_id = e.course_id`;
        }

        const finalSQL = `SELECT * FROM (${query}) AS AllEvents ORDER BY start_date DESC`;
        const request  = pool.request();

        if (isStudent) {
            request.input('studentId', sql.VarChar, studentId);
            if (resolvedStudentId !== null) {
                request.input('resolvedStudentId', sql.Int, resolvedStudentId);
                request.input('rollNo', sql.VarChar, resolvedRollNo || studentId);
            }
        }

        const result  = await request.query(finalSQL);
        let finalData = result.recordset || [];

        // ── Islamic Holidays (UNCHANGED) ──────────────────────────────────────
        try {
            const currentYear = new Date().getFullYear();
            const islamicHolidays = await IslamicController.getIslamicHolidays(pool, currentYear);
            if (Array.isArray(islamicHolidays)) {
                const formatted = islamicHolidays.map(h => ({
                    id: `ih-${h.id || Math.random()}`, title: h.title, type: 'holiday', start_date: h.date || h.start_date, end_date: h.date || h.start_date,
                    color_code: '#87CEEB', start_time: null, room_no: 'N/A', course_code: null, seat_no: null, row_no: null, description: '', roll_no: null
                }));
                finalData = [...finalData, ...formatted];
            }
        } catch (e) { console.error("Holidays error:", e.message); }

        res.status(200).json(finalData);

    } catch (err) {
        console.error("Backend Error:", err.message);
        res.status(500).json({ error: "Fetch failed: " + err.message });
    }
};