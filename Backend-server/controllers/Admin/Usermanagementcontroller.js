const { sql } = require('../../config/db');

// 1. GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {
        const pool = req.app.locals.db;
        const result = await pool.request().query(`
            SELECT 
                user_id,
                username,
                role,
                email,
                phone_no
            FROM Users
            ORDER BY role ASC, username ASC
        `);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ getAllUsers Error:", err.message);
        res.status(500).json({ success: false, message: "Database Error: " + err.message });
    }
};

// 2. UPDATE USERNAME AND/OR PASSWORD
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;
        const pool = req.app.locals.db;

        if (!id) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        if (!username || !username.trim()) {
            return res.status(400).json({ success: false, message: "Username cannot be empty" });
        }

        // Check if username already taken by another user
        const dupCheck = await pool.request()
            .input('username', sql.NVarChar, username.trim())
            .input('id', sql.Int, id)
            .query("SELECT user_id FROM Users WHERE username = @username AND user_id != @id");

        if (dupCheck.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "Username already taken by another user." });
        }

        if (password && password.trim()) {
            await pool.request()
                .input('id', sql.Int, id)
                .input('username', sql.NVarChar, username.trim())
                .input('password', sql.NVarChar, password.trim())
                .query(`
                    UPDATE Users 
                    SET username = @username, password = @password 
                    WHERE user_id = @id
                `);
        } else {
            await pool.request()
                .input('id', sql.Int, id)
                .input('username', sql.NVarChar, username.trim())
                .query(`
                    UPDATE Users 
                    SET username = @username 
                    WHERE user_id = @id
                `);
        }

        console.log(`✅ User ${id} updated by Admin`);
        res.status(200).json({ success: true, message: "User updated successfully!" });

    } catch (err) {
        console.error("❌ updateUser Error:", err.message);
        res.status(500).json({ success: false, message: "Update Error: " + err.message });
    }
};

// ✅ 3. CREATE NEW USER
exports.createUser = async (req, res) => {
    try {
        const { username, password, role, email, phone_no } = req.body;
        const pool = req.app.locals.db;

        // Validation
        if (!username || !username.trim()) {
            return res.status(400).json({ success: false, message: "Username cannot be empty." });
        }
        if (!password || !password.trim()) {
            return res.status(400).json({ success: false, message: "Password cannot be empty." });
        }
        if (!role || !role.trim()) {
            return res.status(400).json({ success: false, message: "Role cannot be empty." });
        }

        const allowedRoles = ['admin', 'student', 'datacell', 'assistant director', 'chairperson', 'society'];
        if (!allowedRoles.includes(role.toLowerCase())) {
            return res.status(400).json({ success: false, message: "Invalid role provided." });
        }

        // Check if username already exists
        const dupCheck = await pool.request()
            .input('username', sql.NVarChar, username.trim())
            .query("SELECT user_id FROM Users WHERE username = @username");

        if (dupCheck.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "Username already exists. Please choose a different one." });
        }

        // Insert new user
        const result = await pool.request()
            .input('username', sql.NVarChar, username.trim())
            .input('password', sql.NVarChar, password.trim())
            .input('role', sql.NVarChar, role.toLowerCase().trim())
            .input('email', sql.NVarChar, email ? email.trim() : null)
            .input('phone_no', sql.NVarChar, phone_no ? phone_no.trim() : null)
            .query(`
                INSERT INTO Users (username, password, role, email, phone_no)
                OUTPUT INSERTED.user_id
                VALUES (@username, @password, @role, @email, @phone_no)
            `);

        const newUserId = result.recordset[0].user_id;

        console.log(`✅ New user created: ${username} (${role}) - ID: ${newUserId}`);
        res.status(201).json({
            success: true,
            message: "User created successfully!",
            user_id: newUserId
        });

    } catch (err) {
        console.error("❌ createUser Error:", err.message);
        res.status(500).json({ success: false, message: "Create Error: " + err.message });
    }
};