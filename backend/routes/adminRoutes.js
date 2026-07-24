import express from 'express';
import {
  getStats,
  manualRefreshRSS,
  getAnalytics,
  createCategory,
  deleteCategory,
  getUsers,
  updateUserRole,
  deleteUser,
  getFailedLogs,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection & admin authorization to all admin routes
router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.post('/refresh', manualRefreshRSS);
router.get('/analytics', getAnalytics);
router.get('/logs', getFailedLogs);

router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/users', getUsers);
router.route('/users/:id')
  .put(updateUserRole)
  .delete(deleteUser);

export default router;
