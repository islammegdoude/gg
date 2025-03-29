// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: String, // Brief description for cards
  fullDescription: String,  // Comprehensive description for the product page
  imageUrl: String,
  status: String, // active, inactive
}, { timestamps: true });

// For backward compatibility - map the old 'description' field to 'shortDescription'
productSchema.virtual('description').get(function() {
  return this.shortDescription;
});

productSchema.virtual('description').set(function(value) {
  this.shortDescription = value;
});

// For backward compatibility - map the old 'details' field to 'fullDescription'
productSchema.virtual('details').get(function() {
  return this.fullDescription;
});

productSchema.virtual('details').set(function(value) {
  this.fullDescription = value;
});

module.exports = mongoose.model('Product', productSchema);
