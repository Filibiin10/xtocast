// user.js
import pool from '../db/db.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Create a new user
export const createUser = async (username, password, email, role = 'user') => {
    const conn = await pool.getConnection();
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const [result] = await conn.query(
            'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, email, role]
        );
        return { id: result.insertId, username, email, role }; // Return the new user object
    } catch (error) {
        throw error;
    } finally {
        conn.release();
    }
};

//login user 
export const loginUser = async (username, password) => {
    // Fetch user from the database
    const user = await findUserByUsername(username);

    // Check if user exists and verify password
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password); // Use bcrypt to compare hashed password

    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Token expires in 1 hour
    });

    return token;
};


// Find a user by ID
export const findUserById = async (id) => {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null; // Return the user object or null
    } catch (error) {
        throw error;
    } finally {
        conn.release();
    }
};

// Find a user by username
export const findUserByUsername = async (username) => {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows.length > 0 ? rows[0] : null; // Return the user object or null
    } catch (error) {
        throw error;
    } finally {
        conn.release();
    }
};

// Update user details
export const updateUser = async (id, updatedFields) => {
    const conn = await pool.getConnection();
    try {
        const updates = Object.keys(updatedFields).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updatedFields);
        values.push(id); // Add the id to the end for the WHERE clause
        await conn.query(`UPDATE users SET ${updates} WHERE id = ?`, values);
    } catch (error) {
        throw error;
    } finally {
        conn.release();
    }
};

// Delete a user
export const deleteUser = async (id) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('DELETE FROM users WHERE id = ?', [id]);
    } catch (error) {
        throw error;
    } finally {
        conn.release();
    }
};
