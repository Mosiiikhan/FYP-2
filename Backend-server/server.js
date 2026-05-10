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
const meetingRoutes = require('./routes/meetingRoutes');
const islamicRoutes = require('./routes/islamicHolidaysRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); 
const seatingPlanRoutes = require('./routes/seatingPlanRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes'); // 👈 ADDED

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
app.use('/api/meetings', meetingRoutes);
app.use('/api/islamic', islamicRoutes);
app.use('/api/seating-plan', seatingPlanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/manage-users', userManagementRoutes); // 👈 ADDED

// ✅ 6. Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.stack);
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ✅ 7. Server Start
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API Endpoints Ready:`);
    console.log(`   - Holidays: http://localhost:${PORT}/api/holidays/definitions`);
    console.log(`   - Events:   http://localhost:${PORT}/api/events`);
    console.log(`   - Seating:  http://localhost:${PORT}/api/seating-plan`);
    console.log(`   - Users:    http://localhost:${PORT}/api/manage-users/all`); // 👈 ADDED
});