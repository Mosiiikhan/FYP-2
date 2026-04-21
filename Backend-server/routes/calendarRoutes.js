const express = require('express');
const router = express.Router();

// ✅ Controller se functions mangwana
const { manageSemester, getAllEvents } = require('../controllers/calendarController');

// --- API Routes ---

/**
 * 1. Semester Timeline (Bulk Data) Save karne ke liye
 * Path: POST /api/calendar/manage-semester
 */
router.post('/manage-semester', manageSemester);

/**
 * 2. 🟢 FIXED PATH: Ab ye Postman URL se match karega
 * Path: GET /api/calendar/all-events
 */
router.get('/all-events', getAllEvents); 

/**
 * 3. Delete Event
 * Path: DELETE /api/calendar/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const pool = req.app.locals.db;
        const { id } = req.params;
        const sql = require('mssql'); // Ensure mssql is available here
        
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Academic_Calendar WHERE event_id = @id");
            
        res.json({ success: true, message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;