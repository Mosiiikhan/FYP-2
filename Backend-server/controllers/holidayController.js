const { sql } = require('../config/db'); 

// --- Helper Function: Har tarah ke format ko SQL friendly (YYYY-MM-DD) mein badalne ke liye ---
const formatToSQLDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Agar date mein '/' hai (e.g. 25/12/2026)
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }
    
    // Agar date mein '-' hai (e.g. 25-12-2026 ya 2026-12-25)
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        // Agar pehle se YYYY-MM-DD hai toh waise hi rehne do
        if (parts[0].length === 4) return dateStr;
        // Agar DD-MM-YYYY hai
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    return dateStr; 
};

// 1. Dropdown List Fetch Karne Ke Liye
exports.getDefinitions = async (req, res) => {
    try {
        const pool = req.app.locals.db; 
        if (!pool) return res.status(500).json({ error: "DB Pool not found" });

        const result = await pool.request().query("SELECT * FROM Holiday_Definitions ORDER BY holiday_name ASC");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("Error in getDefinitions:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 2. Main List Fetch Karne Ke Liye
exports.getHolidays = async (req, res) => {
    try {
        const pool = req.app.locals.db;
        const result = await pool.request().query("SELECT * FROM Public_Holidays ORDER BY start_date DESC");
        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Holiday Save Karne Ke Liye
exports.saveHoliday = async (req, res) => {
    const { definition_id, holiday_name, holiday_type, start_date, end_date, description } = req.body;
    const pool = req.app.locals.db;

    if (!pool) return res.status(500).json({ success: false, error: "Database connection failed" });

    // 🟢 Dates ko sahi format mein convert kar rha hai
    const formattedStart = formatToSQLDate(start_date);
    const formattedEnd = formatToSQLDate(end_date);
    
    // Validation: Agar formatting ke baad bhi date invalid hai toh SQL ko na bhejo
    if (!formattedStart || isNaN(new Date(formattedStart).getTime())) {
        return res.status(400).json({ success: false, error: "Invalid Start Date format. Please use YYYY-MM-DD or DD/MM/YYYY" });
    }

    const year = new Date(formattedStart).getFullYear();

    let transaction;
    try {
        transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = new sql.Request(transaction);

        // 1. Insert into Public_Holidays
        // 🚩 Ab dbType ki mapping hata di hai kyunke humne DB update kar liya hai
        await request
            .input('name', sql.NVarChar, holiday_name)
            .input('type', sql.NVarChar, holiday_type) 
            .input('start', sql.Date, formattedStart)
            .input('end', sql.Date, formattedEnd)
            .input('desc', sql.NVarChar, description || 'Official Holiday')
            .query(`INSERT INTO Public_Holidays (holiday_name, holiday_type, start_date, end_date, description) 
                    VALUES (@name, @type, @start, @end, @desc)`);

        // 2. Insert into Holiday_Occurrences
        if (definition_id && definition_id !== '' && definition_id !== 'undefined') {
            const occRequest = new sql.Request(transaction); // Naya request for reliability
            await occRequest
                .input('def_id', sql.Int, parseInt(definition_id))
                .input('occ_year', sql.Int, year)
                .input('g_date', sql.Date, formattedStart)
                .input('notes', sql.NVarChar, description || 'Manual Entry')
                .query(`INSERT INTO Holiday_Occurrences (definition_id, gregorian_date, year, notes) 
                        VALUES (@def_id, @g_date, @occ_year, @notes)`);
        }

        await transaction.commit();
        res.status(201).json({ success: true, message: "Holiday Saved Successfully! ✅" });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("SQL Error during Save Holiday:", err.message); 
        res.status(500).json({ success: false, error: "Database Error: " + err.message });
    }
};