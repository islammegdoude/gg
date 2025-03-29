// controllers/companyController.js
const Company = require('../models/Company');

// Helper to validate image URLs
const validateImageUrl = (url) => {
  console.log(`Validating image URL: "${url}"`);
  
  if (!url) {
    console.log('Empty image URL, returning empty string');
    return '';
  }
  
  // Remove any whitespace
  const trimmedUrl = url.trim();
  
  // If it's a URL starting with http, return as is
  if (trimmedUrl.startsWith('http')) {
    console.log('URL starts with http, returning as is');
    return trimmedUrl;
  }
  
  // If partial cloudinary URL without protocol
  if (trimmedUrl.includes('cloudinary') && !trimmedUrl.startsWith('https://')) {
    console.log('Adding https:// to Cloudinary URL');
    return `https://${trimmedUrl}`;
  }
  
  // If it's a relative path, keep as is for getImageUrl to handle
  console.log('Treating as relative path');
  return trimmedUrl;
};

// Helper to process hero images
const processHeroImages = (heroImages) => {
  console.log('Processing hero images array:', 
    Array.isArray(heroImages) ? `Array with ${heroImages.length} items` : typeof heroImages);
  
  if (!Array.isArray(heroImages)) {
    console.log('heroImages is not an array, returning empty array');
    return [];
  }
  
  console.log(`Processing ${heroImages.length} hero images`);
  
  return heroImages.map((hero, index) => {
    console.log(`Processing hero image at index ${index}:`, hero);
    
    // Ensure all required fields exist
    const processed = {
      imageUrl: validateImageUrl(hero.imageUrl),
      title: hero.title || '',
      subtitle: hero.subtitle || '',
      buttonText: hero.buttonText || '',
      buttonLink: hero.buttonLink || ''
    };
    
    console.log(`Processed hero image ${index}:`, {
      ...processed,
      imageUrl: processed.imageUrl ? `[URL exists: ${processed.imageUrl.substring(0, 20)}...]` : '[No URL]'
    });
    
    return processed;
  });
};

exports.getCompanyInfo = async (req, res) => {
  try {
    const company = await Company.findOne();
    
    // If no company data exists yet, create default empty data
    if (!company) {
      const defaultCompany = new Company({
        name: 'Vision Intek',
        description: 'Electrical Engineering Solutions',
        email: 'contact@example.com',
        phone: '',
        address: '',
        socialMedia: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: '',
          youtube: ''
        },
        heroImages: [],
        logo: {
          imageUrl: '',
          altText: 'Vision Intek'
        },
        faq: []
      });
      
      await defaultCompany.save();
      return res.json(defaultCompany);
    }
    
    res.json(company);
  } catch (err) {
    console.error('Error getting company info:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateCompanyInfo = async (req, res) => {
  try {
    console.log('Updating company info with data:', {
      ...req.body,
      // Hide sensitive data in logs
      socialMedia: req.body.socialMedia ? 'social media data exists' : undefined,
      heroImages: req.body.heroImages ? `${req.body.heroImages.length} hero images` : undefined,
      logo: req.body.logo ? 'logo data exists' : undefined
    });
    
    // More detailed logging of heroImages if they exist
    if (req.body.heroImages && Array.isArray(req.body.heroImages)) {
      console.log('Hero Images structure received:');
      req.body.heroImages.forEach((hero, idx) => {
        console.log(`Hero ${idx} - imageUrl: ${hero.imageUrl ? 'Present' : 'Missing'}, title: ${hero.title ? 'Present' : 'Missing'}`);
      });
    }
    
    let company = await Company.findOne();
    
    if (!company) {
      // Sanitize input data before creating
      if (req.body.heroImages) {
        req.body.heroImages = processHeroImages(req.body.heroImages);
      }
      
      if (req.body.logo) {
        req.body.logo = {
          imageUrl: validateImageUrl(req.body.logo.imageUrl),
          altText: req.body.logo.altText || 'Company Logo'
        };
      }
      
      company = new Company(req.body);
      await company.save();
      console.log('Created new company record with ID:', company._id);
    } else {
      // Perform a deep merge to avoid overwriting unspecified fields
      const updateData = {};
      
      // Merge top-level fields
      ['name', 'description', 'email', 'phone', 'address'].forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      // Handle social media special field
      if (req.body.socialMedia) {
        updateData.socialMedia = {
          ...company.socialMedia || {},
          ...req.body.socialMedia
        };
      }
      
      // Handle hero stats
      if (req.body.heroStats) {
        console.log('Updating hero stats:', req.body.heroStats);
        updateData.heroStats = {
          ...company.heroStats || { yearsExperience: 10, projectsCompleted: 500 },
          ...req.body.heroStats
        };
      }
      
      // Handle hero images - if provided, replace completely but validate first
      if (req.body.heroImages) {
        // Process and validate all hero images
        updateData.heroImages = processHeroImages(req.body.heroImages);
        console.log(`Processed ${updateData.heroImages.length} hero images for database update`);
      }
      
      // Handle logo
      if (req.body.logo) {
        const validatedImageUrl = validateImageUrl(req.body.logo.imageUrl);
        console.log('Logo image URL (validated):', validatedImageUrl.substring(0, 30) + '...');
        
        updateData.logo = {
          ...company.logo || {},
          ...req.body.logo,
          imageUrl: validatedImageUrl
        };
      }
      
      // Handle FAQ items
      if (req.body.faq) {
        updateData.faq = req.body.faq;
      }
      
      // Log the final update data before saving
      console.log('Final update data structure:', JSON.stringify(updateData, null, 2));
      
      company = await Company.findByIdAndUpdate(
        company._id, 
        { $set: updateData }, 
        { new: true, runValidators: true }
      );
      console.log('Updated company record with ID:', company._id);
    }
    
    console.log('Returning updated company data to frontend');
    res.json(company);
  } catch (err) {
    console.error('Error updating company info:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get only the social media links
exports.getSocialMedia = async (req, res) => {
  try {
    const company = await Company.findOne().select('socialMedia');
    
    if (!company) {
      return res.json({
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: ''
      });
    }
    
    res.json(company.socialMedia || {});
  } catch (err) {
    console.error('Error getting social media info:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get only the hero images
exports.getHeroImages = async (req, res) => {
  try {
    const company = await Company.findOne().select('heroImages');
    
    if (!company) {
      return res.json([]);
    }
    
    // Log the hero images being returned for debugging
    console.log(`Returning ${company.heroImages?.length || 0} hero images`);
    if (company.heroImages?.length > 0) {
      company.heroImages.forEach((hero, idx) => {
        console.log(`Hero ${idx} has URL: ${hero.imageUrl ? 'Yes' : 'No'}`);
      });
    }
    
    res.json(company.heroImages || []);
  } catch (err) {
    console.error('Error getting hero images:', err);
    res.status(500).json({ message: err.message });
  }
};

// Diagnostic endpoint to check company data integrity
exports.getDiagnosticData = async (req, res) => {
  try {
    console.log('Running company diagnostics...');
    const Company = require('../models/Company');
    const company = await Company.findOne();
    
    if (!company) {
      console.log('No company data found in database');
      return res.status(404).json({ 
        success: false, 
        message: 'No company data found in database'
      });
    }
    
    // Check image URLs are properly formatted
    const checkImageUrl = (url) => {
      if (!url) return { valid: false, reason: 'URL is empty' };
      if (typeof url !== 'string') return { valid: false, reason: 'URL is not a string' };
      
      // Check if URL is properly formatted
      try {
        // Check if it's a valid URL format
        if (url.startsWith('http')) {
          new URL(url); // This will throw if invalid
          return { valid: true, url };
        }
        
        // If it's a cloudinary path without protocol
        if (url.includes('cloudinary') && !url.startsWith('https://')) {
          const fullUrl = `https://${url}`;
          try {
            new URL(fullUrl);
            return { valid: true, url: fullUrl };
          } catch (e) {
            return { valid: false, reason: 'Invalid Cloudinary URL format', url };
          }
        }
        
        // If it's a relative path in our Cloudinary account
        // We consider it valid for our diagnostic purposes
        return { valid: true, url: `[Relative Path: ${url}]` };
      } catch (e) {
        return { valid: false, reason: e.message, url };
      }
    };
    
    // Create a detailed report
    const report = {
      _id: company._id?.toString(),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      basicInfo: {
        name: company.name || 'MISSING',
        hasDescription: !!company.description,
        descriptionLength: company.description?.length || 0,
        hasEmail: !!company.email,
        hasPhone: !!company.phone,
        hasAddress: !!company.address
      },
      heroImages: {
        count: company.heroImages?.length || 0,
        details: Array.isArray(company.heroImages) 
          ? company.heroImages.map(img => {
              const urlCheck = checkImageUrl(img.imageUrl);
              return {
                imageUrl: img.imageUrl,
                imageUrlValid: urlCheck.valid,
                imageUrlDetails: urlCheck.reason || 'Valid',
                title: !!img.title,
                titleText: img.title?.substring(0, 30) || '',
                subtitle: !!img.subtitle,
                subtitleLength: img.subtitle?.length || 0,
                hasButtonText: !!img.buttonText,
                hasButtonLink: !!img.buttonLink
              };
            })
          : []
      },
      logo: {
        hasLogo: !!company.logo,
        imageUrl: company.logo?.imageUrl || 'MISSING',
        imageUrlValid: company.logo ? checkImageUrl(company.logo.imageUrl).valid : false,
        imageUrlDetails: company.logo ? (checkImageUrl(company.logo.imageUrl).reason || 'Valid') : 'No logo object',
        altText: company.logo?.altText || 'MISSING'
      },
      socialMedia: {
        hasSocialMedia: !!company.socialMedia,
        facebook: !!company.socialMedia?.facebook,
        twitter: !!company.socialMedia?.twitter,
        instagram: !!company.socialMedia?.instagram,
        linkedin: !!company.socialMedia?.linkedin,
        youtube: !!company.socialMedia?.youtube
      },
      faq: {
        count: company.faq?.length || 0
      },
      timestamps: {
        lastUpdated: company.updatedAt ? new Date(company.updatedAt).toISOString() : 'Unknown',
        created: company.createdAt ? new Date(company.createdAt).toISOString() : 'Unknown',
        timeSinceUpdate: company.updatedAt ? `${Math.round((Date.now() - new Date(company.updatedAt)) / 1000 / 60)} minutes ago` : 'Unknown'
      }
    };
    
    console.log('Diagnostic report generated successfully');
    res.json(report);
  } catch (err) {
    console.error('Error generating diagnostic report:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating diagnostic report', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
