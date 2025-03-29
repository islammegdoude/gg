// controllers/eventController.js
const Event = require('../models/Event');
const Category = require('../models/Category');

/**
 * IMPORTANT NOTE:
 * Events are now managed as subdocuments within categories.
 * These controllers now serve as compatibility layers that redirect to the appropriate
 * category-based operations. New code should directly use the methods in categoryController.
 */

exports.createEvent = async (req, res) => {
  try {
    const { category: categoryId, ...eventData } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({ 
        success: false,
        message: "Category ID is required" 
      });
    }
    
    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }
    
    // Add event to the category's events array
    category.events.push(eventData);
    await category.save();
    
    // Return the newly created event
    const newEvent = category.events[category.events.length - 1];
    
    res.status(201).json({
      success: true,
      data: newEvent
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    // Get all categories with events
    const categories = await Category.find({
      'events.0': { $exists: true } // Only categories with at least one event
    });
    
    // Extract all events from all categories and format them with category info
    const events = [];
    categories.forEach(category => {
      category.events.forEach(event => {
        events.push({
          ...event.toObject(),
          _id: event._id,
          category: {
            _id: category._id,
            title: category.title
          }
        });
      });
    });
    
    res.json({
      success: true, 
      count: events.length,
      data: events
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    // Search for the event in all categories
    const categories = await Category.find({
      'events._id': req.params.id
    });
    
    if (categories.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }
    
    const category = categories[0];
    const event = category.events.find(e => e._id.toString() === req.params.id);
    
    // Format response with category info
    const responseEvent = {
      ...event.toObject(),
      category: {
        _id: category._id,
        title: category.title
      }
    };
    
    res.json({
      success: true,
      data: responseEvent
    });
  } catch (err) {
    console.error('Error fetching event by ID:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    // Find which category contains this event
    const categories = await Category.find({
      'events._id': req.params.id
    });
    
    if (categories.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }
    
    const category = categories[0];
    const eventIndex = category.events.findIndex(event => event._id.toString() === req.params.id);
    
    // Update the event properties
    Object.keys(req.body).forEach(key => {
      // Don't allow changing the category through this method
      if (key !== 'category') {
        category.events[eventIndex][key] = req.body[key];
      }
    });
    
    await category.save();
    
    res.json({ 
      success: true,
      data: category.events[eventIndex],
      message: "Event updated successfully" 
    });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    // Find which category contains this event
    const categories = await Category.find({
      'events._id': req.params.id
    });
    
    if (categories.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Event not found" 
      });
    }
    
    const category = categories[0];
    
    // Remove the event from the events array
    category.events = category.events.filter(event => event._id.toString() !== req.params.id);
    
    await category.save();
    
    res.json({ 
      success: true,
      message: "Event deleted successfully" 
    });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};
