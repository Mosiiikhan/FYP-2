const sql = require('mssql');
const xlsx = require('xlsx'); 
const fs = require('fs');     

exports.uploadDatesheet = async (req, res) => {
    try {
        const pool = req.app.locals.db;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded!" });
        }

        // 🟢 FIXED: cellDates: true lagaya taake Excel ki dates sahi milen
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (data.length === 0) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: "Excel sheet is empty!" });
        }

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            for (let row of data) {
                // 🟢 FIXED: Check both snake_case (Excel) and PascalCase (Code)
                const courseId = row.course_id || row.CourseID;
                const examDate = row.exam_date || row.Date;
                const examType = row.exam_type || row.ExamType || 'Final-Term';
                const startTime = row.start_time || row.StartTime || null;
                const endTime = row.end_time || row.EndTime || null;
                const roomNo = row.room_no || row.RoomNo || 'N/A';

                // Agar essential data missing hai toh error throw karein
                if (!courseId || !examDate) {
                    throw new Error(`Missing data in row: ${JSON.stringify(row)}. Make sure headers match Excel.`);
                }

                await transaction.request()
                    .input('course_id', sql.Int, courseId)
                    .input('type', sql.VarChar, examType)
                    .input('date', sql.Date, examDate)
                    .input('start', sql.Time, startTime)
                    .input('end', sql.Time, endTime)
                    .input('room', sql.VarChar, roomNo)
                    .input('color', sql.VarChar, '#dc3545')
                    .query(`INSERT INTO Exam_Schedule 
                            (course_id, exam_type, exam_date, start_time, end_time, room_no, color_code) 
                            VALUES (@course_id, @type, @date, @start, @end, @room, @color)`);
            }

            await transaction.commit();
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); 

            res.status(200).json({ success: true, message: "Datesheet Imported Successfully! ✅" });
        } catch (err) {
            await transaction.rollback();
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            console.error("Database Transaction Error:", err.message);
            return res.status(500).json({ success: false, message: "Database Error: " + err.message });
        }
    } catch (err) {
        console.error("Main Controller Error:", err.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: "Server Error: " + err.message });
    }
};