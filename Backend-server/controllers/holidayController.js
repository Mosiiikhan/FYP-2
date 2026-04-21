const { sql } = require('../config/db'); 

// 1. Dropdown List Fetch Karne Ke Liye
exports.getDefinitions = async (req, res) => {
    try {
        const pool = req.app.locals.db; 
        if (!pool) return res.status(500).json({ error: "DB Pool not found" });

        const result = await pool.request().query("SELECT * FROM Holiday_Definitions ORDER BY holiday_name ASC");
        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Holiday Save Karne Ke Liye
exports.saveHoliday = async (req, res) => {
    const { definition_id, holiday_name, holiday_type, start_date, end_date, description } = req.body;
    const pool = req.app.locals.db;
    const year = new Date(start_date).getFullYear();

    let transaction;
    try {
        transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = new sql.Request(transaction);

        await request
            .input('name', sql.VarChar, holiday_name)
            .input('type', sql.VarChar, holiday_type)
            .input('start', sql.Date, start_date)
            .input('end', sql.Date, end_date)
            .input('desc', sql.Text, description || 'Official Holiday')
            .query(`INSERT INTO Public_Holidays (holiday_name, holiday_type, start_date, end_date, description) 
                    VALUES (@name, @type, @start, @end, @desc)`);

        if (definition_id && definition_id !== '') {
            await request
                .input('def_id', sql.Int, definition_id)
                .input('year', sql.Int, year)
                .input('g_date', sql.Date, start_date)
                .query(`INSERT INTO Holiday_Occurrences (definition_id, gregorian_date, year) 
                        VALUES (@def_id, @g_date, @year)`);
        }

        await transaction.commit();
        res.status(201).json({ success: true, message: "Holiday Saved Successfully! ✅" });
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ success: false, error: err.message });
    }
};