import express from 'express';
import {
    getAllNominees,
    getNomineeById,
    createNominee,
    updateNominee,
    deleteNominee
} from '../controllers/nomineeController.js';

const router = express.Router();

router.get('/', getAllNominees);
router.get('/:id', getNomineeById);
router.post('/', createNominee);
router.put('/:id', updateNominee);
router.delete('/:id', deleteNominee);

export default router;
