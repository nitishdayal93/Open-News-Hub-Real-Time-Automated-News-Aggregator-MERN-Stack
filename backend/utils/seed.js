import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Source from '../models/Source.js';
import User from '../models/User.js';

dotenv.config();

const categories = [
  { name: 'World', slug: 'world' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Science', slug: 'science' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Business', slug: 'business' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Health', slug: 'health' },
];

const sources = [
  { name: 'BBC News', feedUrl: 'http://feeds.bbci.co.uk/news/rss.xml', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/BBC_News_2019.svg' },
  { name: 'CNN', feedUrl: 'http://rss.cnn.com/rss/edition.rss', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg' },
  { name: 'Reuters', feedUrl: 'https://news.google.com/rss/search?q=Reuters', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Reuters_logo.svg' },
  { name: 'The Guardian', feedUrl: 'https://www.theguardian.com/international/rss', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/The_Guardian_post-2018_logo.svg' },
  { name: 'Al Jazeera', feedUrl: 'https://www.aljazeera.com/xml/rss/all.xml', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Al_Jazeera_English_logo.svg' },
  { name: 'Times of India', feedUrl: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/The_Times_of_India_logo.svg' },
  { name: 'Hindustan Times', feedUrl: 'https://www.hindustantimes.com/feeds/rss/news/rssfeed.xml', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Hindustan_Times_logo.svg' },
  { name: 'Indian Express', feedUrl: 'https://indianexpress.com/feed/', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/77/The_Indian_Express_logo.svg' },
  { name: 'NDTV', feedUrl: 'https://feeds.feedburner.com/ndtvnews-top-stories', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/NDTV_logo.svg' },
  { name: 'Economic Times', feedUrl: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/The_Economic_Times_logo.svg' },
  { name: 'TechCrunch', feedUrl: 'https://techcrunch.com/feed/', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/TechCrunch_logo.svg' },
  { name: 'Wired', feedUrl: 'https://www.wired.com/feed/rss', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Wired_logo.svg' },
  { name: 'Ars Technica', feedUrl: 'https://feeds.arstechnica.com/arstechnica/index', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Ars_Technica_logo.svg' },
  { name: 'Yahoo Sports', feedUrl: 'https://sports.yahoo.com/rss/', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Yahoo%21_Sports_logo.svg' },
  { name: 'NASA News', feedUrl: 'https://www.nasa.gov/news-release/feed/', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clean up outdated ESPN source if exists to avoid showing FAILED status in Dashboard
    await Source.deleteMany({ feedUrl: 'https://www.espn.com/espn/rss/news' });
    console.log('Cleaned up legacy ESPN source.');

    // Seed Categories
    for (const cat of categories) {
      await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
    }
    console.log('Categories seeded.');

    // Seed Sources
    for (const src of sources) {
      await Source.findOneAndUpdate({ feedUrl: src.feedUrl }, src, { upsert: true, new: true });
    }
    console.log('RSS Sources seeded.');

    // Seed Admin User
    // Clean up old admin email
    await User.deleteOne({ email: 'admin@ainewshub.com' });
    console.log('Cleaned up old admin user.');

    const adminEmail = 'admin@newshub.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = new User({
        name: 'Admin Manager',
        email: adminEmail,
        role: 'admin',
      });
      console.log('Creating new admin user...');
    } else {
      console.log('Admin user already exists. Updating credentials...');
    }
    
    // Always enforce seeded password
    adminUser.password = 'AdminPassword123';
    await adminUser.save();
    console.log('Admin user seeded: admin@newshub.com / AdminPassword123');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error.message);
    process.exit(1);
  }
};

seedDB();
