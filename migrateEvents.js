require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Event = require('./models/Event');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Function to migrate events to category embedded documents
const migrateEvents = async () => {
  console.log('Starting event migration...');
  
  try {
    // Find all events
    const events = await Event.find().populate('category');
    console.log(`Found ${events.length} events to migrate`);
    
    // Group events by category
    const eventsByCategory = {};
    events.forEach(event => {
      const categoryId = event.category?._id?.toString();
      if (!categoryId) {
        console.warn(`Event ${event._id} has no category, skipping`);
        return;
      }
      
      if (!eventsByCategory[categoryId]) {
        eventsByCategory[categoryId] = [];
      }
      
      // Convert event to plain object for embedding
      const plainEvent = {
        title: event.title,
        description: event.description,
        details: event.details,
        imageUrl: event.imageUrl,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      };
      
      eventsByCategory[categoryId].push(plainEvent);
    });
    
    // Update each category with its events
    let migratedCategories = 0;
    let migratedEvents = 0;
    
    for (const [categoryId, categoryEvents] of Object.entries(eventsByCategory)) {
      const category = await Category.findById(categoryId);
      if (!category) {
        console.warn(`Category ${categoryId} not found, skipping ${categoryEvents.length} events`);
        continue;
      }
      
      // Set the events on the category
      category.events = categoryEvents;
      await category.save();
      
      migratedCategories++;
      migratedEvents += categoryEvents.length;
      
      console.log(`Migrated ${categoryEvents.length} events to category "${category.title}"`);
    }
    
    console.log('\nMigration Summary:');
    console.log('---------------------');
    console.log(`Total events found: ${events.length}`);
    console.log(`Categories updated: ${migratedCategories}`);
    console.log(`Events successfully migrated: ${migratedEvents}`);
    
    console.log('\nMigration completed successfully!');
    console.log('\nNote: The old Event collection still exists. After verifying the migration,');
    console.log('you can manually drop the collection or remove its references from your application.');
    
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

// Run the migration
const runMigration = async () => {
  const conn = await connectDB();
  await migrateEvents();
  await mongoose.disconnect();
  console.log('Database connection closed');
};

runMigration(); 