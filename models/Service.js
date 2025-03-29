// models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: String, // Brief description for cards
  fullDescription: String,  // Comprehensive description for the service page
  imageUrl: String,
  status: String,
}, { timestamps: true });

// For backward compatibility - map the old 'description' field to 'shortDescription'
serviceSchema.virtual('description').get(function() {
  return this.shortDescription;
});

serviceSchema.virtual('description').set(function(value) {
  this.shortDescription = value;
});

module.exports = mongoose.model('Service', serviceSchema);
