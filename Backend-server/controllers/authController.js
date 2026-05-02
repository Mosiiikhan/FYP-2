const { connectDB, sql } = require('../config/db');

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Login Attempt for:", username); 

        const pool = await connectDB();
        
<<<<<<< HEAD
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
=======
        // ✅ Smart Query: Check both Users.username OR Students.roll_no
       // Backend Controller (authController.js)
const query = `
    SELECT U.user_id, U.username, U.role, S.roll_no, S.section 
    FROM Users U
    LEFT JOIN Students S ON U.user_id = S.user_id
    WHERE (
        -- Condition 1: Agar student hai toh sirf Roll No match kare
        (U.role = 'Student' AND S.roll_no = @user)
        OR 
        -- Condition 2: Agar Admin/Datacell/CP hai toh sirf Username match kare
        (U.role != 'Student' AND U.username = @user)
    )
    AND U.password = @pass
`;
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4

        const result = await pool.request()
            .input('user', sql.VarChar, username)
            .input('pass', sql.VarChar, password)
            .query(query);

        if (result.recordset.length > 0) {
            console.log("✅ User Found!");
            res.status(200).json({
                message: "Login Successful",
<<<<<<< HEAD
                user: result.recordset[0] // Is mein ab user_id, role, society_id aur assigned_color bhi jaye ga
=======
                user: result.recordset[0] // Is mein user_id, role, aur student info bhi chali jaye gi
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
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