const { sql } = require('../../config/db');
const IslamicController = require('../Admin/IslamicHolidaysController');

// 1. GET ALL SOCIETIES
exports.getSocieties = async (req, res) => {
    try {
        const pool = req.app.locals.db;
        const result = await pool.request().query("SELECT * FROM Societies ORDER BY society_name ASC");
        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. SAVE EVENT (Updated with Visibility and Society ID)
exports.saveEvent = async (req, res) => {
    try {
        const { society_id, title, date, description, visibility, time, venue } = req.body;
        const pool = req.app.locals.db;

        // Society ka color fetch karna
        const societyData = await pool.request()
            .input('sId', sql.Int, society_id)
            .query("SELECT assigned_color FROM Societies WHERE society_id = @sId");
        
        const societyColor = societyData.recordset[0]?.assigned_color || '#00796B';

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const eventRequest = new sql.Request(transaction);
            const eventResult = await eventRequest
                .input('title', sql.NVarChar, title)
                .input('type', sql.NVarChar, 'Society Event')
                .input('sDate', sql.Date, date)
                .input('desc', sql.NVarChar, description || null)
                .input('color', sql.NVarChar, societyColor) 
                .input('vis', sql.VarChar, visibility || 'public')
                .input('soc_id', sql.Int, society_id)
                .input('time', sql.VarChar, time || 'TBD')
                .input('venue', sql.VarChar, venue || 'N/A')
                .query(`INSERT INTO Academic_Calendar 
                        (event_title, event_type, start_date, end_date, description, color_code, visibility, society_id, event_time, venue) 
                        OUTPUT INSERTED.event_id 
                        VALUES (@title, @type, @sDate, @sDate, @desc, @color, @vis, @soc_id, @time, @venue)`);
            
            const newEventId = eventResult.recordset[0].event_id;

            // Mapping table Event_Societies mein entry
            const linkRequest = new sql.Request(transaction);
            await linkRequest
                .input('eId', sql.Int, newEventId)
                .input('sId', sql.Int, society_id)
                .query("INSERT INTO Event_Societies (event_id, society_id) VALUES (@eId, @sId)");

            await transaction.commit();
            res.status(201).json({ success: true, message: "Event successfully scheduled! ✅" });
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "SQL Error: " + err.message });
    }
};

// 3. UPDATE EVENT (Updated with Visibility)
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, description, visibility, time, venue } = req.body;
        const pool = req.app.locals.db;

        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('date', sql.Date, date)
            .input('desc', sql.NVarChar, description || null)
            .input('vis', sql.VarChar, visibility || 'public')
            .input('time', sql.VarChar, time || 'TBD')
            .input('venue', sql.VarChar, venue || 'N/A')
            .query(`UPDATE Academic_Calendar 
                    SET event_title = @title, start_date = @date, end_date = @date, 
                        description = @desc, visibility = @vis, event_time = @time, venue = @venue 
                    WHERE event_id = @id`);

        res.status(200).json({ success: true, message: "Event Updated! ✨" });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};

// 4. GET ALL EVENTS (Smart Filtering for Students)
exports.getAllEvents = async (req, res) => {
    try {
        const { studentId, role } = req.query; 
        const pool = req.app.locals.db;
        let request = pool.request();
        let query = "";
        
        if (role === 'student' && studentId && studentId !== 'undefined') {
            request.input('sid', sql.Int, studentId);
            // Logic: 
            // 1. Dikhao agar visibility 'public' hai.
            // 2. Dikhao agar 'private' hai LEKIN student ne us society ko subscribe kiya hua hai.
            query = `SELECT AC.event_id as id, AC.event_title as title, AC.start_date as date, 
                            AC.description, S.society_name, AC.color_code as color, 
                            AC.visibility, AC.event_time as time, AC.venue
                     FROM Academic_Calendar AC 
                     LEFT JOIN Societies S ON AC.society_id = S.society_id
                     WHERE (AC.visibility = 'public') 
                        OR (AC.visibility = 'private' AND S.society_name IN (
                            SELECT event_type FROM User_Event_Preferences WHERE user_id = @sid
                        ))
                     ORDER BY AC.start_date DESC`;
        } else {
            // Admin aur Chairperson ko saare events dikhain
            query = `SELECT AC.event_id as id, AC.event_title as title, AC.start_date as date, 
                            AC.description, S.society_name, AC.color_code as color, 
                            AC.visibility, AC.event_time as time, AC.venue, AC.society_id
                     FROM Academic_Calendar AC 
                     LEFT JOIN Societies S ON AC.society_id = S.society_id
                     ORDER BY AC.start_date DESC`;
        }
        
        const result = await request.query(query);
        let dbEvents = result.recordset;

        // Islamic Holidays Integration
        const currentYear = new Date().getFullYear();
        const islamicHolidays = await IslamicController.getIslamicHolidays(pool, currentYear);

        res.status(200).json([...dbEvents, ...islamicHolidays]);

    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};

// 5. DELETE EVENT
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.app.locals.db;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            await transaction.request().input('id', sql.Int, id).query("DELETE FROM Event_Societies WHERE event_id = @id");
            await transaction.request().input('id', sql.Int, id).query("DELETE FROM Academic_Calendar WHERE event_id = @id");
            await transaction.commit();
            res.status(200).json({ success: true, message: "Event deleted! 🗑️" });
        } catch (innerErr) { 
            await transaction.rollback(); 
            throw innerErr; 
        }
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};

// 6. GET SOCIETIES STATUS
exports.getSocietiesStatus = async (req, res) => {
    try {
        const { studentId } = req.query;
        const pool = req.app.locals.db;
        const allSoc = await pool.request().query("SELECT society_id, society_name FROM Societies ORDER BY society_name ASC");
        const mySubs = await pool.request().input('uid', sql.Int, studentId).query("SELECT event_type FROM User_Event_Preferences WHERE user_id = @uid");
        res.status(200).json({ allSocieties: allSoc.recordset, subscribedNames: mySubs.recordset.map(row => row.event_type) });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};

// 7. SUBSCRIPTION / UNSUBSCRIPTION
exports.subscribeSociety = async (req, res) => {
    try {
        const { student_id, society_name } = req.body;
        const pool = req.app.locals.db;
        await pool.request().input('uid', sql.Int, student_id).input('etype', sql.NVarChar, society_name).query("INSERT INTO User_Event_Preferences (user_id, event_type) VALUES (@uid, @etype)");
        res.status(201).json({ success: true, message: "Subscribed! ✅" });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};

exports.unsubscribeSociety = async (req, res) => {
    try {
        const { student_id, society_name } = req.body;
        const pool = req.app.locals.db;
        await pool.request().input('uid', sql.Int, student_id).input('etype', sql.NVarChar, society_name).query("DELETE FROM User_Event_Preferences WHERE user_id = @uid AND event_type = @etype");
        res.status(200).json({ success: true, message: "Unsubscribed! 🗑️" });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};

// 8. LOCK SOCIETY COLOR
exports.lockSocietyColor = async (req, res) => {
    try {
        const { societyId, colorCode } = req.body;
        const pool = req.app.locals.db;

        const check = await pool.request()
            .input('color', sql.NVarChar, colorCode)
            .query("SELECT society_name FROM Societies WHERE assigned_color = @color");

        if (check.recordset.length > 0) {
            return res.status(400).json({ success: false, message: `Taken by ${check.recordset[0].society_name}` });
        }

        await pool.request()
            .input('sid', sql.Int, societyId)
            .input('color', sql.NVarChar, colorCode)
            .query("UPDATE Societies SET assigned_color = @color WHERE society_id = @sid");

        res.status(200).json({ success: true, message: "Color locked! ✨" });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};