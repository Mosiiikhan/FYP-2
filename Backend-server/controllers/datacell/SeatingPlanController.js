const multer = require('multer');
const xlsx = require('xlsx');
const { sql, getPool } = require('../../config/db');

// 📌 File upload (memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

/* =========================
   🧹 CLEAN HELPERS
========================= */
const cleanInt = (val) => {
  if (val === undefined || val === null) return null;
  const num = parseInt(val);
  return isNaN(num) ? null : num;
};

const cleanString = (val) => {
  if (val === undefined || val === null) return null;
  return String(val).trim();
};

/* =========================
   📥 UPLOAD SEATING PLAN
========================= */
const uploadSeatingPlan = async (req, res) => {
  try {
    // ✅ GET DATABASE POOL HERE - at the beginning of function
    const pool = getPool();

    console.log("Upload request received");
    console.log("File:", req.file ? req.file.originalname : "No file");

    if (!req.file) {
      return res.status(400).json({ success: false, message: "File missing" });
    }

    // 📊 Read Excel from buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`Excel rows found: ${data.length}`);

    if (!data.length) {
      return res.status(400).json({ success: false, message: "Excel file is empty" });
    }

    let inserted = 0;
    let skipped = 0;

    // 🔁 Insert row by row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      const exam_id = cleanInt(row.exam_id);
      const course_id = cleanInt(row.course_id);
      const student_id = cleanInt(row.student_id);
      const row_no = cleanString(row.row_no);
      const seat_no = cleanString(row.seat_no);

      console.log(`Row ${i + 1}: exam_id=${exam_id}, course_id=${course_id}, student_id=${student_id}`);

      if (!exam_id || !course_id || !student_id) {
        console.log(`Row ${i + 1}: Skipping - missing required fields`);
        skipped++;
        continue;
      }

      try {
        await pool.request()
          .input("exam_id", sql.Int, exam_id)
          .input("student_id", sql.Int, student_id)
          .input("course_id", sql.Int, course_id)
          .input("row_no", sql.VarChar, row_no || "N/A")
          .input("seat_no", sql.VarChar, seat_no || "N/A")
          .query(`
            INSERT INTO SeatingPlan
            (exam_id, student_id, course_id, row_no, seat_no)
            VALUES
            (@exam_id, @student_id, @course_id, @row_no, @seat_no)
          `);

        inserted++;
        console.log(`Row ${i + 1}: Inserted successfully`);

      } catch (err) {
        console.log(`Row ${i + 1}: Insert error -`, err.message);
        skipped++;
      }
    }

    console.log(`Upload complete - Inserted: ${inserted}, Skipped: ${skipped}`);

    return res.json({
      success: true,
      message: "Seating Plan uploaded successfully",
      inserted: inserted,
      skipped: skipped
    });

  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

/* =========================
   📤 GET SEATING PLAN BY STUDENT
========================= */
const getSeatingPlanByStudent = async (req, res) => {
  try {
    // ✅ GET DATABASE POOL HERE - at the beginning of function
    const pool = getPool();

    const student_id = cleanInt(req.params.student_id);
    
    if (!student_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid student ID is required" 
      });
    }

    const result = await pool.request()
      .input("student_id", sql.Int, student_id)
      .query(`
        SELECT 
          sp.seating_id,
          sp.exam_id,
          sp.course_id,
          sp.row_no,
          sp.seat_no,
          c.course_name,
          c.course_code,
          e.exam_type,
          e.exam_date,
          e.start_time,
          e.end_time,
          e.room_no AS venue
        FROM SeatingPlan sp
        INNER JOIN Courses c ON sp.course_id = c.course_id
        INNER JOIN Exam_Schedule e ON sp.exam_id = e.exam_id
        WHERE sp.student_id = @student_id
        ORDER BY e.exam_date DESC
      `);

    return res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length
    });

  } catch (error) {
    console.log("GET ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 📌 Export
const uploadMiddleware = upload.single("file");

module.exports = {
  uploadMiddleware,
  uploadSeatingPlan,
  getSeatingPlanByStudent
};