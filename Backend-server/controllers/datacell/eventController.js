const { sql } = require('../../config/db');
// IslamicController import removed as it's now in CalendarController

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

// 2. SAVE EVENT
exports.saveEvent = async (req, res) => {
    try {
        const { society_id, title, date, description, visibility, time, venue } = req.body;
        const pool = req.app.locals.db;

        const societyData = await pool.request()
            .input('sId', sql.Int, society_id)
            .query("SELECT assigned_color, society_name FROM Societies WHERE society_id = @sId");
        
        const societyColor = societyData.recordset[0]?.assigned_color || '#00796B';
        const societyName = societyData.recordset[0]?.society_name || 'Society';

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const eventRequest = new sql.Request(transaction);
            await eventRequest
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
                        VALUES (@title, @type, @sDate, @sDate, @desc, @color, @vis, @soc_id, @time, @venue)`);
            
            const notifRequest = new sql.Request(transaction);
            const notifTitle = `New Event: ${title}`; 
            const notifMsg = `New ${visibility} event: ${title} by ${societyName}`;
            const nType = visibility === 'public' ? 'Public' : 'Society';

            if (visibility === 'public') {
                await notifRequest.query(`
                    INSERT INTO Notifications (user_id, title, message, notification_type, is_read, created_at)
                    SELECT user_id, '${notifTitle}', '${notifMsg}', '${nType}', 0, GETDATE() 
                    FROM Users WHERE role = 'student'
                `);
            } else {
                await notifRequest.query(`
                    INSERT INTO Notifications (user_id, title, message, notification_type, is_read, created_at)
                    SELECT user_id, '${notifTitle}', '${notifMsg}', '${nType}', 0, GETDATE() 
                    FROM User_Event_Preferences 
                    WHERE event_type = '${societyName}'
                `);
            }

            await transaction.commit();
            res.status(201).json({ success: true, message: "Event scheduled and notifications sent! ✅" });
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "SQL Error: " + err.message });
    }
};

// 3. UPDATE EVENT
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
            .query(`UPDATE Academic_Calendar SET event_title=@title, start_date=@date, end_date=@date, description=@desc, visibility=@vis, event_time=@time, venue=@venue WHERE event_id=@id`);
        res.status(200).json({ success: true, message: "Event Updated! ✨" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 4. GET ALL EVENTS (Subscription Logic Only)
exports.getAllEvents = async (req, res) => {
    try {
        const { studentId, role } = req.query; 
        const pool = req.app.locals.db;
        let request = pool.request();
        
        const normalizedRole = role ? role.toString().toLowerCase().trim() : '';
        const isStudent = (normalizedRole === 'student' && studentId && studentId !== 'undefined' && studentId !== 'null');

        let query = "";
        if (isStudent) {
            request.input('sid', sql.Int, parseInt(studentId));
            
            query = `SELECT AC.event_id as id, AC.event_title as title, AC.start_date as date, 
                            AC.description, S.society_name, AC.color_code as color, 
                            AC.visibility, AC.event_time as time, AC.venue
                     FROM Academic_Calendar AC 
                     LEFT JOIN Societies S ON AC.society_id = S.society_id
                     WHERE (LOWER(TRIM(AC.visibility)) = 'public') 
                        OR (
                            LOWER(TRIM(AC.visibility)) = 'private' 
                            AND EXISTS (
                                SELECT 1 FROM User_Event_Preferences UEP 
                                WHERE UEP.user_id = @sid 
                                AND LOWER(TRIM(UEP.event_type)) = LOWER(TRIM(S.society_name))
                            )
                        )
                     ORDER BY AC.start_date DESC`;
        } else {
            query = `SELECT AC.event_id as id, AC.event_title as title, AC.start_date as date, 
                            AC.description, S.society_name, AC.color_code as color, 
                            AC.visibility, AC.event_time as time, AC.venue, AC.society_id
                     FROM Academic_Calendar AC 
                     LEFT JOIN Societies S ON AC.society_id = S.society_id
                     ORDER BY AC.start_date DESC`;
        }
        
        const result = await request.query(query);
        let dbEvents = result.recordset || [];

        // Note: Islamic Holidays are now handled by CalendarController
        res.status(200).json(dbEvents);

    } catch (err) { 
        res.status(500).json({ success: false, message: "Server Error: " + err.message }); 
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
            const request = new sql.Request(transaction);
            request.input('id', sql.Int, id);
            await request.query("DELETE FROM Event_Societies WHERE event_id = @id");
            await request.query("DELETE FROM Academic_Calendar WHERE event_id = @id");
            await transaction.commit();
            res.status(200).json({ success: true, message: "Event deleted! 🗑️" });
        } catch (innerErr) { await transaction.rollback(); throw innerErr; }
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 6. GET SOCIETIES STATUS
exports.getSocietiesStatus = async (req, res) => {
    try {
        const { studentId } = req.query;
        const pool = req.app.locals.db;
        const allSoc = await pool.request().query("SELECT society_id, society_name FROM Societies ORDER BY society_name ASC");
        
        let subNames = [];
        if (studentId && studentId !== 'undefined' && studentId !== 'null') {
            const mySubs = await pool.request().input('uid', sql.Int, studentId).query("SELECT event_type FROM User_Event_Preferences WHERE user_id = @uid");
            subNames = mySubs.recordset.map(row => row.event_type);
        }
        res.status(200).json({ allSocieties: allSoc.recordset, subscribedNames: subNames });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 7. SUBSCRIPTION
exports.subscribeSociety = async (req, res) => {
    try {
        const { student_id, society_name } = req.body;
        const pool = req.app.locals.db;
        await pool.request()
            .input('uid', sql.Int, student_id)
            .input('etype', sql.NVarChar, society_name)
            .query("INSERT INTO User_Event_Preferences (user_id, event_type) VALUES (@uid, @etype)");
        res.status(201).json({ success: true, message: "Subscribed! ✅" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 8. UNSUBSCRIPTION
exports.unsubscribeSociety = async (req, res) => {
    try {
        const { student_id, society_name } = req.body;
        const pool = req.app.locals.db;
        await pool.request()
            .input('uid', sql.Int, student_id)
            .input('etype', sql.NVarChar, society_name)
            .query("DELETE FROM User_Event_Preferences WHERE user_id = @uid AND event_type = @etype");
        res.status(200).json({ success: true, message: "Unsubscribed! 🗑️" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 9. LOCK SOCIETY COLOR
exports.lockSocietyColor = async (req, res) => {
    try {
        const { societyId, colorCode } = req.body;
        const pool = req.app.locals.db;
        const check = await pool.request().input('color', sql.NVarChar, colorCode).query("SELECT society_name FROM Societies WHERE assigned_color = @color");
        if (check.recordset.length > 0) return res.status(400).json({ success: false, message: `Taken by ${check.recordset[0].society_name}` });
        await pool.request().input('sid', sql.Int, societyId).input('color', sql.NVarChar, colorCode).query("UPDATE Societies SET assigned_color = @color WHERE society_id = @sid");
        res.status(200).json({ success: true, message: "Color locked! ✨" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};