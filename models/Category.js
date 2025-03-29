// models/Category.js
const mongoose = require('mongoose');

// Define the event schema as a sub-document
const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  details: String,
  imageUrl: String,
  imagePublicId: String
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    index: false // Explicitly disable indexing for this field
  },
  slug: {
    type: String,
    default: function() {
      // Generate a temporary unique identifier, not for URLs
      return `cat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    },
    index: false // Explicitly disable indexing for slug
  },
  shortDescription: {
    type: String,
    trim: true
  },
  description: { 
    type: String,
    trim: true 
  },
  imageUrl: { 
    type: String 
  },
  imagePublicId: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  // Add events array directly to the category schema
  events: [eventSchema]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  autoIndex: false // Disable automatic indexing
});

// Additional options to avoid index creation
categorySchema.set('autoIndex', false);
categorySchema.set('autoCreate', false);

// Make sure no index gets created for title or slug
categorySchema.path('title').options.index = false;
if (categorySchema.path('slug')) {
  categorySchema.path('slug').options.index = false;
}

// Clean slug fields before saving
categorySchema.pre('save', function(next) {
  // Ensure slug is never null
  if (!this.slug) {
    this.slug = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

// Disable collection indexes via the model
Category.syncIndexes = function() {
  console.log('Sync indexes disabled to prevent automatic index creation');
  return Promise.resolve();
};

module.exports = Category;
