const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread'
  },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
  repliedAt: Date,
  replyMessage: String
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', contactMessageSchema); 