const ContactMessage = require('../models/ContactMessage');
const Admin = require('../models/Admin');

// Create a new contact message
exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create new message
    const contactMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      status: 'unread'
    });

    await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Get all messages (admin only)
exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .populate('readBy', 'name email');
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Get single message (admin only)
exports.getMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id)
      .populate('readBy', 'name email');
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  }
};

// Mark message as read (admin only)
exports.markAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Add admin to readBy array if not already present
    if (!message.readBy.includes(req.admin._id)) {
      message.readBy.push(req.admin._id);
    }

    message.status = 'read';
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
};

// Reply to message (admin only)
exports.replyToMessage = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Update message status and add reply
    message.status = 'replied';
    message.replyMessage = replyMessage;
    message.repliedAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Reply saved successfully'
    });
  } catch (error) {
    console.error('Error saving reply to message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save reply'
    });
  }
};

// Archive message (admin only)
exports.archiveMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.status = 'archived';
    await message.save();

    res.json({
      success: true,
      message: 'Message archived successfully'
    });
  } catch (error) {
    console.error('Error archiving message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive message'
    });
  }
};