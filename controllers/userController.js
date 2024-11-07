import { createUser, findUserById, loginUser, updateUser, deleteUser, findUserByUsername } from '../models/User.js';

export const createUserXtocast = async (req, res) => {
    const { username, password, email, role } = req.body;
    try {
        const newUser = await createUser(username, password, email, role);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
};

// Ku dar howlgallo kale...
