const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '123', // Aapka SQL password
    server: 'DESKTOP-Q31A63A\\SQLEXPRESS',
    database: 'BIITAcademicCalendar',
    options: {
        encrypt: false,
        trustServerCertificate: true 
    }
};

const connectDB = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        return pool;
    } catch (err) {
        console.error("❌ Database Connection Failed:", err);
        throw err;
    }
};

module.exports = { connectDB, sql };