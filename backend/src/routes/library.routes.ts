import express from 'express';
import { createBook, getAllBooks, updateBook, deleteBook } from '../controllers/library.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), createBook);
router.get('/', getAllBooks); // All authenticated users can view books
router.put('/:id', authorize('admin'), updateBook);
router.delete('/:id', authorize('admin'), deleteBook);

export default router;