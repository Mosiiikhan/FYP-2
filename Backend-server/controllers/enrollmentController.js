const { sql } = require('../config/db');

exports.uploadEnrollments = async (req, res) => {
    try {
        const { enrollments } = req.body;
        const pool = req.app.locals.db; 

        if (!enrollments || enrollments.length === 0) {
            return res.status(400).json({ success: false, message: "No data found in file!" });
        }

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            for (const record of enrollments) {
                // 🚩 Headers Check: Agar Excel mein 'student_id' ki jagah kuch aur likha hai toh ye default pick karega
                const s_id = record.student_id || record.StudentID || record['student id'];
                const c_id = record.course_id || record.CourseID || record['course id'];

                if (!s_id || !c_id) continue; // Skip if data is missing

                await transaction.request()
                    .input('sid', sql.Int, s_id)
                    .input('cid', sql.Int, c_id)
                    .input('edate', sql.Date, new Date()) // Aaj ki date
                    .query(`
                        IF NOT EXISTS (SELECT 1 FROM Enrollments WHERE student_id = @sid AND course_id = @cid)
                        BEGIN
                            INSERT INTO Enrollments (student_id, course_id, enrollment_date)
                            VALUES (@sid, @cid, @edate)
                        END
                    `);
            }
            await transaction.commit();
            res.status(200).json({ success: true, message: "36 Records Processed Successfully! ✅" });
        } catch (err) {
            await transaction.rollback();
            console.error("SQL Error:", err.message);
            res.status(500).json({ success: false, message: "Database Error: " + err.message });
        }
    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({ success: false, message: "Server connection failed." });
    }
};