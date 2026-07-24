import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB Connection Failed: ${error.message}`);
    console.log('Attempting to spin up an in-memory MongoDB Server for local sandbox development...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected (Memory Sandbox): ${conn.connection.host}`);
      
      // Auto seed initial data in memory database
      const Category = (await import('../models/Category.js')).default;
      const Source = (await import('../models/Source.js')).default;
      const User = (await import('../models/User.js')).default;

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
        { name: 'TechCrunch', feedUrl: 'https://techcrunch.com/feed/', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/TechCrunch_logo.svg' },
        { name: 'Wired', feedUrl: 'https://www.wired.com/feed/rss', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Wired_logo.svg' },
      ];

      for (const cat of categories) {
        await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
      }
      for (const src of sources) {
        await Source.findOneAndUpdate({ feedUrl: src.feedUrl }, src, { upsert: true });
      }

      // Seed Default Admin
      const adminEmail = 'admin@newshub.com';
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        const adminUser = new User({
          name: 'Admin Manager',
          email: adminEmail,
          password: 'AdminPassword123',
          role: 'admin',
        });
        await adminUser.save();
        console.log('Memory Sandbox seeded: admin@newshub.com / AdminPassword123');
      }

      console.log('Memory database sandbox setup completed successfully!');
    } catch (memError) {
      console.error(`Failed to initialize in-memory database fallback: ${memError.message}`);
      console.error('Ensure a local MongoDB server is running or configure MONGODB_URI in backend/.env.');
      process.exit(1);
    }
  }
};

export default connectDB;
