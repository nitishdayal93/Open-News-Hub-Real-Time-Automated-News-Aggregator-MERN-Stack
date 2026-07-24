import express from 'express';
import {
  getCategories,
  getSources,
  getNotifications,
  markNotificationRead,
} from '../controllers/generalController.js';
import { optionalProtect, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/sources', getSources);
router.get('/notifications', optionalProtect, getNotifications);
router.post('/notifications/:id/read', protect, markNotificationRead);

export default router;
