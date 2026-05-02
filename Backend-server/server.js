const express = require('express');
const cors = require('cors');
const { connectDB, sql } = require('./config/db'); 

// --- 1. Route Imports ---
const authRoutes = require('./routes/authRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const examScheduleRoutes = require('./routes/examScheduleRoutes'); 
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const emergencyholidayRoutes = require('./routes/emergencyholidayRoutes'); 
const saturdayRoutes = require('./routes/saturdayRoutes'); 
const eventRoutes = require('./routes/eventRoutes'); 
const holidayRoutes = require('./routes/holidayRoutes'); 
const meetingRoutes = require('./routes/meetingRoutes'); // ✅ Added: Meeting Routes for AD
// Pehle import karein
const islamicRoutes = require('./routes/islamicHolidaysRoutes');



const app = express();

// ✅ 2. CORS Middleware
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ 3. Body Parser Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ 4. Database Connection
connectDB().then((pool) => {
    console.log("✅ Database Connected Successfully");
    app.locals.db = pool; 
}).catch(err => {
    console.error("❌ Database Connection Failed:", err);
});

// ✅ 5. API Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/exams', examScheduleRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/emergencyholiday', emergencyholidayRoutes); 
app.use('/api/saturdays', saturdayRoutes); 
app.use('/api/events', eventRoutes); 
app.use('/api/holidays', holidayRoutes); 
app.use('/api/meetings', meetingRoutes); // ✅ Added: Registered Meeting API for AD

app.use('/api/islamic', islamicRoutes);

// ✅ 6. Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.stack);
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ✅ 7. Server Start
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Events API active at: /api/events`);
    console.log(`📡 Holidays API active at: /api/holidays`);
    console.log(`📡 Meetings API active at: /api/meetings`); // ✅ Logic Check for Meetings
});