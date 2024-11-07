import express from 'express';
import {
    createUserXtocast,
    // findUserById,
    // loginUser,
    // updateUser,
    // deleteUser,
    // findUserByUsername
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', createUserXtocast);
// router.post('/login', loginUser);
// router.get('/:id', findUserById);
// router.put('/:id', updateUser);
// router.delete('/:id', deleteUser);
// router.get('/username/:username', findUserByUsername);

export default router;
