const { sql } = require('../../config/db');

// 1. GET ALL SATURDAYS
exports.getAllSaturdays = async (req, res) => {
    try {
        const pool = req.app.locals.db;
        const result = await pool.request()
            .query("SELECT * FROM working_saturdays ORDER BY working_date DESC");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};

// 2. ADD NEW SATURDAY
exports.addSaturday = async (req, res) => {
    try {
        const { working_date, holiday_date, reason } = req.body;
        const pool = req.app.locals.db;

        if (!working_date || !holiday_date || !reason) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        await pool.request()
            .input('wDate', sql.Date, working_date)
            .input('hDate', sql.Date, holiday_date)
            .input('reason', sql.NVarChar, reason)
            .query(`INSERT INTO working_saturdays (working_date, holiday_date, reason) 
                    VALUES (@wDate, @hDate, @reason)`);

        res.status(201).json({ success: true, message: "Saved Successfully! ✅" });
    } catch (err) {
        console.error("❌ Insert Error:", err.message);
        res.status(500).json({ success: false, message: "SQL Error: " + err.message });
    }
};

// 3. DELETE SATURDAY
exports.deleteSaturday = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.app.locals.db;
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM working_saturdays WHERE saturday_id = @id");

        res.status(200).json({ success: true, message: "Deleted! 🗑️" });
    } catch (err) {
        console.error("❌ Delete Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};