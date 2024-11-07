import pool from '../db/db.js';

// Hel dhammaan votes
export const getAllVotes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM votes');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving votes', error });
    }
};

// Hel vote gaar ah iyadoo la adeegsanayo ID
export const getVoteById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM votes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Vote not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vote', error });
    }
};

// Abuur vote cusub
export const createVote = async (req, res) => {
    const { nomineeId, phoneNumber, numberOfVotes, amountPaid, eventId } = req.body;
    
    // Ensure all required fields are provided
    if (!nomineeId || !phoneNumber || !numberOfVotes || !eventId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Insert vote into the database without including the `id` field
        const [result] = await pool.query(
            'INSERT INTO votes (nominee_id, phone_number, number_of_votes, amount_paid, created_at, event_id) VALUES (?, ?, ?, ?, NOW(), ?)',
            [nomineeId, phoneNumber, numberOfVotes, amountPaid, eventId]
        );
        
        // Respond with success, including the automatically generated vote ID
        res.status(201).json({ 
            id: result.insertId, 
            nomineeId, 
            phoneNumber, 
            numberOfVotes, 
            amountPaid, 
            eventId 
        });
        console.log("Vote created successfully");
    } catch (error) {
        // Handle any errors during insertion
        console.error(error);
        res.status(500).json({ message: 'Error creating vote', error });
    }
};


// Cusbooneysiinta vote
export const updateVote = async (req, res) => {
    const { id } = req.params;
    const { userId, nomineeId } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE votes SET userId = ?, nomineeId = ? WHERE id = ?',
            [userId, nomineeId, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Vote not found' });
        res.json({ message: 'Vote updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating vote', error });
    }
};

export const getTotalAmountPaid = async (req, res) => {
    try {
        // Query to get the sum of amount_paid column
        const [rows] = await pool.query('SELECT SUM(amount_paid) AS totalAmountPaid FROM votes');

        // Check if the sum is null, default to 0 if so
        const totalAmountPaid = rows[0].totalAmountPaid || 0;

        // Format the totalAmountPaid with commas and two decimal places
        const formattedTotalAmountPaid = Number(totalAmountPaid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Log the formatted total
        console.log("Total waa :", formattedTotalAmountPaid);

        // Respond with the formatted total sum
        res.json({ totalAmountPaid: formattedTotalAmountPaid });
    } catch (error) {
        console.error("Error retrieving total amount paid:", error);
        res.status(500).json({ message: 'Error retrieving total amount paid', error });
    }
};

// Get today's revenue
export const getTodaysRevenue = async (req, res) => {
    try {
        // Query to get the sum of amount_paid for today
        const [rows] = await pool.query('SELECT SUM(amount_paid) AS todaysRevenue FROM votes WHERE DATE(created_at) = CURDATE()');

        // Check if the sum is null, default to 0 if so
        const todaysRevenue = rows[0].todaysRevenue || 0;

        // Format today's revenue with commas and two decimal places
        const formattedTodaysRevenue = Number(todaysRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Log today's formatted revenue
        console.log("Today's Revenue:", formattedTodaysRevenue);

        // Respond with today's revenue
        res.json({ todaysRevenue: formattedTodaysRevenue });
    } catch (error) {
        console.error("Error retrieving today's revenue:", error);
        res.status(500).json({ message: "Error retrieving today's revenue", error });
    }
};

export const getWeeklyRevenue = async (req, res) => {
    try {
        // Query to get the total revenue for each day of the current week
        const [rows] = await pool.query(`
            SELECT 
                DATE(created_at) AS date,
                SUM(amount_paid) AS dailyRevenue 
            FROM 
                votes 
            WHERE 
                created_at >= CURDATE() - INTERVAL (WEEKDAY(CURDATE())) DAY 
            GROUP BY 
                DATE(created_at)
            ORDER BY 
                DATE(created_at)
        `);

        // Format the response to ensure all 7 days are represented
        const dailyRevenues = Array(7).fill(0);
        rows.forEach(row => {
            const dayIndex = new Date(row.date).getDay(); // 0 (Sun) to 6 (Sat)
            dailyRevenues[dayIndex] = row.dailyRevenue || 0; // Set daily revenue
        });

        // Log the weekly revenue
        console.log("Weekly Revenue:", dailyRevenues);

        // Respond with the daily revenues for the week
        res.json({ weeklyRevenue: dailyRevenues });
    } catch (error) {
        console.error("Error retrieving weekly revenue:", error);
        res.status(500).json({ message: "Error retrieving weekly revenue", error });
    }
};


// Tirtirid vote
export const deleteVote = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM votes WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Vote not found' });
        res.json({ message: 'Vote deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vote', error });
    }
};
