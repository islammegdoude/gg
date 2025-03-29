// controllers/partnerController.js
const Partner = require('../models/Partner');

exports.createPartner = async (req, res) => {
  try {
    const { name,logo, website, description } = req.body;
    const partner = new Partner({
      name,
      logo,
      website,
      description
    });
    await partner.save();
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPartners = async (req, res) => {
  try {
    const partners = await Partner.find();
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    res.json({ message: "Partner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
