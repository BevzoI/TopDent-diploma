import express from 'express';
import * as news from '../controllers/newsController.js';

const router = express.Router();

router.get('/', news.getAllNews);
router.get('/:id', news.getOneNews);
router.post('/', news.createNews);
router.patch('/:id', news.updateNews);
router.delete('/:id', news.deleteNews);

export default router;