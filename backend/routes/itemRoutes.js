import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getItems,
    getItemById,
    createItem,
    deleteItem,
    updateItem,
} from '../controllers/itemController.js';

const router = express.Router();

router.route('/')
    .get(getItems)
    .post(protect, admin, createItem);

router.route('/:id')
    .get(getItemById)
    .delete(protect, admin, deleteItem)
    .put(protect, admin, updateItem);

export default router;
