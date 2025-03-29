// controllers/teamController.js
const TeamMember = require('../models/TeamMember');

exports.createTeamMember = async (req, res) => {
  try {
    // Validate required fields
    const { name, position, jobTitle, email } = req.body;
    if (!name || !position || !jobTitle || !email) {
      return res.status(400).json({ 
        message: 'Name, position, job title, and email are required fields' 
      });
    }

    const member = new TeamMember(req.body);
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    // Option to get only active members
    const isActive = req.query.active === 'true' ? true : req.query.active === 'false' ? false : null;
    
    let query = {};
    if (isActive !== null) {
      query.isActive = isActive;
    }
    
    const members = await TeamMember.find(query);
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeamMemberById = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Team member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    // Validate required fields
    const { name, position, jobTitle, email } = req.body;
    if (!name || !position || !jobTitle || !email) {
      return res.status(400).json({ 
        message: 'Name, position, job title, and email are required fields' 
      });
    }
    
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ message: "Team member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: "Team member not found" });
    res.json({ message: "Team member deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
