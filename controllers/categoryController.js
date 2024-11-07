import pool from '../db/db.js';

// Shaqada helidda dhammaan qaybaha
export const getAllCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        res.json(rows);
        
        console.log(rows)
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving categories', error });
    }
};

// Helitaanka qayb gaar ah
export const getCategoryById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Category not found' });
        res.json(rows[0]);
        
        console.log(rows)
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving category', error });
    }
};

// Abuuridda qayb cusub
export const createCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.insertId, name, description });
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
};

// Cusbooneysiinta qayb
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const [result] = await pool.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
    }
};

export const getCategoryByEventId = async (req,res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories WHERE event_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Category not found' });
        res.json(rows[0]);
        console.log("correct category found for event id: ", req.params.id);
    } catch (error) {
        console.log("ma saxsana")
        res.status(500).json({ message: 'Error retrieving category', error });
    }
};


export const getAllCategoriesByEventId = async (req, res) => {
    try {
        // Query to select all nominees where category_id matches the provided ID
        const [rows] = await pool.query('SELECT * FROM categories WHERE event_id = ?', [req.params.id]);

        // Check if any nominees were found
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No categories found for this event' });
        }

        // Send the array of nominees back as a JSON response
        res.json(rows);
        console.log("categories found for category id: ", rows);
    } catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ message: 'Error retrieving categories', error });
    }
};

//getcategory by nominee




// Tirtiridda qayb
export const deleteCategory = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
};
