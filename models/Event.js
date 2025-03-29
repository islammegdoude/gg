// models/Event.js
const mongoose = require('mongoose');

/**
 * DEPRECATED MODEL
 * 
 * This model is kept for backwards compatibility but is no longer the primary way
 * to manage events. Events are now stored as subdocuments within the Category model.
 * 
 * New code should use the events array in the Category model rather than this standalone model.
 * The eventController now redirects all operations to work with the Category model.
 */

const eventSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  details: String
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
