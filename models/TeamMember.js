// models/TeamMember.js
const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: String,
  position: { type: String, required: true }, // Position in the company
  jobTitle: { type: String, required: true }, // Specific job title
  email: { type: String, required: true },
  imageUrl: String, // Photo of the team member
  description: String,
  isActive: { type: Boolean, default: true }, // Status of the team member
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
