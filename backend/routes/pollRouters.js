import express from 'express';
import * as poll from '../controllers/pollController.js';

const router = express.Router();

router.get('/', poll.getAllPolls);
router.get('/:id', poll.getOnePoll);

router.post('/', poll.createPoll);
router.patch('/:id', poll.updatePoll);
router.delete('/:id', poll.deletePoll);

router.patch('/:id/answer', poll.answerPoll);

export default router;
