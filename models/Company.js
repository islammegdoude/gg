// models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: String,
  description: String,
  email: String,
  phone: String,
  address: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  heroImages: [{
    imageUrl: String,
    title: String,
    subtitle: String,
    buttonText: String,
    buttonLink: String
  }],
  heroStats: {
    yearsExperience: { type: Number, default: 10 },
    projectsCompleted: { type: Number, default: 500 }
  },
  logo: {
    imageUrl: String,
    altText: String
  },
  faq: [{ question: String, answer: String }]
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
