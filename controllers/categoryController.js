// controllers/categoryController.js
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

/**
 * Create a new category
 * @route POST /api/categories
 * @access Private/Admin
 */
exports.createCategory = async (req, res) => {
  try {
    console.log('Creating category with data:', req.body);
    
    // Create category with new structure
    const categoryData = { ...req.body };
    
    // Explicitly exclude any slug field that might be sent
    if (categoryData.slug) {
      delete categoryData.slug;
    }
    
    // Check if a category with the same title already exists
    console.log('Checking for existing category with title:', categoryData.title);
    const existingCategory = await Category.findOne({ 
      title: categoryData.title
    });
    
    if (existingCategory) {
      console.log('Found existing category with same title:', existingCategory._id);
      return res.status(400).json({
        success: false,
        message: "A category with this title already exists. Please use a different title."
      });
    }
    
    console.log('No existing category found, creating new one');
    const category = new Category(categoryData);
    
    try {
      await category.save();
      console.log('Category saved successfully with ID:', category._id);
      
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (saveError) {
      console.error('Error saving category:', saveError);
      
      // Handle duplicate key errors specifically
      if (saveError.name === 'MongoServerError' && saveError.code === 11000) {
        console.error('Duplicate key error details:', JSON.stringify(saveError));
        
        // Check which field caused the duplicate key error
        const field = Object.keys(saveError.keyPattern)[0];
        console.log('Duplicate field:', field);
        
        // If it's a title field conflict, suggest a modified title
        if (field === 'title' || saveError.message.includes('title')) {
          // Attempt to create a unique title by appending a timestamp
          const newTitle = `${categoryData.title} (${Date.now()})`;
          console.log('Trying with modified title:', newTitle);
          
          categoryData.title = newTitle;
          
          try {
            const updatedCategory = new Category(categoryData);
            await updatedCategory.save();
            
            return res.status(201).json({
              success: true,
              data: updatedCategory,
              message: "Category created with a modified title due to duplicate"
            });
          } catch (retryError) {
            console.error('Error creating category with modified title:', retryError);
            return res.status(400).json({
              success: false,
              message: "Unable to create category even with a modified title. Please use a different title."
            });
          }
        }
        
        // For other duplicate key errors
        return res.status(400).json({ 
          success: false, 
          message: "Category with this data already exists"
        });
      }
      
      // Re-throw other errors
      throw saveError;
    }
  } catch (err) {
    console.error('Error creating category:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    // Add more detailed error information
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }
};

/**
 * Get all categories with optional filtering
 * @route GET /api/categories
 * @access Public
 */
exports.getCategories = async (req, res) => {
  try {
    const query = {};
    
    // Filter active/inactive
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    const categories = await Category.find(query)
      .sort({ displayOrder: 1, title: 1 });
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching categories", 
      error: err.message 
    });
  }
};

/**
 * Get category by ID
 * @route GET /api/categories/:id
 * @access Public
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error('Error fetching category:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching category", 
      error: err.message 
    });
  }
};

/**
 * Update a category
 * @route PUT /api/categories/:id
 * @access Private/Admin
 */
exports.updateCategory = async (req, res) => {
  try {
    // Update category with new structure
    const updateData = { ...req.body };
    
    // Explicitly exclude any slug field that might be sent
    if (updateData.slug) {
      delete updateData.slug;
    }
    
    // Check if a category with the same title already exists
    if (updateData.title) {
      const existingCategory = await Category.findOne({ 
        title: updateData.title,
        _id: { $ne: req.params.id } // Exclude current category
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "A category with this title already exists. Please use a different title."
        });
      }
    }
    
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!category) {
        return res.status(404).json({ 
          success: false, 
          message: "Category not found" 
        });
      }
      
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (updateError) {
      // Handle duplicate key errors specifically
      if (updateError.name === 'MongoServerError' && updateError.code === 11000) {
        console.error('Duplicate key error in updateCategory:', updateError);
        
        // Check which field caused the duplicate key error
        const field = Object.keys(updateError.keyPattern)[0];
        
        // If it's a title field conflict, suggest a modified title
        if (field === 'title' || updateError.message.includes('title')) {
          // Attempt to create a unique title by appending a timestamp
          updateData.title = `${updateData.title} (${Date.now()})`;
          
          try {
            const updatedCategory = await Category.findByIdAndUpdate(
              req.params.id,
              updateData,
              { new: true, runValidators: true }
            );
            
            if (!updatedCategory) {
              return res.status(404).json({ 
                success: false, 
                message: "Category not found" 
              });
            }
            
            return res.status(200).json({
              success: true,
              data: updatedCategory,
              message: "Category updated with a modified title due to duplicate"
            });
          } catch (retryError) {
            console.error('Error updating category with modified title:', retryError);
            return res.status(400).json({
              success: false,
              message: "Unable to update category even with a modified title. Please use a different title."
            });
          }
        }
        
        // For other duplicate key errors
        return res.status(400).json({ 
          success: false, 
          message: "Category with this data already exists" 
        });
      }
      
      // Re-throw other errors
      throw updateError;
    }
  } catch (err) {
    console.error('Error updating category:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error updating category", 
      error: err.message 
    });
  }
};

/**
 * Delete category
 * @route DELETE /api/categories/:id
 * @access Private/Admin
 */
exports.deleteCategory = async (req, res) => {
  try {
    // Check if category has subcategories
    const hasSubcategories = await Category.exists({ parentCategory: req.params.id });
    if (hasSubcategories) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with subcategories. Please delete or reassign subcategories first."
      });
    }
    
    // Find the category to get image info before deleting
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }
    
    // Delete the Cloudinary image if it exists
    if (category.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(category.imagePublicId);
      } catch (cloudinaryErr) {
        console.error('Error deleting image from Cloudinary:', cloudinaryErr);
        // Continue with deletion even if image removal fails
      }
    }
    
    // Delete the category
    await category.deleteOne();
    
    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting category", 
      error: err.message 
    });
  }
};

/**
 * Bulk update categories order
 * @route PATCH /api/categories/reorder
 * @access Private/Admin
 */
exports.reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body;
    
    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({
        success: false,
        message: "categoryOrders must be an array"
      });
    }
    
    const updatePromises = categoryOrders.map(item => {
      return Category.findByIdAndUpdate(
        item.id,
        { displayOrder: item.order },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: "Categories reordered successfully"
    });
  } catch (err) {
    console.error('Error reordering categories:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error reordering categories", 
      error: err.message 
    });
  }
};

/**
 * Get all events for a specific category
 * @route GET /api/categories/:id/events
 * @access Public
 */
exports.getCategoryEvents = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the category exists and get its events
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    // Return events array from the category
    res.json({
      success: true,
      count: category.events.length,
      data: category.events
    });
  } catch (err) {
    console.error('Error fetching category events:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching category events",
      error: err.message
    });
  }
};

/**
 * Create a new event for a specific category
 * @route POST /api/categories/:id/events
 * @access Private/Admin
 */
exports.createCategoryEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    // Add event to the category's events array
    category.events.push(req.body);
    await category.save();
    
    // Return the newly created event
    const newEvent = category.events[category.events.length - 1];
    
    res.status(201).json({
      success: true,
      data: newEvent
    });
  } catch (err) {
    console.error('Error creating category event:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating category event",
      error: err.message
    });
  }
};

/**
 * Update an event in a specific category
 * @route PUT /api/categories/:categoryId/events/:eventId
 * @access Private/Admin
 */
exports.updateCategoryEvent = async (req, res) => {
  try {
    const { categoryId, eventId } = req.params;
    
    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    // Find the event in the category's events array
    const eventIndex = category.events.findIndex(event => event._id.toString() === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Event not found in this category"
      });
    }
    
    // Update the event
    Object.keys(req.body).forEach(key => {
      category.events[eventIndex][key] = req.body[key];
    });
    
    await category.save();
    
    res.json({
      success: true,
      data: category.events[eventIndex]
    });
  } catch (err) {
    console.error('Error updating category event:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error updating category event",
      error: err.message
    });
  }
};

/**
 * Delete an event from a specific category
 * @route DELETE /api/categories/:categoryId/events/:eventId
 * @access Private/Admin
 */
exports.deleteCategoryEvent = async (req, res) => {
  try {
    const { categoryId, eventId } = req.params;
    
    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    // Remove the event from the category's events array
    const eventIndex = category.events.findIndex(event => event._id.toString() === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Event not found in this category"
      });
    }
    
    category.events.splice(eventIndex, 1);
    await category.save();
    
    res.json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting category event:', err);
    res.status(500).json({
      success: false,
      message: "Error deleting category event",
      error: err.message
    });
  }
};
