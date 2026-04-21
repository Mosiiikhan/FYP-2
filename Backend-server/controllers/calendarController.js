const { connectDB, sql } = require('../config/db');

// 1. Admin Side: Semester Timeline Save Karne Ke Liye
exports.manageSemester = async (req, res) => {
    try {
        const { events } = req.body;
        const pool = await connectDB();
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
                            (event_title, event_type, start_date, end_date, color_code) 
                            VALUES (@title, @type, @start, @end, @color)`);
            }
            await transaction.commit();
            res.status(200).json({ success: true, message: "Semester Timeline Updated Successfully! ✅" });
        } catch (err) {
            await transaction.rollback();
            res.status(500).json({ success: false, message: "Database Error during saving." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Connection Error." });
    }
};

// 🟢 Manage Holidays Dropdown ke liye Definitions fetch karna
exports.getDefinitions = async (req, res) => {
    try {
        const pool = req.app.locals.db; 
        if (!pool) {
            return res.status(500).json({ error: "Database Connection Pool not found." });
        }
        const result = await pool.request().query("SELECT * FROM Holiday_Definitions ORDER BY holiday_name ASC");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ Definitions Fetch Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 2. 🟢 ORIGINAL: Role-based Events Fetching
exports.getAllEvents = async (req, res) => {
    try {
        // ✅ StudentId aur Role dono query se le rahe hain
        const { studentId, role } = req.query; 
        const pool = req.app.locals.db;
        
        let query = `
            SELECT 
                CAST(event_id AS VARCHAR) as id, 
                event_title as title, 
                event_type as type, 
                CONVERT(VARCHAR, start_date, 23) as start_date, 
                CONVERT(VARCHAR, end_date, 23) as end_date, 
                color_code,
                NULL as start_time, 
                NULL as room_no
            FROM Academic_Calendar
            
            UNION ALL
            
            SELECT 
                CAST(holiday_id AS VARCHAR) as id, 
                holiday_name as title, 
                'holiday' as type, 
                CONVERT(VARCHAR, start_date, 23) as start_date, 
                CONVERT(VARCHAR, end_date, 23) as end_date, 
                '#87CEEB' as color_code,
                NULL as start_time,
                NULL as room_no
            FROM Public_Holidays
            
            UNION ALL `;

        // ✅ LOGIC: Agar Admin, Datacell ya Chairperson hai to Enrollments ka join nahi lagega (All Exams)
        if (role === 'admin' || role === 'datacell' || role === 'chairperson') {
            query += `
                SELECT 
                    CAST(e.exam_id AS VARCHAR) as id, 
                    'Exam: ' + c.course_name as title, 
                    'exam' as type, 
                    CONVERT(VARCHAR, e.exam_date, 23) as start_date, 
                    CONVERT(VARCHAR, e.exam_date, 23) as end_date, 
                    ISNULL(e.color_code, '#dc3545') as color_code,
                    CAST(e.start_time AS VARCHAR) as start_time, 
                    e.room_no
                FROM Exam_Schedule e
                JOIN Courses c ON e.course_id = c.course_id`;
        } 
        // ✅ LOGIC: Agar Student hai to Enrollments table se filter ho kar sirf uske exams ayenge
        else if (studentId) {
            query += `
                SELECT 
                    CAST(e.exam_id AS VARCHAR) as id, 
                    'Exam: ' + c.course_name as title, 
                    'exam' as type, 
                    CONVERT(VARCHAR, e.exam_date, 23) as start_date, 
                    CONVERT(VARCHAR, e.exam_date, 23) as end_date, 
                    ISNULL(e.color_code, '#dc3545') as color_code,
                    CAST(e.start_time AS VARCHAR) as start_time, 
                    e.room_no
                FROM Exam_Schedule e
                JOIN Courses c ON e.course_id = c.course_id
                JOIN Enrollments en ON e.course_id = en.course_id
                WHERE en.student_id = @studentId`;
        } 
        else {
            // Safe fallback if neither role nor studentId is provided
            query += `
                SELECT 
                    CAST(exam_id AS VARCHAR) as id, 
                    'Exam: ' + CAST(course_id AS VARCHAR) as title, 
                    'exam' as type, 
                    CONVERT(VARCHAR, exam_date, 23) as start_date, 
                    CONVERT(VARCHAR, exam_date, 23) as end_date, 
                    ISNULL(color_code, '#dc3545') as color_code,
                    CAST(start_time AS VARCHAR) as start_time,
                    room_no
                FROM Exam_Schedule`;
        }

        const request = pool.request();
        if (studentId) request.input('studentId', sql.Int, studentId);

        const result = await request.query(query);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ error: "Fetch failed: " + err.message });
    }
};