const { connectDB, sql } = require('../../config/db');

const addMeeting = async (req, res) => {
    try {
        const { 
            title, semester, targetGroup, date, time, 
            venue, description, deadlineDate, deadlineTime, attachmentLink 
        } = req.body;

        const pool = await connectDB(); 
        
        // Time parameters ko validate/format karna
        const formattedTime = time ? time : null;
        const formattedDeadlineTime = deadlineTime ? deadlineTime : null;

        await pool.request()
            .input('title', sql.VarChar, title)
            .input('sem', sql.VarChar, semester)
            .input('deg', sql.VarChar, targetGroup)
            .input('m_date', sql.Date, date)
            // .input('m_time', sql.Time, formattedTime) ki jagah VarChar use karein agar Time crash kar raha ho
            .input('m_time', sql.VarChar, formattedTime) 
            .input('venue', sql.VarChar, venue)
            .input('desc', sql.NVarChar, description || null)
            .input('d_date', sql.Date, deadlineDate || null)
            .input('d_time', sql.VarChar, formattedDeadlineTime || null)
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

module.exports = { addMeeting };