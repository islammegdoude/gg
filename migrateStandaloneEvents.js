/**
 * Migration Script: Standalone Events to Category-Embedded Events
 * 
 * This script migrates any events in the standalone Event collection
 * to be embedded within their parent categories.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Category = require('./models/Category');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function migrateEvents() {
  try {
    console.log('Starting migration of standalone events to category-embedded events...');
    
    // Get all standalone events
    const standaloneEvents = await Event.find({});
    console.log(`Found ${standaloneEvents.length} standalone events to migrate`);
    
    if (standaloneEvents.length === 0) {
      console.log('No standalone events to migrate. All done!');
      process.exit(0);
    }
    
    // Group events by category
    const eventsByCategory = {};
    standaloneEvents.forEach(event => {
      const categoryId = event.category.toString();
      if (!eventsByCategory[categoryId]) {
        eventsByCategory[categoryId] = [];
      }
      eventsByCategory[categoryId].push({
        title: event.title,
        description: event.description,
        imageUrl: event.imageUrl,
        details: event.details,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      });
    });
    
    // Process each category
    const categoryIds = Object.keys(eventsByCategory);
    console.log(`Found events for ${categoryIds.length} different categories`);
    
    for (const categoryId of categoryIds) {
      const category = await Category.findById(categoryId);
      
      if (!category) {
        console.warn(`Warning: Category ${categoryId} not found for ${eventsByCategory[categoryId].length} events`);
        continue;
      }
      
      console.log(`Migrating ${eventsByCategory[categoryId].length} events to category: ${category.title} (${categoryId})`);
      
      // Add events to category
      category.events.push(...eventsByCategory[categoryId]);
      await category.save();
      
      console.log(`Successfully migrated events to category: ${category.title}`);
    }
    
    console.log('Migration completed. You can now safely remove the standalone events.');
    console.log('To remove standalone events, run: await Event.deleteMany({})');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateEvents(); 