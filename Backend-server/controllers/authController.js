const { connectDB, sql } = require('../config/db');

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Login Attempt for:", username); 

        const pool = await connectDB();
        
        // ✅ Smart Query: Adding Societies Join without disturbing Students/Admin logic
        const query = `
            SELECT 
                U.user_id, U.username, U.role, 
                S.roll_no, S.section, 
                Soc.society_id, Soc.assigned_color
            FROM Users U
            LEFT JOIN Students S ON U.user_id = S.user_id
            LEFT JOIN Societies Soc ON U.society_id = Soc.society_id
            WHERE (
                -- Condition 1: Agar student hai toh sirf Roll No match kare
                (U.role = 'Student' AND S.roll_no = @user)
                OR 
                -- Condition 2: Agar Admin/Datacell/CP hai toh sirf Username match kare
                (U.role != 'Student' AND U.username = @user)
            )
            AND U.password = @pass
        `;

        const result = await pool.request()
            .input('user', sql.VarChar, username)
            .input('pass', sql.VarChar, password)
            .query(query);

        if (result.recordset.length > 0) {
            console.log("✅ User Found!");
            res.status(200).json({
                message: "Login Successful",
                user: result.recordset[0] // Is mein ab user_id, role, society_id aur assigned_color bhi jaye ga
            });
        } else {
            console.log("❌ Invalid Credentials");
            res.status(401).json({ message: "Invalid Credentials" });
        }
    } catch (err) {
        console.error("❌ SQL Error:", err.message); 
        res.status(500).json({ message: "Database Error: " + err.message });
    }
};