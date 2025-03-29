// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });
    
    // Check if password is correct
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Return token and admin info (without password)
    const adminData = admin.toObject();
    delete adminData.password;
    
    res.json({ token, admin: adminData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login process' });
  }
};

// Register controller - Only used for initial admin setup or creating additional admins
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new admin with hashed password
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin', // Default role
      status: 'active', // Default status
    });
    
    // Generate token for immediate login
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Return admin data without password
    const adminData = admin.toObject();
    delete adminData.password;
    
    res.status(201).json({ token, admin: adminData });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration process' });
  }
};

// Update admin credentials
exports.updateCredentials = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const adminId = req.admin._id; // From auth middleware
    
    // Find the admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    // Check current password if attempting to change password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      admin.password = hashedPassword;
    }
    
    // Update name and email if provided
    if (name) admin.name = name;
    
    // If email is changing, check if new email already exists
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email, _id: { $ne: adminId } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      admin.email = email;
    }
    
    // Save changes
    await admin.save();
    
    // Generate new token with updated info
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Return updated admin data without password
    const adminData = admin.toObject();
    delete adminData.password;
    
    res.json({ 
      message: "Credentials updated successfully", 
      token, 
      admin: adminData 
    });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ message: 'Server error during credentials update' });
  }
};

// Verify token and return admin data
exports.verifyToken = async (req, res) => {
  try {
    // The admin data is already attached by the isAuth middleware
    if (!req.admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Return admin data without password
    const adminData = req.admin.toObject();
    delete adminData.password;
    
    res.json({ admin: adminData });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
};
