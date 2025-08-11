export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Test API endpoint called');
    
    res.status(200).json({ 
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      method: req.method,
      url: req.url,
      headers: req.headers
    });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ 
      error: 'Test API error',
      message: error.message
    });
  }
} 