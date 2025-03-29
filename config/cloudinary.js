// config/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Configure with increased timeouts and enhanced settings for faster uploads
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000, // 120 seconds timeout
  secure: true,
  private_cdn: false, // Use Cloudinary's shared CDN
  secure_distribution: null, // Use default secure distribution
  cname: null, // No custom CNAME
  cdn_subdomain: true, // Use CDN subdomain for better performance
  use_root_path: false, // Don't use root path
  upload_chunked: true, // Use chunked uploads for better reliability with larger files
  chunk_size: 6000000, // 6MB chunks (recommended by Cloudinary)
  keep_source_tags: false // Don't keep source tags to reduce payload size
});

// Log configuration status at startup (without exposing secrets)
console.log('Cloudinary Configuration:', {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not set',
  apiKeyConfigured: !!process.env.CLOUDINARY_API_KEY,
  apiSecretConfigured: !!process.env.CLOUDINARY_API_SECRET,
  timeout: '120 seconds',
  secure: true,
  cdnSubdomain: true,
  chunkedUploads: true,
  chunkSize: '6MB'
});

module.exports = cloudinary;
