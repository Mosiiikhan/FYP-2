const { connectDB, sql } = require('../../config/db');

<<<<<<< HEAD
// 1. CREATE: Meeting add karne ka logic
=======
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
const addMeeting = async (req, res) => {
    try {
        const { 
            title, semester, targetGroup, date, time, 
            venue, description, deadlineDate, deadlineTime, attachmentLink 
        } = req.body;

        const pool = await connectDB(); 
        
<<<<<<< HEAD
        // Fix: Khali string ko null handle karna zaroori hai
        const formattedDate = (date && date !== "") ? date : null;
        const formattedDeadlineDate = (deadlineDate && deadlineDate !== "") ? deadlineDate : null;
=======
        // Time parameters ko validate/format karna
        const formattedTime = time ? time : null;
        const formattedDeadlineTime = deadlineTime ? deadlineTime : null;
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4

        await pool.request()
            .input('title', sql.VarChar, title)
            .input('sem', sql.VarChar, semester)
            .input('deg', sql.VarChar, targetGroup)
<<<<<<< HEAD
            .input('m_date', sql.Date, formattedDate)
            .input('m_time', sql.VarChar, time || null) 
            .input('venue', sql.VarChar, venue)
            .input('desc', sql.NVarChar, description || null)
            .input('d_date', sql.Date, formattedDeadlineDate)
            .input('d_time', sql.VarChar, deadlineTime || null)
=======
            .input('m_date', sql.Date, date)
            // .input('m_time', sql.Time, formattedTime) ki jagah VarChar use karein agar Time crash kar raha ho
            .input('m_time', sql.VarChar, formattedTime) 
            .input('venue', sql.VarChar, venue)
            .input('desc', sql.NVarChar, description || null)
            .input('d_date', sql.Date, deadlineDate || null)
            .input('d_time', sql.VarChar, formattedDeadlineTime || null)
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
            .input('link', sql.NVarChar, attachmentLink || null)
            .query(`
                INSERT INTO FYP_Meetings 
                (title, semester, target_degree, meeting_date, meeting_time, venue, agenda_description, deadline_date, deadline_time, attachment_link)
                VALUES 
                (@title, @sem, @deg, @m_date, @m_time, @venue, @desc, @d_date, @d_time, @link)
            `);

        res.status(200).json({ success: true, message: "Meeting Saved Successfully!" });
    } catch (err) {
        console.error("❌ SQL Error:", err.message);
        res.status(500).json({ success: false, message: "Database Error: " + err.message });
    }
};

<<<<<<< HEAD
// 2. READ: Saari meetings fetch karne ke liye
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

// 3. DELETE: Specific meeting khatam karne ke liye
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

// 4. UPDATE: Meeting edit karne ke liye (Conversion Fix Added)
const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, semester, targetGroup, date, time, 
            venue, description, deadlineDate, deadlineTime, attachmentLink 
        } = req.body;

        const pool = await connectDB();

        // ✅ Critical Fix: SQL Server empty string ("") ko date mein convert nahi kar pata.
        // Isliye hum check kar rahe hain ke agar value khali hai toh NULL bhejo.
        const safeDate = (date && date !== "") ? date : null;
        const safeDeadlineDate = (deadlineDate && deadlineDate !== "") ? deadlineDate : null;

        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.VarChar, title)
            .input('sem', sql.VarChar, semester)
            .input('deg', sql.VarChar, targetGroup)
            .input('m_date', sql.Date, safeDate)
            .input('m_time', sql.VarChar, time && time !== "" ? time : null)
            .input('venue', sql.VarChar, venue)
            .input('desc', sql.NVarChar, description && description !== "" ? description : null)
            .input('d_date', sql.Date, safeDeadlineDate)
            .input('d_time', sql.VarChar, deadlineTime && deadlineTime !== "" ? deadlineTime : null)
            .input('link', sql.NVarChar, attachmentLink && attachmentLink !== "" ? attachmentLink : null)
            .query(`
                UPDATE FYP_Meetings 
                SET title=@title, semester=@sem, target_degree=@deg, meeting_date=@m_date, 
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
=======
module.exports = { addMeeting };
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
