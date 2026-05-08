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
        
        // CASE 2: Assistant Director (Semester Based - SAME LOGIC AS CALENDAR)
        else if (targetType === 'semester') {
            let semesterValue = targetValue;
            const numericMatch = String(targetValue).match(/\d+/);
            const numericSemester = numericMatch ? numericMatch[0] : targetValue;
            
            request.input('sem', sql.VarChar, numericSemester);
            // SAME matching logic as calendar controller
            query = `INSERT INTO Notifications (user_id, title, message, notification_type, is_read)
                     SELECT u.user_id, @nTitle, @nMsg, @nType, 0 
                     FROM Users u
                     INNER JOIN Students s ON u.user_id = s.user_id
                     WHERE (
                        CAST(s.semester AS VARCHAR) = @sem
                        OR CAST(s.semester AS VARCHAR) = @sem
                        OR @sem = CAST(s.semester AS VARCHAR) + 'th'
                        OR @sem = 'Semester ' + CAST(s.semester AS VARCHAR)
                        OR CAST(s.semester AS VARCHAR) LIKE '%' + @sem + '%'
                     )`;
        }

        // CASE 3: Society (Subscriber Based)
        else if (targetType === 'society') {
            request.input('sName', sql.NVarChar, targetValue);
            query = `INSERT INTO Notifications (user_id, title, message, notification_type, is_read)
                     SELECT user_id, @nTitle, @nMsg, @nType, 0 
                     FROM User_Event_Preferences WHERE event_type = @sName`;
        }

        if (query) {
            const result = await request.query(query);
            console.log(`✅ Notifications sent: ${result.rowsAffected[0] || 0} recipients`);
            return true;
        }
        
        return false;
    } catch (err) {
        console.error("❌ Universal Notification Error:", err.message);
        return false;
    }
};

// --- 2. CREATE NOTIFICATION FROM CONTROLLER (Wrapper) ---
exports.sendNotification = async (req, res) => {
    try {
        const { senderRole, targetType, targetValue, title, message } = req.body;
        const pool = req.app.locals.db;
        
        const success = await exports.createNotification(pool, {
            senderRole,
            targetType,
            targetValue,
            title,
            message
        });
        
        if (success) {
            res.status(200).json({ success: true, message: "Notification sent successfully! ✅" });
        } else {
            res.status(500).json({ success: false, message: "Failed to send notifications" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- 3. THE APIs: Student Side ---

// A. Unread Count Fetch Karna
exports.getUnreadCount = async (req, res) => {
    try {
        const { studentId } = req.query;
        const pool = req.app.locals.db;
        
        if (!studentId) {
            return res.status(400).json({ success: false, message: "Student ID required" });
        }
        
        const result = await pool.request()
            .input('uid', sql.Int, studentId)
            .query("SELECT COUNT(*) as count FROM Notifications WHERE user_id = @uid AND is_read = 0");
        
        res.json({ success: true, count: result.recordset[0].count });
    } catch (err) {
        console.error("Error fetching unread count:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// B. Notification List Fetch Karna
exports.getStudentNotifications = async (req, res) => {
    try {
        const { studentId } = req.query;
        const pool = req.app.locals.db;
        
        if (!studentId) {
            return res.status(400).json({ success: false, message: "Student ID required" });
        }
        
        const result = await pool.request()
            .input('uid', sql.Int, studentId)
            .query(`SELECT notification_id as id, title, message, notification_type, 
                           is_read as isRead, created_at as createdAt 
                    FROM Notifications 
                    WHERE user_id = @uid 
                    ORDER BY created_at DESC`);
        
        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// C. Mark Single Notification as Read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { studentId } = req.body;
        const pool = req.app.locals.db;
        
        await pool.request()
            .input('nid', sql.Int, notificationId)
            .input('uid', sql.Int, studentId)
            .query("UPDATE Notifications SET is_read = 1 WHERE notification_id = @nid AND user_id = @uid");
        
        res.json({ success: true, message: "Marked as read! ✅" });
    } catch (err) {
        console.error("Error marking as read:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// D. Mark All Read
exports.markAllRead = async (req, res) => {
    try {
        const { studentId } = req.body;
        const pool = req.app.locals.db;
        
        if (!studentId) {
            return res.status(400).json({ success: false, message: "Student ID required" });
        }
        
        await pool.request()
            .input('uid', sql.Int, studentId)
            .query("UPDATE Notifications SET is_read = 1 WHERE user_id = @uid");
        
        res.json({ success: true, message: "All marked as read! ✅" });
    } catch (err) {
        console.error("Error marking all as read:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};