require('dotenv').config();
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers middleware
// Note: 'unsafe-inline' is currently required for inline scripts in HTML files
// TODO: Refactor to use external JS files and implement nonce-based CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com", "https://firebasestorage.googleapis.com", "https://*.firebaseapp.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Serve static files from the current directory
app.use(express.static(path.join(__dirname), {
  dotfiles: 'deny',  // Prevent access to hidden files
  index: 'index.html'
}));

const startTime = Date.now();

// Health check endpoint (no rate limit for monitoring)
app.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: uptime,
    version: require('./package.json').version
  });
});

// Fallback to index.html for specific routes (not all paths)
// This supports client-side routing while protecting against path traversal
app.get(['/', '/admin', '/student', '/teacher', '/parent'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BIS-SMS Server running on http://localhost:${PORT}`);
});
