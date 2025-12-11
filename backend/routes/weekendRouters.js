import express from 'express';
import * as weekend from '../controllers/weekendController.js';

const router = express.Router();

router.get('/', weekend.getAllWeekend);
router.get('/:id', weekend.getOneWeekend);
router.post('/', weekend.createWeekend);
router.patch('/:id', weekend.updateWeekend);
router.delete('/:id', weekend.deleteWeekend);
router.patch('/:id/status', weekend.updateWeekendStatus);

export default router;
