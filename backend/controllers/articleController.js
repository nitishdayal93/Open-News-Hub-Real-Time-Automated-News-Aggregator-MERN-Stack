import mongoose from 'mongoose';
import Article from '../models/Article.js';
import Bookmark from '../models/Bookmark.js';
import User from '../models/User.js';
import SearchHistory from '../models/SearchHistory.js';
import Category from '../models/Category.js';

/**
 * Get paginated articles with search and filtering.
 * Route: GET /api/articles
 */
export const getArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category, source, dateFilter } = req.query;

    const query = {};

    // 1. Category Filter
    if (category) {
      // Support comma-separated categories (e.g. for followed categories feed)
      const catList = category.split(',');
      const catIds = [];
      
      for (const catTerm of catList) {
        const cat = await Category.findOne({
          $or: [
            { _id: mongoose.isValidObjectId(catTerm) ? catTerm : null },
            { slug: catTerm }
          ]
        });
        if (cat) {
          catIds.push(cat._id);
        }
      }

      if (catIds.length > 0) {
        query.category = { $in: catIds };
      }
    }

    // 2. Source Filter
    if (source) {
      query.source = source;
    }

    // 3. Date Filter
    if (dateFilter) {
      const now = new Date();
      if (dateFilter === 'today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        query.pubDate = { $gte: startOfDay };
      } else if (dateFilter === 'week') {
        const startOfWeek = new Date(now.setDate(now.getDate() - 7));
        query.pubDate = { $gte: startOfWeek };
      } else if (dateFilter === 'month') {
        const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
        query.pubDate = { $gte: startOfMonth };
      }
    }

    // 4. Smart Search Filter
    if (search && search.trim() !== '') {
      // Save query in search history asynchronously
      const userId = req.user ? req.user._id : null;
      SearchHistory.create({ user: userId, query: search }).catch(err => 
        console.error('Failed to log search history:', err.message)
      );

      // Perform a regex-based case-insensitive partial search
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    
    // Sort options: always sort by publication date (newest first)
    const sortOptions = { pubDate: -1 };

    const articles = await Article.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skipIndex)
      .populate('source', 'name logoUrl')
      .populate('category', 'name slug');

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single article & update metrics / reading history.
 * Route: GET /api/articles/:id
 */
export const getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('source', 'name logoUrl')
      .populate('category', 'name slug');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment clicksCount asynchronously
    article.clicksCount += 1;
    await article.save();

    // If user is authenticated, append to reading history
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        // Remove existing reference to avoid duplicates
        user.readingHistory = user.readingHistory.filter(
          item => item.article.toString() !== article._id.toString()
        );
        // Add to beginning of history
        user.readingHistory.unshift({ article: article._id, readAt: new Date() });
        
        // Keep reading history capped at 50 items
        if (user.readingHistory.length > 50) {
          user.readingHistory.pop();
        }
        await user.save();
      }
    }

    res.json(article);
  } catch (error) {
    next(error);
  }
};

/**
 * Get trending news articles based on clicks and likes.
 * Route: GET /api/articles/trending
 */
export const getTrendingArticles = async (req, res, next) => {
  try {
    // Return articles with highest clicks count
    const trending = await Article.find({})
      .sort({ clicksCount: -1, pubDate: -1 })
      .limit(6)
      .populate('source', 'name logoUrl')
      .populate('category', 'name slug');

    res.json(trending);
  } catch (error) {
    next(error);
  }
};

/**
 * Get breaking news.
 * Route: GET /api/articles/breaking
 */
export const getBreakingNews = async (req, res, next) => {
  try {
    const breaking = await Article.find({ isBreaking: true })
      .sort({ pubDate: -1 })
      .limit(5)
      .populate('source', 'name logoUrl')
      .populate('category', 'name slug');

    res.json(breaking);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle like/unlike for an article.
 * Route: POST /api/articles/:id/like
 */
export const toggleLikeArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const user = await User.findById(req.user._id);
    const index = user.likedArticles.indexOf(article._id);

    if (index > -1) {
      // Unlike
      user.likedArticles.splice(index, 1);
      article.likesCount = Math.max(0, article.likesCount - 1);
      await user.save();
      await article.save();
      res.json({ liked: false, likesCount: article.likesCount });
    } else {
      // Like
      user.likedArticles.push(article._id);
      article.likesCount += 1;
      await user.save();
      await article.save();
      res.json({ liked: true, likesCount: article.likesCount });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle bookmark status of an article.
 * Route: POST /api/articles/:id/bookmark
 */
export const toggleBookmarkArticle = async (req, res, next) => {
  try {
    const articleId = req.params.id;
    const userId = req.user._id;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const existingBookmark = await Bookmark.findOne({ user: userId, article: articleId });

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.deleteOne({ _id: existingBookmark._id });
      res.json({ bookmarked: false, message: 'Bookmark removed successfully' });
    } else {
      // Create bookmark
      await Bookmark.create({ user: userId, article: articleId });
      res.json({ bookmarked: true, message: 'Article bookmarked successfully' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookmarked articles for the logged-in user.
 * Route: GET /api/articles/user/bookmarks
 */
export const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'article',
        populate: [
          { path: 'source', select: 'name logoUrl' },
          { path: 'category', select: 'name slug' },
        ],
      })
      .sort({ createdAt: -1 });

    const articles = bookmarks.map(b => b.article).filter(Boolean);
    res.json(articles);
  } catch (error) {
    next(error);
  }
};

/**
 * Get reading history for user.
 * Route: GET /api/articles/user/history
 */
export const getReadingHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'readingHistory.article',
        populate: [
          { path: 'source', select: 'name logoUrl' },
          { path: 'category', select: 'name slug' },
        ],
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out potential null articles (e.g. if deleted)
    const history = user.readingHistory
      .map(item => ({
        article: item.article,
        readAt: item.readAt,
      }))
      .filter(item => item.article !== null);

    res.json(history);
  } catch (error) {
    next(error);
  }
};

/**
 * Clear reading history.
 * Route: DELETE /api/articles/user/history
 */
export const clearReadingHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.readingHistory = [];
    await user.save();
    res.json({ message: 'Reading history cleared successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get related articles recommendations.
 * Route: GET /api/articles/:id/related
 */
export const getRelatedArticles = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Find articles in the same category or sharing some tags
    const related = await Article.find({
      _id: { $ne: article._id },
      $or: [
        { category: article.category },
        { tags: { $in: article.tags } },
      ],
    })
      .limit(4)
      .populate('source', 'name logoUrl')
      .populate('category', 'name slug');

    res.json(related);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a comment to an article.
 * Route: POST /api/articles/:id/comments
 */
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const comment = {
      user: req.user._id,
      userName: req.user.name,
      text: text.trim(),
      createdAt: new Date(),
    };

    article.comments.push(comment);
    await article.save();

    res.status(201).json(article.comments);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment from an article.
 * Route: DELETE /api/articles/:id/comments/:commentId
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const commentIndex = article.comments.findIndex(c => c._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = article.comments[commentIndex];

    // Check permission: author or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    article.comments.splice(commentIndex, 1);
    await article.save();

    res.json(article.comments);
  } catch (error) {
    next(error);
  }
};
