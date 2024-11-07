import pool from '../db/db.js';

// Hel dhammaan transactions
export const getAllTransactions = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM transactions');
        res.json(rows);
        console.log(rows)
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving transactions', error });
    }
};

// Hel transaction gaar ah iyadoo la adeegsanayo ID
export const getTransactionById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Transaction not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving transaction', error });
    }
};

// Abuur transaction cusub
export const createTransaction = async (req, res) => {
    const { event_id, nominee_id, transaction_date, amount, payment_method, status } = req.body;
    try {
        // Insert transaction into database
        const [result] = await pool.query(
            'INSERT INTO transactions (event_id, nominee_id, transaction_date, amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)',
            [event_id, nominee_id, transaction_date, amount, payment_method, status]
        );
        
        // Respond with a JSON object containing the transaction details
        res.status(201).json({
            id: result.insertId,
            event_id,
            nominee_id,
            transaction_date,
            amount,
            payment_method,
            status
        });
        res.status(200).send({
            message: 'Transaction created successfully',
            id: result.insertId,
            event_id,
            nominee_id,
            transaction_date,
            amount,
            payment_method,
            status
        }
        )
        console.log("waa la buuray")
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error creating transaction', error });
    }
};
// Cusbooneysiinta transaction
export const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { amount, description } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE transactions SET amount = ?, description = ? WHERE id = ?',
            [amount, description, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Transaction not found' });
        res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction', error });
    }
};

// Tirtirid transaction
export const deleteTransaction = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Transaction not found' });
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error });
    }
};
