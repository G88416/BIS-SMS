const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname), {
  dotfiles: 'deny',  // Prevent access to hidden files
  index: 'index.html'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Fallback to index.html for specific routes (not all paths)
// This supports client-side routing while protecting against path traversal
app.get(['/', '/admin', '/student', '/teacher', '/parent'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BIS-SMS Server running on http://localhost:${PORT}`);
});
