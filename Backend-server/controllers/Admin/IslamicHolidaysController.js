const moment = require('moment-hijri');
const { sql } = require('../../config/db');

// --- 1. Helper: Database se current offset Read karna ---
const getHijriOffsetFromDB = async (pool) => {
    try {
        const result = await pool.request()
            .query("SELECT setting_value FROM AutoAdjust_IslamicHolidays WHERE setting_key = 'hijri_offset'");
        // Result safe handling
        return (result.recordset && result.recordset.length > 0) ? result.recordset[0].setting_value : 0;
    } catch (err) {
        console.error("Error fetching offset from DB:", err);
        return 0; 
    }
};

// --- 2. Route Handler: Frontend ko current offset bhejna ---
exports.getIslamicOffset = async (req, res) => {
    try {
        const pool = req.app.locals.db;
        const offset = await getHijriOffsetFromDB(pool);
        res.status(200).json({ success: true, offset: offset });
    } catch (err) {
        res.status(500).json({ success: false, message: "Fetch Error: " + err.message });
    }
};

// --- 3. Main Logic: Islamic Holidays Generate karna ---
exports.getIslamicHolidays = async (pool, year) => {
    const autoHolidays = [];
    const hijriOffset = await getHijriOffsetFromDB(pool);

    // Poore saal ke har din ko check karna (Performance optimized loop)
    for (let m = 0; m < 12; m++) {
        let daysInMonth = new Date(year, m + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            let dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            
            let mDate = moment(dateStr, 'YYYY-MM-DD').add(hijriOffset, 'days');
            let iMonth = mDate.iMonth() + 1; 
            let iDay = mDate.iDate();

            let holidayTitle = "";

            // Eid-ul-Fitr (1st Shawwal - 3 Days)
            if (iMonth === 10 && (iDay === 1 || iDay === 2 || iDay === 3)) {
                holidayTitle = "Eid-ul-Fitr Holiday";
            }
            // Eid-ul-Adha (10th Zil-Hajj - 3 Days)
            else if (iMonth === 12 && (iDay === 10 || iDay === 11 || iDay === 12)) {
                holidayTitle = "Eid-ul-Adha Holiday";
            }
            // Ashura (9, 10 Muharram)
            else if (iMonth === 1 && (iDay === 9 || iDay === 10)) {
                holidayTitle = "Ashura Holiday";
            }
            // Eid Milad-un-Nabi (12 Rabi-ul-Awwal)
            else if (iMonth === 3 && iDay === 12) {
                holidayTitle = "Eid Milad-un-Nabi";
            }

            if (holidayTitle) {
                autoHolidays.push({ 
                    id: `ih-${dateStr}`, 
                    title: holidayTitle, 
                    // Frontend compatibility ke liye 'date' aur 'start_date' dono bhej rahe hain
                    date: dateStr, 
                    start_date: dateStr, 
                    end_date: dateStr,
                    type: 'holiday', 
                    color: '#87CEEB', 
                    description: "Islamic Religious Holiday" 
                });
            }
        }
    }
    return autoHolidays;
};

// --- 4. Admin Action: Offset Update karna ---
exports.updateIslamicOffset = async (req, res) => {
    try {
        const rawValue = req.body.offsetValue !== undefined ? req.body.offsetValue : req.body.offset;
        
        if (rawValue === undefined) {
            return res.status(400).json({ success: false, message: "No offset value provided" });
        }

        const pool = req.app.locals.db;
        const numericVal = parseInt(rawValue);

        await pool.request()
            .input('val', sql.Int, numericVal)
            .query("UPDATE AutoAdjust_IslamicHolidays SET setting_value = @val WHERE setting_key = 'hijri_offset'");
        
        res.status(200).json({ success: true, message: "Islamic Calendar Adjustment Updated! 🌙" });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ success: false, message: "Adjustment Error: " + err.message });
    }
};