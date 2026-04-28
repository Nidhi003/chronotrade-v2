// Security utilities for ChronoTradez

export const securityUtils = {
  // Sanitize HTML to prevent XSS
  sanitizeHtml: (input) => {
    if (!input) return '';
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  // Sanitize string input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },

  // Validate and sanitize trade data
  sanitizeTradeData: (trade) => {
    return {
      symbol: securityUtils.sanitizeInput(trade.symbol || '').toUpperCase().slice(0, 20),
      side: ['LONG', 'SHORT'].includes(trade.side) ? trade.side : 'LONG',
      quantity: Math.max(0, parseFloat(trade.quantity) || 0),
      entryPrice: Math.max(0, parseFloat(trade.entryPrice) || 0),
      exitPrice: Math.max(0, parseFloat(trade.exitPrice) || 0),
      pnl: parseFloat(trade.pnl) || 0,
      strategy: securityUtils.sanitizeInput(trade.strategy || 'Other').slice(0, 50),
      notes: securityUtils.sanitizeHtml(trade.notes || '').slice(0, 5000),
      status: ['WIN', 'LOSS', 'BREAKEVEN'].includes(trade.status) ? trade.status : 'WIN',
    };
  },

  // Validate email format
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate password strength
  validatePassword: (password) => {
    return {
      valid: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  },

  // Generate secure random ID
  generateSecureId: () => {
    return crypto.randomUUID ? crypto.randomUUID() : 
      'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
  },

  // Check for suspicious patterns
  detectSuspiciousInput: (input) => {
    if (!input || typeof input !== 'string') return false;
    const patterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /expression\(/i,
      /data:text\/html/i,
    ];
    return patterns.some(pattern => pattern.test(input));
  },

  // Rate limiting helper (client-side)
  createRateLimiter: (maxAttempts = 5, windowMs = 60000) => {
    const attempts = new Map();
    
    return {
      tryAttempt: (key) => {
        const now = Date.now();
        const record = attempts.get(key) || { count: 0, firstAttempt: now };
        
        if (now - record.firstAttempt > windowMs) {
          record.count = 0;
          record.firstAttempt = now;
        }
        
        record.count++;
        attempts.set(key, record);
        
        if (record.count > maxAttempts) {
          return { allowed: false, remainingTime: windowMs - (now - record.firstAttempt) };
        }
        
        return { allowed: true, remainingAttempts: maxAttempts - record.count };
      },
      
      reset: (key) => {
        attempts.delete(key);
      },
    };
  },

  // Secure fetch wrapper with CORS
  secureFetch: async (url, options = {}) => {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    };
    
    if (!url.startsWith('/') && !url.includes(window.location.hostname)) {
      delete defaultOptions.credentials;
    }
    
    return fetch(url, { ...defaultOptions, ...options });
  },

  // Clear all sensitive data
  clearSensitiveData: () => {
    localStorage.removeItem('chronotrade_trades');
    localStorage.removeItem('chronotrade_subscription');
    localStorage.removeItem('chronotrade_balance');
    localStorage.removeItem('chronotrade_broker_connected');
    sessionStorage.clear();
  },

  // Export user data (for GDPR)
  exportUserData: () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('chronotrade_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    return data;
  },

  // Delete all user data
  deleteUserData: () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('chronotrade_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },
};

export default securityUtils;