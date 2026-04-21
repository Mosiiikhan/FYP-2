const { sql } = require('../../config/db');

// 1. GET SOCIETIES (For Dropdown)
exports.getSocieties = async (req, res) => {
    try {
        const pool = req.app.locals.db;
        const result = await pool.request().query("SELECT * FROM Societies ORDER BY society_name ASC");
        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. SAVE EVENT (Linking Academic_Calendar & Event_Societies)
exports.saveEvent = async (req, res) => {
    try {
        const { society_id, title, date, description } = req.body;
        const pool = req.app.locals.db;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const eventRequest = new sql.Request(transaction);
            const eventResult = await eventRequest
                .input('title', sql.NVarChar, title)
                .input('type', sql.NVarChar, 'Society Event')
                .input('sDate', sql.Date, date)
                .input('desc', sql.NVarChar, description || null)
                .input('color', sql.NVarChar, '#e810b2') 
                .query(`INSERT INTO Academic_Calendar (event_title, event_type, start_date, end_date, description, color_code) 
                        OUTPUT INSERTED.event_id 
                        VALUES (@title, @type, @sDate, @sDate, @desc, @color)`);

            const newEventId = eventResult.recordset[0].event_id;

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
        console.error("❌ Save Error:", err.message);
        res.status(500).json({ success: false, message: "SQL Error: " + err.message });
    }
};

// 3. GET ALL (FINAL FIX: Fixed Role-Based Filtering)
exports.getAllEvents = async (req, res) => {
    try {
        // Frontend se Role pakarna (Jo tumhari image mein 'admin' aa raha hai)
        const { studentId, role } = req.query; 
        const pool = req.app.locals.db;
        let request = pool.request();
        let query = "";

        // DEBUGGING: Ye line VS Code Terminal mein check karna refresh ke baad
        console.log(`Backend Hit! ID: ${studentId}, Role: ${role}`);

        // ✅ LOGIC: Sirf tab filter karo jab role 'student' ho.
        // Agar role 'admin', 'chairperson', ya 'datacell' hai, to 'else' wala part chalega.
        if (role === 'student' && studentId && studentId !== 'undefined') {
            request.input('sid', sql.Int, studentId);
            query = `
                SELECT AC.event_id as id, AC.event_title as title, AC.start_date as date, 
                       AC.description, S.society_name
                FROM Academic_Calendar AC
                JOIN Event_Societies ES ON AC.event_id = ES.event_id
                JOIN Societies S ON ES.society_id = S.society_id
                JOIN User_Event_Preferences UEP ON S.society_name = UEP.event_type
                WHERE AC.event_type = 'Society Event'
                AND UEP.user_id = @sid
                ORDER BY AC.start_date DESC
            `;
        } else {
            // ✅ ADMIN VIEW: Sab kuch dikhao baghair kisi filter ke
            query = `
                SELECT AC.event_id as id, AC.event_title as title, AC.start_date as date, 
                       AC.description, S.society_name
                FROM Academic_Calendar AC
                JOIN Event_Societies ES ON AC.event_id = ES.event_id
                JOIN Societies S ON ES.society_id = S.society_id
                WHERE AC.event_type = 'Society Event'
                ORDER BY AC.start_date DESC
            `;
        }

        const result = await request.query(query);
        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. DELETE EVENT 
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.app.locals.db;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await transaction.request()
                .input('id', sql.Int, id)
                .query("DELETE FROM Event_Societies WHERE event_id = @id");

            await transaction.request()
                .input('id', sql.Int, id)
                .query("DELETE FROM Academic_Calendar WHERE event_id = @id");

            await transaction.commit();
            res.status(200).json({ success: true, message: "Event deleted successfully! 🗑️" });
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }
    } catch (err) {
        console.error("❌ Delete Error:", err.message);
        res.status(500).json({ success: false, message: "Delete Error: " + err.message });
    }
};

// 5. GET SOCIETIES STATUS 
exports.getSocietiesStatus = async (req, res) => {
    try {
        const { studentId } = req.query;
        const pool = req.app.locals.db;
        const allSoc = await pool.request().query("SELECT society_id, society_name FROM Societies ORDER BY society_name ASC");
        const mySubs = await pool.request()
            .input('uid', sql.Int, studentId)
            .query("SELECT event_type FROM User_Event_Preferences WHERE user_id = @uid");

        res.status(200).json({
            allSocieties: allSoc.recordset,
            subscribedNames: mySubs.recordset.map(row => row.event_type)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 6. SUBSCRIBE 
exports.subscribeSociety = async (req, res) => {
    try {
        const { student_id, society_name } = req.body;
        const pool = req.app.locals.db;
        await pool.request()
            .input('uid', sql.Int, student_id)
            .input('etype', sql.NVarChar, society_name)
            .query("INSERT INTO User_Event_Preferences (user_id, event_type) VALUES (@uid, @etype)");
        res.status(201).json({ success: true, message: "Subscribed successfully! ✅" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 7. UNSUBSCRIBE 
exports.unsubscribeSociety = async (req, res) => {
    try {
        const { student_id, society_name } = req.body;
        const pool = req.app.locals.db;
        await pool.request()
            .input('uid', sql.Int, student_id)
            .input('etype', sql.NVarChar, society_name)
            .query("DELETE FROM User_Event_Preferences WHERE user_id = @uid AND event_type = @etype");
        res.status(200).json({ success: true, message: "Unsubscribed successfully! 🗑️" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};