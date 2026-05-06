const { sql } = require('../config/db');

// --- 1. THE TRIGGER: Notification Create Karna (Optimized) ---
exports.createNotification = async (pool, { senderRole, targetType, targetValue, title, message }) => {
    try {
        let query = "";
        const request = pool.request();
        request.input('nTitle', sql.NVarChar, title);
        request.input('nMsg', sql.NVarChar, message);
        request.input('nType', sql.NVarChar, senderRole);

        // CASE 1: Admin/DataCell (Bulk Insert for all Students)
        if (targetType === 'all') {
            query = `INSERT INTO Notifications (user_id, title, message, notification_type, is_read)
                     SELECT user_id, @nTitle, @nMsg, @nType, 0 
                     FROM Users WHERE role = 'Student'`;
        } 
        
        // CASE 2: Assistant Director (Semester Based)
        else if (targetType === 'semester') {
            request.input('sem', sql.VarChar, targetValue);
            query = `INSERT INTO Notifications (user_id, title, message, notification_type, is_read)
                     SELECT user_id, @nTitle, @nMsg, @nType, 0 
                     FROM Students WHERE semester = @sem`;
        }

        // CASE 3: Society (Subscriber Based)
        else if (targetType === 'society') {
            request.input('sName', sql.NVarChar, targetValue);
            query = `INSERT INTO Notifications (user_id, title, message, notification_type, is_read)
                     SELECT user_id, @nTitle, @nMsg, @nType, 0 
                     FROM User_Event_Preferences WHERE event_type = @sName`;
        }

        if (query) {
            await request.query(query);
        }
        
        return true;
    } catch (err) {
        console.error("❌ Universal Notification Error:", err.message);
        return false;
    }
};

// --- 2. THE APIs: Student Side ---

// A. Unread Count Fetch Karna
exports.getUnreadCount = async (req, res) => {
    try {
        const { studentId } = req.query; // Query param name change to match frontend
        const pool = req.app.locals.db;
        const result = await pool.request()
            .input('uid', sql.Int, studentId)
            .query("SELECT COUNT(*) as count FROM Notifications WHERE user_id = @uid AND is_read = 0");
        
        res.json({ success: true, count: result.recordset[0].count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// B. Notification List Fetch Karna
exports.getStudentNotifications = async (req, res) => {
    try {
        const { studentId } = req.query;
        const pool = req.app.locals.db;
        const result = await pool.request()
            .input('uid', sql.Int, studentId)
            .query("SELECT * FROM Notifications WHERE user_id = @uid ORDER BY created_at DESC");
        
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// C. Mark Single Notification as Read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const pool = req.app.locals.db;
        
        await pool.request()
            .input('nid', sql.Int, notificationId)
            .query("UPDATE Notifications SET is_read = 1 WHERE notification_id = @nid");
        
        res.json({ success: true, message: "Marked as read! ✅" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// D. Mark All Read
exports.markAllRead = async (req, res) => {
    try {
        const { studentId } = req.body;
        const pool = req.app.locals.db;
        
        await pool.request()
            .input('uid', sql.Int, studentId)
            .query("UPDATE Notifications SET is_read = 1 WHERE user_id = @uid");
        
        res.json({ success: true, message: "All marked as read! ✅" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};