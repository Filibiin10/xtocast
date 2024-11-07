import pool from "../db/db.js";

export const createTransaction = async (event_id, nominee_id, transaction_date, amount, payment_method, status) => {
    const [result] = await pool.query(
        'INSERT INTO transactions (event_id, nominee_id, transaction_date, amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)',
        [event_id, nominee_id, transaction_date, amount, payment_method, status]
    );
    return { id: result.insertId, event_id, nominee_id, transaction_date, amount, payment_method, status };
};