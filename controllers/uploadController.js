// controllers/uploadController.js
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const sharp = require('sharp');

// Function to check Cloudinary configuration and connection status
exports.checkCloudinaryStatus = async (req, res) => {
  try {
    console.log('\n==== CHECKING CLOUDINARY STATUS ====');
    
    // Validate basic configuration
    const config = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
      apiKeyPresent: !!process.env.CLOUDINARY_API_KEY,
      apiSecretPresent: !!process.env.CLOUDINARY_API_SECRET,
      configured: !!(
        process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET
      )
    };
    
    console.log('Cloudinary configuration:', {
      ...config,
      apiKey: config.apiKeyPresent ? '[PRESENT]' : '[MISSING]',
      apiSecret: config.apiSecretPresent ? '[PRESENT]' : '[MISSING]'
    });
    
    if (!config.configured) {
      return res.status(500).json({
        success: false,
        status: 'error',
        message: 'Cloudinary is not properly configured',
        config: {
          cloudName: config.cloudName || '[MISSING]',
          apiKeyPresent: config.apiKeyPresent,
          apiSecretPresent: config.apiSecretPresent
        }
      });
    }
    
    // Try to ping Cloudinary API to check connection
    try {
      console.log('Attempting to ping Cloudinary API...');
      
      // Use the ping method or a simple API call to test connection
      // This varies depending on the Cloudinary SDK version
      let connectionStatus;
      
      try {
        // Try resource method (doesn't require a real upload)
        const result = await cloudinary.api.resources({ 
          type: 'upload',
          prefix: 'vision-intek/test',
          max_results: 1
        });
        
        connectionStatus = {
          success: true,
          apiAccessible: true,
          rateLimits: {
            remaining: result.rate_limit_remaining || 'unknown',
            reset: result.rate_limit_reset || 'unknown'
          }
        };
      } catch (apiError) {
        console.error('Error checking Cloudinary resources:', apiError);
        
        // Even if we get an authentication error, we know we're connecting to the API
        if (apiError.error && apiError.error.message) {
          connectionStatus = {
            success: false,
            apiAccessible: true,
            error: apiError.error.message,
            suggests: 'Authentication issue with Cloudinary API'
          };
        } else {
          connectionStatus = {
            success: false,
            apiAccessible: false,
            error: apiError.message,
            suggests: 'Cannot connect to Cloudinary API'
          };
        }
      }
      
      return res.json({
        success: true,
        status: connectionStatus.success ? 'connected' : 'error',
        message: connectionStatus.success 
          ? 'Successfully connected to Cloudinary API' 
          : 'Error connecting to Cloudinary API',
        config: {
          cloudName: config.cloudName,
          apiKeyConfigured: config.apiKeyPresent,
          apiSecretConfigured: config.apiSecretPresent
        },
        connection: connectionStatus,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error checking Cloudinary status:', err);
      
      return res.status(500).json({
        success: false,
        status: 'error',
        message: 'Error checking Cloudinary connection',
        error: err.message,
        config: {
          cloudName: config.cloudName,
          apiKeyConfigured: config.apiKeyPresent,
          apiSecretConfigured: config.apiSecretPresent
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Unexpected error in checkCloudinaryStatus:', err);
    
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Unexpected error checking Cloudinary status',
      error: err.message
    });
  }
};

// Function to perform the stream upload with retries
const streamUploadWithRetry = async (buffer, folder, maxRetries = 3, retryDelay = 5000) => {
  let attempt = 0;
  let lastError = null;

  // Create the basic upload function
  const performUpload = () => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `vision-intek/${folder}`,
          resource_type: 'auto',
          timeout: 120000, // 120 seconds timeout for this specific upload
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || undefined, // Use upload preset if available
          eager: [
            { quality: 'auto:good', fetch_format: 'auto' } // Apply auto-optimization on Cloudinary's side
          ],
          eager_async: true, // Process optimizations asynchronously
          use_filename: true, // Use the original filename as the basis for the public ID
          unique_filename: true, // Ensure filenames are unique
          overwrite: false, // Don't overwrite existing files
          invalidate: true, // Invalidate CDN cache if overwriting
          chunk_size: 6000000 // 6MB chunk size for chunked uploads
        },
        (error, result) => {
          if (error) {
            console.log('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success. Result:', {
              public_id: result.public_id,
              secure_url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
            resolve(result);
          }
        }
      );
      
      // Create a new stream each time
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  };

  // Try to upload with retries
  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`Upload attempt ${attempt} of ${maxRetries}`);
      
      const result = await performUpload();
      return result; // Success - return the result
    } catch (error) {
      lastError = error;
      
      // If this is the last attempt, don't wait
      if (attempt >= maxRetries) {
        console.log(`All ${maxRetries} upload attempts failed.`);
        break;
      }
      
      // Wait before retrying
      console.log(`Upload attempt ${attempt} failed. Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // If we get here, all attempts failed
  throw lastError;
};

// Function to optimize the image before uploading
const optimizeImage = async (buffer, mimetype) => {
  try {
    console.log('Optimizing image before upload, original size:', buffer.length, 'bytes');
    
    // Create Sharp instance
    const image = sharp(buffer);
    
    // Get image metadata
    const metadata = await image.metadata();
    console.log('Image metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length
    });
    
    // Only resize if image is very large
    let resizedImage = image;
    if (metadata.width > 1920 || metadata.height > 1920) {
      console.log('Image too large, resizing...');
      resizedImage = image.resize({
        width: Math.min(metadata.width, 1920),
        height: Math.min(metadata.height, 1920),
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Optimize based on mimetype
    let optimizedBuffer;
    if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
      optimizedBuffer = await resizedImage.jpeg({ quality: 80, progressive: true }).toBuffer();
    } else if (mimetype === 'image/png') {
      optimizedBuffer = await resizedImage.png({ compressionLevel: 9, progressive: true }).toBuffer();
    } else if (mimetype === 'image/webp') {
      optimizedBuffer = await resizedImage.webp({ quality: 80 }).toBuffer();
    } else if (mimetype === 'image/gif') {
      // GIFs are difficult to optimize without losing animation
      optimizedBuffer = buffer;
    } else {
      // Default case - convert to jpeg
      optimizedBuffer = await resizedImage.jpeg({ quality: 80, progressive: true }).toBuffer();
    }
    
    console.log('Image optimized, new size:', optimizedBuffer.length, 'bytes',
      'Reduction:', Math.round((1 - optimizedBuffer.length / buffer.length) * 100) + '%');
    
    return optimizedBuffer;
  } catch (error) {
    console.error('Error optimizing image:', error);
    // Return original buffer if optimization fails
    return buffer;
  }
};

exports.uploadImage = async (req, res) => {
  try {
    console.log('\n==== STANDARD UPLOAD REQUEST ====');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Query params:', req.query);
    
    if (!req.file) {
      console.log('Error: No file in request');
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
    }

    console.log('File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size, 
      buffer: req.file.buffer ? `${req.file.buffer.length} bytes` : 'No buffer'
    });

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.log('Error: Invalid file type -', req.file.mimetype);
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed."
      });
    }

    // Maximum file size 10MB (increased from 5MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      console.log('Error: File too large -', req.file.size, 'bytes');
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB."
      });
    }

    // Upload to Cloudinary with folder structure
    try {
      // Log Cloudinary config (without sensitive info)
      console.log('Cloudinary Config:', {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not set',
        apiKeyStatus: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
        apiSecretStatus: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
      });
      
      const folder = req.query.folder || 'general';
      console.log('Using folder:', folder);
      
      // Use the new retry-enabled upload function
      console.log('Starting upload with retry logic and extended timeout');
      try {
        const optimizedBuffer = await optimizeImage(req.file.buffer, req.file.mimetype);
        const result = await streamUploadWithRetry(optimizedBuffer, folder, 3, 5000);
        
        console.log('Upload completed successfully with retry logic');
        res.json({
          success: true,
          imageUrl: result.secure_url,
          publicId: result.public_id,
          metadata: {
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type,
            size: result.bytes
          }
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error after retries:', cloudinaryError);
        
        // Check if it's a timeout error
        if (cloudinaryError.message === 'Cloudinary upload timeout' || 
            cloudinaryError.message.includes('timed out')) {
          // In case of timeout, we'll try one more time to check if the image was actually uploaded
          // by searching for a file with similar name pattern
          try {
            console.log('Upload timed out, checking if image was actually uploaded');
            
            // Extract a search prefix from the original filename
            const originalFilename = req.file.originalname;
            const searchPrefix = originalFilename.split('.')[0]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '')
              .substring(0, 10); // Use first part of filename as a search pattern
            
            console.log(`Searching for recent uploads in folder vision-intek/${folder} with prefix ${searchPrefix}`);
            
            // Delay a moment to allow for possible completion
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check recent uploads that might match this file
            const searchResult = await cloudinary.search
              .expression(`folder:vision-intek/${folder} AND created_at>=${Math.floor(Date.now()/1000) - 300}`)
              .sort_by('created_at', 'desc')
              .max_results(5)
              .execute();
            
            if (searchResult && searchResult.resources && searchResult.resources.length > 0) {
              // Found recent uploads, check if any match our filename pattern
              console.log(`Found ${searchResult.resources.length} recent uploads`);
              
              // Look for matches with our prefix
              const possibleMatches = searchResult.resources.filter(resource => 
                resource.public_id.toLowerCase().includes(searchPrefix));
              
              if (possibleMatches.length > 0) {
                console.log('Found possible match for the timed out upload:', possibleMatches[0].public_id);
                
                // Return the first matching resource
                return res.json({
                  success: true,
                  imageUrl: possibleMatches[0].secure_url,
                  publicId: possibleMatches[0].public_id,
                  metadata: {
                    width: possibleMatches[0].width,
                    height: possibleMatches[0].height,
                    format: possibleMatches[0].format,
                    resourceType: 'image',
                    size: possibleMatches[0].bytes || 0
                  },
                  note: 'Retrieved after timeout - verify image is correct'
                });
              }
            }
            
            // If we get here, no matches were found
            console.log('No matching resources found after timeout');
          } catch (recoveryError) {
            console.error('Error while trying to recover from timeout:', recoveryError);
          }
        }
        
        // If we get here, either it wasn't a timeout or recovery failed
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to cloud storage",
          error: cloudinaryError.message
        });
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      
      res.status(500).json({ 
        success: false,
        message: "Error uploading file", 
        error: err.message 
      });
    }
  } catch (err) {
    console.error('Error uploading file:', err);
    
    res.status(500).json({ 
      success: false,
      message: "Error uploading file", 
      error: err.message 
    });
  }
};

// Test upload endpoint that includes more debugging information
exports.testUpload = async (req, res) => {
  try {
    console.log('\n==== TEST UPLOAD ENDPOINT ====');
    console.log('Request headers:', {
      contentType: req.headers['content-type'],
      authorization: req.headers.authorization ? 'Bearer [token present]' : 'No authorization',
      contentLength: req.headers['content-length'] || 'Not specified'
    });
    
    // Validate Cloudinary configuration
    const cloudinaryConfig = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '[MISSING]',
      apiKeyPresent: !!process.env.CLOUDINARY_API_KEY,
      apiSecretPresent: !!process.env.CLOUDINARY_API_SECRET
    };
    
    console.log('Cloudinary configuration check:', cloudinaryConfig);
    
    if (cloudinaryConfig.cloudName === '[MISSING]') {
      console.error('ERROR: Cloudinary cloud name is missing from environment');
      return res.status(500).json({
        success: false,
        message: "Cloudinary configuration error: Cloud name is missing",
        diagnostics: {
          cloudinaryConfig,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (!cloudinaryConfig.apiKeyPresent || !cloudinaryConfig.apiSecretPresent) {
      console.error('ERROR: Cloudinary API credentials are missing');
      return res.status(500).json({
        success: false,
        message: "Cloudinary configuration error: API credentials are missing",
        diagnostics: {
          cloudinaryConfig,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded",
        diagnostics: {
          requestBodyKeys: Object.keys(req.body),
          requestHasFiles: !!req.files,
          cloudinaryConfig,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Log file details
    const fileDetails = {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? `${req.file.buffer.length} bytes` : 'No buffer'
    };
    console.log('File details:', fileDetails);
    
    // Log request parameters
    console.log('Request query parameters:', req.query);
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.log('Invalid file type:', req.file.mimetype);
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed.",
        diagnostics: {
          fileDetails,
          allowedTypes,
          cloudinaryConfig,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Maximum file size 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      console.log('File too large:', req.file.size, 'bytes');
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
        diagnostics: {
          fileDetails,
          maxSize,
          cloudinaryConfig,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Upload to Cloudinary with folder structure
    try {
      const folder = req.query.folder || 'test';
      console.log('Using folder:', folder);
      
      // Create stream from buffer and upload directly to Cloudinary
      const streamUpload = async (buffer) => {
        return new Promise((resolve, reject) => {
          console.log('Starting Cloudinary upload stream with config:', {
            folder: `vision-intek/${folder}`,
            resource_type: 'auto'
          });
          
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `vision-intek/${folder}`,
              resource_type: 'auto'
            },
            (error, result) => {
              if (error) {
                console.log('Cloudinary upload error:', error);
                reject(error);
              } else {
                console.log('Cloudinary upload success. Result:', {
                  public_id: result.public_id,
                  secure_url: result.secure_url,
                  width: result.width,
                  height: result.height,
                  format: result.format,
                  bytes: result.bytes
                });
                resolve(result);
              }
            }
          );
          
          // Log before piping to upload stream
          console.log('Piping buffer to upload stream...');
          streamifier.createReadStream(buffer).pipe(uploadStream);
        });
      };
      
      // Upload with timeout and detailed error handling
      try {
        console.log('Starting upload with timeout');
        
        // Optimize the image before uploading
        const optimizedBuffer = await optimizeImage(req.file.buffer, req.file.mimetype);
        
        const result = await Promise.race([
          streamUpload(optimizedBuffer),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Cloudinary upload timeout after 120 seconds')), 120000)
          )
        ]);

        console.log('Upload completed successfully, returning response');
        const response = {
          success: true,
          imageUrl: result.secure_url,
          publicId: result.public_id,
          metadata: {
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type,
            size: result.bytes
          },
          diagnostics: {
            timestamp: new Date().toISOString(),
            processedBy: 'testUpload',
            folder: `vision-intek/${folder}`,
            cloudinaryConfig,
            fileDetails,
            uploadDuration: 'Unknown' // We could add timing if needed
          }
        };
        
        console.log('Returning response:', response);
        res.json(response);
      } catch (timeoutError) {
        console.error('Upload timeout or race error:', timeoutError);
        return res.status(500).json({
          success: false,
          message: "Upload timed out after 120 seconds",
          error: timeoutError.message,
          diagnostics: {
            fileDetails,
            cloudinaryConfig,
            folder: `vision-intek/${folder}`,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to cloud storage",
        error: cloudinaryError.message,
        diagnostics: {
          fileDetails,
          cloudinaryConfig,
          folder: req.query.folder ? `vision-intek/${req.query.folder}` : 'vision-intek/test',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (err) {
    console.error('Error in test upload endpoint:', err);
    
    res.status(500).json({ 
      success: false,
      message: "Error uploading file", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      diagnostics: {
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV || 'not set'
      }
    });
  }
};
