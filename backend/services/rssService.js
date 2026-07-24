import Parser from 'rss-parser';
import axios from 'axios';
import Source from '../models/Source.js';
import Category from '../models/Category.js';
import Article from '../models/Article.js';
import Notification from '../models/Notification.js';
import { generateSummary, generateTags, classifyCategory } from './textService.js';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
});

// In-memory cache for RSS feeds to avoid slamming servers
const feedCache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch and parse an RSS feed with in-memory caching.
 */
const fetchFeedCached = async (url) => {
  const cached = feedCache.get(url);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    console.log(`Using cached feed for: ${url}`);
    return cached.data;
  }

  // Fetch using axios and parse feed text to handle potential custom encoding or request blocks
  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  const parsed = await parser.parseString(response.data);
  feedCache.set(url, {
    timestamp: now,
    data: parsed,
  });

  return parsed;
};

/**
 * Check if the title/content contains breaking news keywords.
 */
const checkIsBreaking = (title, contentSnippet) => {
  const keywords = ['breaking news', 'breaking:', 'just in:', 'urgent:', 'flash:'];
  const text = `${title} ${contentSnippet || ''}`.toLowerCase();
  return keywords.some(keyword => text.includes(keyword));
};

/**
 * Run RSS sync across all configured sources.
 */
export const syncRSSFeeds = async () => {
  console.log('Starting RSS feeds sync...');
  const sources = await Source.find({});
  const categories = await Category.find({});

  if (sources.length === 0 || categories.length === 0) {
    console.log('No sources or categories configured. Skipping sync.');
    return { success: false, message: 'Sources or Categories not seeded' };
  }

  const results = {
    totalProcessed: 0,
    newArticles: 0,
    failedSources: [],
  };

  for (const source of sources) {
    try {
      console.log(`Fetching RSS feed for ${source.name} from: ${source.feedUrl}`);
      const feed = await fetchFeedCached(source.feedUrl);

      // Mark source as healthy
      source.isHealthy = true;
      source.lastFetched = new Date();
      source.lastErrorMessage = null;
      await source.save();

      // Process articles (limit to top 15 from each feed to avoid API limits/overload)
      const items = feed.items.slice(0, 15);
      for (const item of items) {
        results.totalProcessed++;
        
        // Deduplicate using URL
        const articleUrl = item.link || item.guid;
        if (!articleUrl) continue;

        const exists = await Article.exists({ url: articleUrl });
        if (exists) {
          continue;
        }

        // Parse content
        const title = item.title || 'No Title';
        const description = item.contentSnippet || item.summary || item.content || '';
        const content = item.content || item.contentSnippet || '';
        
        // Attempt to extract image URL from enclosures or standard tags
        let imageUrl = null;
        if (item.enclosure && item.enclosure.url) {
          imageUrl = item.enclosure.url;
        } else if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
          imageUrl = item.mediaContent.$.url;
        } else {
          // Fallback parsing: look for img src tag in content
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) {
            imageUrl = imgMatch[1];
          }
        }

        // Text & Category Heuristics Processing
        const categoryName = await classifyCategory(title, description, categories);
        const matchedCategory = categories.find(c => c.name === categoryName) || categories[0];
        
        const summary = await generateSummary(title, description);
        const tags = await generateTags(title, description);
        const isBreaking = checkIsBreaking(title, description);

        const newArticle = new Article({
          title,
          description: description.replace(/<[^>]*>/g, '').slice(0, 500),
          content: content.replace(/<[^>]*>/g, '').slice(0, 2000),
          url: articleUrl,
          imageUrl,
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: source._id,
          category: matchedCategory._id,
          summary,
          tags,
          isBreaking,
        });

        await newArticle.save();
        results.newArticles++;

        // Send notification for breaking news
        if (isBreaking) {
          const breakingNotif = new Notification({
            title: `Breaking News from ${source.name}`,
            message: title,
            article: newArticle._id,
          });
          await breakingNotif.save();
        }
      }
    } catch (error) {
      console.error(`Error syncing source ${source.name}:`, error.message);
      
      // Update health status for this source
      source.isHealthy = false;
      source.lastErrorMessage = error.message;
      await source.save();
      
      results.failedSources.push({
        source: source.name,
        error: error.message,
      });
    }
  }

  console.log(`RSS Sync completed. New articles: ${results.newArticles}, Failed sources: ${results.failedSources.length}`);
  return { success: true, data: results };
};
