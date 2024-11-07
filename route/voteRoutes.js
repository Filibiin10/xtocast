import express from 'express';
import {
    getAllVotes,
    getVoteById,
    getTotalAmountPaid,
    createVote,
    updateVote,
    deleteVote,
} from '../controllers/voteController.js';

const router = express.Router();

router.get('/', getAllVotes);
router.get('/:id', getVoteById);
router.get('/s', getTotalAmountPaid);
router.post('/', createVote);
router.put('/:id', updateVote);
router.delete('/:id', deleteVote);

export default router;
