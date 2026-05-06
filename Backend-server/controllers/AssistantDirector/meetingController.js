const { connectDB, sql } = require('../../config/db');
// Notification Controller ko import kiya
const NotifController = require('../notificationController');

// 1. CREATE: Meeting add karne ka logic (Single Row Approach)
const addMeeting = async (req, res) => {
    try {
        const { 
            title, semester, targetDegrees, date, time, 
            venue, description 
        } = req.body;

        const pool = await connectDB(); 
        
        // FIX: Agar 'both' hai toh "7, 8" save karein, warna single value string mein
        const semToSave = semester === 'both' ? "7, 8" : semester.toString();
        
        // FIX: Degrees array ko join karke ek single string banayein (e.g., "CS, AI, SE")
        const degreesToSave = Array.isArray(targetDegrees) ? targetDegrees.join(', ') : targetDegrees;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // --- A. INSERT INTO FYP_Meetings (Single Insert instead of Loops) ---
            const meetingRequest = new sql.Request(transaction);
            await meetingRequest
                .input('title', sql.VarChar, title)
                .input('semInput', sql.VarChar, semToSave)
                .input('deg', sql.VarChar, String(degreesToSave)) 
                .input('m_date', sql.Date, date)
                .input('m_time', sql.VarChar, time || null) 
                .input('venue', sql.VarChar, venue)
                .input('desc', sql.NVarChar, description || null)
                .query(`INSERT INTO FYP_Meetings 
                        (title, [semester], target_degree, meeting_date, meeting_time, venue, agenda_description)
                        VALUES (@title, @semInput, @deg, @m_date, @m_time, @venue, @desc)`);

            await transaction.commit();

            // --- B. Notifications Logic ---
            // Notifications ab bhi semesters ke hisaab se bhejni hain taake targeted rahein
            const semArray = semester === 'both' ? [7, 8] : [parseInt(semester)];
            for (const s of semArray) {
                try {
                    await NotifController.createNotification(pool, {
                        senderRole: 'Assistant Director',
                        targetType: 'semester', 
                        targetValue: s.toString(),
                        title: `New Meeting: ${title}`,
                        message: `Meeting scheduled for ${degreesToSave} at ${venue}.`
                    });
                } catch (notifErr) { 
                    console.error("⚠️ Notification failed:", notifErr.message); 
                }
            }

            res.status(200).json({ success: true, message: "Meeting saved Successfully as a single entry! ✅" });
        } catch (innerErr) {
            await transaction.rollback();
            console.error("❌ SQL Query Error:", innerErr.message);
            res.status(500).json({ success: false, message: "Database Error: " + innerErr.message });
        }
    } catch (err) {
        console.error("❌ Controller Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. READ: Saari meetings fetch karne ke liye (Ab ek meeting ek baar hi nazar aayegi)
const getMeetings = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query("SELECT * FROM FYP_Meetings ORDER BY created_at DESC");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ SQL Error (Get):", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. DELETE: Meeting khatam karne ke liye
const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM FYP_Meetings WHERE meeting_id = @id");
        
        res.status(200).json({ success: true, message: "Meeting Deleted Successfully!" });
    } catch (err) {
        console.error("❌ SQL Error (Delete):", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. UPDATE: Meeting edit karne ka logic (Single Row update)
const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, semester, targetDegrees, date, time, 
            venue, description, deadlineDate, deadlineTime, attachmentLink 
        } = req.body;

        const pool = await connectDB();
        const safeDate = (date && date !== "") ? date : null;
        const safeDeadlineDate = (deadlineDate && deadlineDate !== "") ? deadlineDate : null;
        
        const semToSave = semester === 'both' ? "7, 8" : semester.toString();
        const degreesToSave = Array.isArray(targetDegrees) ? targetDegrees.join(', ') : targetDegrees;

        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.VarChar, title)
            .input('sem', sql.VarChar, semToSave)
            .input('deg', sql.VarChar, String(degreesToSave))
            .input('m_date', sql.Date, safeDate)
            .input('m_time', sql.VarChar, time || null)
            .input('venue', sql.VarChar, venue)
            .input('desc', sql.NVarChar, description || null)
            .input('d_date', sql.Date, safeDeadlineDate)
            .input('d_time', sql.VarChar, deadlineTime || null)
            .input('link', sql.NVarChar, attachmentLink || null)
            .query(`
                UPDATE FYP_Meetings 
                SET title=@title, [semester]=@sem, target_degree=@deg, meeting_date=@m_date, 
                    meeting_time=@m_time, venue=@venue, agenda_description=@desc, 
                    deadline_date=@d_date, deadline_time=@d_time, attachment_link=@link
                WHERE meeting_id = @id
            `);

        res.status(200).json({ success: true, message: "Meeting Updated Successfully!" });
    } catch (err) {
        console.error("❌ SQL Error (Update):", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { addMeeting, getMeetings, deleteMeeting, updateMeeting };