// 🚩 Path check: Ensure correct path to your DB config
const { sql } = require('../../config/db');

// 1. GET ALL HOLIDAYS
exports.getAllHolidays = async (req, res) => {
    try {
        const pool = req.app.locals.db;
        if (!pool) throw new Error("Database pool not found in app.locals");

        // ✅ Table name updated to Emergency_Holidays (as per your SQL image)
        const result = await pool.request()
            .query("SELECT * FROM Emergency_Holidays ORDER BY start_date DESC");
        
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
        res.status(500).json({ success: false, message: "Database Error: " + err.message });
    }
};

// 2. ADD NEW HOLIDAY
exports.addHoliday = async (req, res) => {
    try {
        const { reason, start_date, end_date } = req.body;
        const pool = req.app.locals.db;

        if (!reason || !start_date || !end_date) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Table name updated to Emergency_Holidays
        await pool.request()
            .input('reason', sql.NVarChar, reason)
            .input('start', sql.Date, start_date)
            .input('end', sql.Date, end_date)
            .query(`INSERT INTO Emergency_Holidays (reason, start_date, end_date) 
                    VALUES (@reason, @start, @end)`);

        console.log("✅ Holiday Added to DB:", reason);
        res.status(201).json({ success: true, message: "Holiday added successfully! ✅" });
    } catch (err) {
        console.error("❌ Add Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. UPDATE HOLIDAY
exports.updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, start_date, end_date } = req.body;
        const pool = req.app.locals.db;

        if (!id) return res.status(400).json({ success: false, message: "Holiday ID is required" });

        // ✅ Table name updated to Emergency_Holidays
        await pool.request()
            .input('id', sql.Int, id)
            .input('reason', sql.NVarChar, reason)
            .input('start', sql.Date, start_date)
            .input('end', sql.Date, end_date)
            .query(`UPDATE Emergency_Holidays 
                    SET reason = @reason, start_date = @start, end_date = @end 
                    WHERE emergency_id = @id`);

        res.status(200).json({ success: true, message: "Holiday updated successfully! 📝" });
    } catch (err) {
        console.error("❌ Update Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. DELETE HOLIDAY
exports.deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.app.locals.db;

        if (!id) return res.status(400).json({ success: false, message: "Holiday ID is required" });

        // ✅ Table name updated to Emergency_Holidays
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Emergency_Holidays WHERE emergency_id = @id");

        res.status(200).json({ success: true, message: "Holiday deleted! 🗑️" });
    } catch (err) {
        console.error("❌ Delete Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};