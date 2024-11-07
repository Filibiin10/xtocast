// db.js
import mysql from 'mysql2/promise'; // Use mysql2/promise for promise-based API

// Create a connection pool to the database
// const pool = mysql.createPool({
//     host: 'localhost',       // XAMPP MySQL host
//     user: 'root',            // Default username for XAMPP MySQL
//     password: '',            // Default password (usually empty for XAMPP)
//     database: 'AwardsDB',    // Your database name
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

const pool = mysql.createPool({
    host: '65.108.74.236',       // Ensure no trailing space
    user: 'xtocast_shiine',       // Your MySQL username
    password: '^Jp;k%Ek~}iF',     // Your MySQL password
    database: 'xtocast_awards_db',// Your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to the database!');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

export default pool; // Export the pool for use in other parts of your application
