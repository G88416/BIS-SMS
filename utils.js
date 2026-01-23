/**
 * BIS-SMS Security and Utility Functions
 * Common functions for input validation, sanitization, and error handling
 */

// XSS Protection: Escape HTML entities
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Safe localStorage operations with error handling
const safeStorage = {
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },
  
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  },
  
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  },
  
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Safe DOM element access with null checks
function safeGetElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id "${id}" not found`);
  }
  return element;
}

// Input validation functions
const validators = {
  isNotEmpty(value) {
    return value !== null && value !== undefined && value.trim() !== '';
  },
  
  isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isPhoneNumber(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },
  
  isNumber(value) {
    return !isNaN(value) && isFinite(value);
  },
  
  isPositiveNumber(value) {
    return validators.isNumber(value) && parseFloat(value) > 0;
  },
  
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },
  
  isAlphanumeric(value) {
    const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;
    return alphanumericRegex.test(value);
  }
};

// CSV validation and sanitization
function validateCSVData(data, requiredFields = []) {
  if (!data || !Array.isArray(data)) {
    return { valid: false, error: 'Invalid data format' };
  }
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (const field of requiredFields) {
      if (!row[field] || !validators.isNotEmpty(row[field])) {
        return { 
          valid: false, 
          error: `Missing required field "${field}" in row ${i + 1}` 
        };
      }
    }
  }
  
  return { valid: true };
}

// Safe CSV parsing
function parseCSV(csvText) {
  try {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
      return { success: false, error: 'Empty CSV file', data: [] };
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
    
    return { success: true, data, headers };
  } catch (error) {
    console.error('CSV parsing error:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// Show user-friendly error messages
function showError(message, elementId = null) {
  console.error('Error:', message);
  
  if (elementId) {
    const element = safeGetElement(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
      setTimeout(() => {
        element.style.display = 'none';
      }, 5000);
    }
  } else {
    alert(message); // Fallback to alert if no element specified
  }
}

// Show success messages
function showSuccess(message, elementId = null) {
  console.log('Success:', message);
  
  if (elementId) {
    const element = safeGetElement(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
      setTimeout(() => {
        element.style.display = 'none';
      }, 3000);
    }
  }
}

// Wait for DOM to be ready
function onDOMReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// Logout synchronization across tabs
function syncLogout() {
  // Clear session storage
  sessionStorage.clear();
  
  // Broadcast logout to other tabs
  localStorage.setItem('logout-event', Date.now().toString());
  
  // Redirect to login page
  window.location.href = 'index.html';
}

// Listen for logout events from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'logout-event') {
    sessionStorage.clear();
    window.location.href = 'index.html';
  }
});

// Validate portal access
function validatePortalAccess(requiredUserType) {
  const userType = sessionStorage.getItem('userType');
  const userId = sessionStorage.getItem('userId');
  
  if (!userType || !userId) {
    console.warn('Unauthorized access attempt - no user session');
    window.location.href = 'index.html';
    return false;
  }
  
  if (userType !== requiredUserType) {
    console.warn(`Unauthorized access attempt - wrong user type: ${userType} (expected: ${requiredUserType})`);
    window.location.href = 'index.html';
    return false;
  }
  
  return true;
}

// Export for use in modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    safeStorage,
    safeGetElement,
    validators,
    validateCSVData,
    parseCSV,
    showError,
    showSuccess,
    onDOMReady,
    syncLogout,
    validatePortalAccess
  };
}
