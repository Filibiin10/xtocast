import pool from '../db/db.js';

// Hel dhammaan dhacdooyinka
export const getAllEvents = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving events', error });
    }
};

// Helid dhacdo gaar ah iyadoo la adeegsanayo ID
export const getEventById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Event not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving event', error });
    }
};

//

const PORT = 7000; // Replace with your actual port number

export const createEvent = async (req, res) => {
    const { name, description, vote_cost, organization_name, startDate, endDate } = req.body;

    // Generate ID based on the event name
    const generateIdFromName = (id) => {
        if (!id || typeof id !== 'string') {
            return 'ID1'; // Default ID
        }
        const trimmedName = id.trim();
        return trimmedName.length >= 3 ? trimmedName.substring(0, 3).toUpperCase() : 'ID1'; // Use the first three letters as ID
    };

    const newId = generateIdFromName(name);
    
    // Check if the ID is unique
    const [existingEvent] = await pool.query("SELECT id FROM events WHERE id = ?", [newId]);

    if (existingEvent.length > 0) {
        return res.status(400).json({ message: 'Generated ID already exists. Please try a different event name.' });
    }

    const image_url = req.file ? `http://localhost:${PORT}/uploads/${req.file.filename}` : null;

    try {
        // Insert new event data into the database
        const sql = "INSERT INTO events (id, name, description, image_url, vote_cost, organization_name, begin_date, ending_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        await pool.query(sql, [newId, name, description, image_url, vote_cost, organization_name, startDate, endDate]);

        res.status(201).json({ message: 'Event created successfully', id: newId, path: image_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the event.', error: error.message });
    }
};


// Cusbooneysiinta dhacdo
export const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, date } = req.body;
    try {
        const [result] = await pool.query('UPDATE events SET title = ?, description = ?, date = ? WHERE id = ?', [title, description, date, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating event', error });
    }
};


// Get categories for a specific event by event ID
export const getEventCategories = async (req, res) => {
    const { eventId } = req.params; // Get eventId from URL

    try {
        // Query to fetch categories based on the event_id
        const [rows] = await pool.query('SELECT * FROM categories WHERE event_id = ?', [eventId]);

        if (rows.length > 0) {
            res.json(rows); // Return the categories if found
        } else {
            console.log("ma saxsana")
            res.status(404).json({ message: 'Categories not found for this event' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};


// Tirtirid dhacdo
export const deleteEvent = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error });
    }
};
