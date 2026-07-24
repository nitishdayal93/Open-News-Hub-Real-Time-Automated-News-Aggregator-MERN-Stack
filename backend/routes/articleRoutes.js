import express from 'express';
import {
  getArticles,
  getArticleById,
  getTrendingArticles,
  getBreakingNews,
  toggleLikeArticle,
  toggleBookmarkArticle,
  getBookmarks,
  getReadingHistory,
  clearReadingHistory,
  getRelatedArticles,
  addComment,
  deleteComment,
} from '../controllers/articleController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// General feeds
router.get('/', optionalProtect, getArticles);
router.get('/trending', getTrendingArticles);
router.get('/breaking', getBreakingNews);

// User history & bookmarks
router.get('/user/bookmarks', protect, getBookmarks);
router.route('/user/history')
  .get(protect, getReadingHistory)
  .delete(protect, clearReadingHistory);

// Specific articles
router.get('/:id', optionalProtect, getArticleById);
router.get('/:id/related', getRelatedArticles);
router.post('/:id/like', protect, toggleLikeArticle);
router.post('/:id/bookmark', protect, toggleBookmarkArticle);

// Article comments
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;
