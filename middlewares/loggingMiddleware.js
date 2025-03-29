// middlewares/loggingMiddleware.js
const apiLogger = (req, res, next) => {
  // Save original send method
  const originalSend = res.send;
  
  // Get timestamp
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Log the request
  console.log(`\n[${timestamp}] [REQ ${requestId}] ${req.method} ${req.originalUrl}`);
  
  // Skip logging the body for image uploads
  const isImageUpload = req.originalUrl.includes('/upload') && req.method === 'POST';
  if (!isImageUpload && req.body && Object.keys(req.body).length > 0) {
    try {
      // Replace potentially sensitive/large fields with placeholders
      const sanitizedBody = { ...req.body };
      
      // Handle specific known fields
      if (sanitizedBody.heroImages) {
        sanitizedBody.heroImages = sanitizedBody.heroImages.map(img => ({
          ...img,
          imageUrl: img.imageUrl ? `[URL:${img.imageUrl.substring(0, 20)}...]` : null
        }));
      }
      
      if (sanitizedBody.logo && sanitizedBody.logo.imageUrl) {
        sanitizedBody.logo = {
          ...sanitizedBody.logo,
          imageUrl: `[URL:${sanitizedBody.logo.imageUrl.substring(0, 20)}...]`
        };
      }
      
      console.log(`[${timestamp}] [REQ ${requestId}] Body:`, 
        JSON.stringify(sanitizedBody, null, 2).substring(0, 1000) + 
        (JSON.stringify(sanitizedBody).length > 1000 ? '... [truncated]' : '')
      );
    } catch (e) {
      console.log(`[${timestamp}] [REQ ${requestId}] Body: [Unable to stringify]`);
    }
  }
  
  // Override send method to log response
  res.send = function (body) {
    // Log the response status
    console.log(`[${timestamp}] [RES ${requestId}] Status: ${res.statusCode}`);
    
    // Log response body (if it's not too large and not binary)
    if (body && typeof body === 'string' && body.length < 1000 && !body.includes('data:image')) {
      try {
        // Try to parse JSON
        const parsed = JSON.parse(body);
        // Remove potentially sensitive or large fields
        if (parsed.imageUrl) parsed.imageUrl = `[URL:${parsed.imageUrl.substring(0, 20)}...]`;
        if (parsed.heroImages) parsed.heroImages = `[${parsed.heroImages.length} items]`;
        
        console.log(`[${timestamp}] [RES ${requestId}] Body:`, JSON.stringify(parsed, null, 2));
      } catch (e) {
        // Not JSON or can't be parsed
        console.log(`[${timestamp}] [RES ${requestId}] Body: [Response body is not JSON or too large]`);
      }
    } else {
      console.log(`[${timestamp}] [RES ${requestId}] Body: [Response body omitted]`);
    }
    
    // Call original send
    originalSend.call(this, body);
  };
  
  next();
};

module.exports = { apiLogger }; 