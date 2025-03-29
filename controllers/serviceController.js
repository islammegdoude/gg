// controllers/serviceController.js
const Service = require('../models/Service');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

exports.createService = async (req, res) => {
  try {
    console.log('Creating service with data:', { 
      ...req.body, 
      imageUrl: req.body.imageUrl ? (typeof req.body.imageUrl === 'string' ? 'image url exists' : 'image data exists') : 'no image'
    });
    
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // The imageUrl should already be uploaded to cloudinary using the upload endpoint
    // and the URL should be provided in the request
    const serviceData = {
      title: req.body.title,
      shortDescription: req.body.shortDescription || req.body.description,
      fullDescription: req.body.fullDescription,
      imageUrl: req.body.imageUrl,
      status : req.body.status
    };
    
    console.log('Service object created and ready to save');
    
    const service = new Service(serviceData);
    const savedService = await service.save();
    console.log('Service saved successfully with ID:', savedService._id);
    
    return res.status(201).json(savedService);
  } catch (err) {
    console.error('Error creating service:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors,
        error: err.message
      });
    }
    
    return res.status(500).json({ 
      message: "Failed to create service", 
      error: err.message 
    });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Active Services
exports.getActiveServices = async (req, res) => {
  try {
    const services = await Service.find({ status: 'active' });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    console.log('Updating service with data:', { 
      ...req.body, 
      imageUrl: req.body.imageUrl ? 'image url exists' : 'no image'
    });

    // Images should be uploaded separately using the upload API
    const serviceData = {
      title: req.body.title,
      shortDescription: req.body.shortDescription || req.body.description,
      fullDescription: req.body.fullDescription,
      status : req.body.status
    };

    // Only update imageUrl if a new one is provided
    if (req.body.imageUrl) {
      serviceData.imageUrl = req.body.imageUrl;
    }
    
    const service = await Service.findByIdAndUpdate(
      req.params.id, 
      serviceData, 
      { new: true, runValidators: true }
    );
    
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    console.error('Error updating service:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors,
        error: err.message
      });
    }
    
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    
    // Delete the service from the database
    await Service.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
