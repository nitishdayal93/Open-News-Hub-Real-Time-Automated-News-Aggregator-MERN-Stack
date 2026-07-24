import User from '../models/User.js';
import Article from '../models/Article.js';
import Source from '../models/Source.js';
import Category from '../models/Category.js';
import SearchHistory from '../models/SearchHistory.js';
import { syncRSSFeeds } from '../services/rssService.js';

/**
 * Get dashboard counts and RSS source health states.
 * Route: GET /api/admin/stats
 */
export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalArticles = await Article.countDocuments();
    const totalSources = await Source.countDocuments();
    
    const sourcesHealth = await Source.find({}, 'name feedUrl logoUrl isHealthy lastFetched lastErrorMessage');

    res.json({
      totalUsers,
      totalArticles,
      totalSources,
      sourcesHealth,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually trigger RSS synchronization.
 * Route: POST /api/admin/refresh
 */
export const manualRefreshRSS = async (req, res, next) => {
  try {
    const result = await syncRSSFeeds();
    res.json({
      message: 'RSS sync finished.',
      result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category distribution and smart search keyword trends.
 * Route: GET /api/admin/analytics
 */
export const getAnalytics = async (req, res, next) => {
  try {
    // 1. Articles by Category
    const articlesByCategory = await Article.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $unwind: '$categoryDetails',
      },
      {
        $project: {
          _id: 1,
          name: '$categoryDetails.name',
          count: 1,
        },
      },
    ]);

    // 2. Popular Search Terms
    const popularSearches = await SearchHistory.aggregate([
      {
        $group: {
          _id: { $toLower: '$query' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          query: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      articlesByCategory,
      popularSearches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a category.
 * Route: POST /api/admin/categories
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const categoryExists = await Category.findOne({ slug });
    
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category.
 * Route: DELETE /api/admin/categories/:id
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: `Category ${category.name} deleted successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users for administration management.
 * Route: GET /api/admin/users
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (promote to admin/demote to user).
 * Route: PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid or missing role parameter' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: `User ${user.name} role updated to ${role}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user from platform.
 * Route: DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if trying to delete oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: `User ${user.name} deleted successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * Get error log summaries from unhealthy RSS sources.
 * Route: GET /api/admin/logs
 */
export const getFailedLogs = async (req, res, next) => {
  try {
    const failedSources = await Source.find(
      { isHealthy: false },
      'name feedUrl lastErrorMessage lastFetched'
    );
    res.json(failedSources);
  } catch (error) {
    next(error);
  }
};
