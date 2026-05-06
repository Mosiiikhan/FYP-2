const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '123',
    server: 'DESKTOP-Q31A63A\\SQLEXPRESS',
    database: 'BIITAcademicCalendar',
    options: {
        encrypt: false,
        trustServerCertificate: true 
    }
};

let pool = null;

const connectDB = async () => {
    try {
        pool = await sql.connect(dbConfig);
        console.log("✅ Database Connected Successfully");
        return pool;
    } catch (err) {
        console.error("❌ Database Connection Failed:", err);
        throw err;
    }
};

// Get pool (will be set after connectDB is called)
const getPool = () => {
    if (!pool) {
        throw new Error("Database not connected. Call connectDB first.");
    }
    return pool;
};

module.exports = { connectDB, sql, getPool, pool };