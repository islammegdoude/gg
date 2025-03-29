// controllers/productController.js
const Product = require('../models/Product');
const { logger } = require('../utils/logger');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', { 
      ...req.body, 
      imageUrl: req.body.imageUrl ? (typeof req.body.imageUrl === 'string' ? 'image url exists' : 'image data exists') : 'no image'
    });
    
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required" 
      });
    }

    // The imageUrl should already be uploaded to cloudinary using the upload endpoint
    // and the URL should be provided in the request
    const productData = {
      title: req.body.title,
      shortDescription: req.body.shortDescription || req.body.description,
      fullDescription: req.body.fullDescription || req.body.details,
      imageUrl: req.body.imageUrl,
      status: req.body.status || 'active'
    };
    
    console.log('Product object created and ready to save');
    
    const product = new Product(productData);
    const savedProduct = await product.save();
    logger.info(`Product created: ${savedProduct._id}`);
    
    return res.status(201).json({
      success: true,
      data: savedProduct
    });
  } catch (err) {
    logger.error(`Error creating product: ${err.message}`);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        success: false,
        message: "Validation failed", 
        errors: validationErrors,
        error: err.message
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Failed to create product", 
      error: err.message 
    });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    logger.info(`Retrieved ${products.length} products`);
    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    logger.error(`Error getting products: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get products', 
      error: err.message 
    });
  }
};

// Get Active products
exports.getActiveProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" }).sort({ createdAt: -1 });
    
    logger.info(`Retrieved ${products.length} active products`);
    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    logger.error(`Error getting active products: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get active products', 
      error: err.message 
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      logger.warn(`Product not found: ${req.params.id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    logger.info(`Retrieved product: ${req.params.id}`);
    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    logger.error(`Error getting product: ${err.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get product', 
      error: err.message 
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    console.log('Updating product with data:', { 
      ...req.body, 
      imageUrl: req.body.imageUrl ? 'image url exists' : 'no image'
    });

    // Images should be uploaded separately using the upload API
    const productData = {
      title: req.body.title,
      shortDescription: req.body.shortDescription || req.body.description,
      fullDescription: req.body.fullDescription || req.body.details,
      status: req.body.status
    };

    // Only update imageUrl if a new one is provided
    if (req.body.imageUrl) {
      productData.imageUrl = req.body.imageUrl;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      logger.warn(`Product not found for update: ${req.params.id}`);
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    logger.info(`Product updated: ${req.params.id}`);
    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (err) {
    logger.error(`Error updating product: ${err.message}`);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        success: false,
        message: "Validation failed", 
        errors: validationErrors,
        error: err.message
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update product', 
      error: err.message 
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      logger.warn(`Product not found for deletion: ${req.params.id}`);
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    logger.info(`Product deleted: ${req.params.id}`);
    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (err) {
    logger.error(`Error deleting product: ${err.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete product', 
      error: err.message 
    });
  }
};
