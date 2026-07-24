import Category from '../models/Category.js';
import Source from '../models/Source.js';
import Notification from '../models/Notification.js';

/**
 * Get all categories.
 * Route: GET /api/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all sources.
 * Route: GET /api/sources
 */
export const getSources = async (req, res, next) => {
  try {
    const sources = await Source.find({}).sort({ name: 1 });
    res.json(sources);
  } catch (error) {
    next(error);
  }
};

/**
 * Get active notifications.
 * Route: GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    let query = {
      $or: [
        { user: null }, // Global notifications
      ]
    };

    if (req.user) {
      query.$or.push({ user: req.user._id });
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('article', 'title');

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read by user.
 * Route: POST /api/notifications/:id/read
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (req.user) {
      if (!notification.isReadBy.includes(req.user._id)) {
        notification.isReadBy.push(req.user._id);
        await notification.save();
      }
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};
