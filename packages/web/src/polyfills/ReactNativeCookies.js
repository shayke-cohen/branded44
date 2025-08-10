// React Native Cookies polyfill for web
// Web implementation using document.cookie

const parseCookie = (cookieString) => {
  const cookies = {};
  if (!cookieString) return cookies;
  
  cookieString.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  
  return cookies;
};

const CookieManager = {
  // Get all cookies
  get: async (useWebKit = false) => {
    try {
      return parseCookie(document.cookie);
    } catch (error) {
      console.warn('CookieManager.get error:', error);
      return {};
    }
  },

  // Get specific cookie
  getCookie: async (url, name) => {
    try {
      const cookies = parseCookie(document.cookie);
      return cookies[name] || null;
    } catch (error) {
      console.warn('CookieManager.getCookie error:', error);
      return null;
    }
  },

  // Set cookie
  set: async (url, cookie) => {
    try {
      let cookieString = `${cookie.name}=${cookie.value}`;
      
      if (cookie.domain) {
        cookieString += `; Domain=${cookie.domain}`;
      }
      
      if (cookie.path) {
        cookieString += `; Path=${cookie.path}`;
      }
      
      if (cookie.expires) {
        cookieString += `; Expires=${cookie.expires}`;
      }
      
      if (cookie.maxAge) {
        cookieString += `; Max-Age=${cookie.maxAge}`;
      }
      
      if (cookie.secure) {
        cookieString += `; Secure`;
      }
      
      if (cookie.httpOnly) {
        // Note: HttpOnly can't be set via JavaScript in browsers
        console.warn('HttpOnly cookies cannot be set via JavaScript in web browsers');
      }
      
      if (cookie.sameSite) {
        cookieString += `; SameSite=${cookie.sameSite}`;
      }
      
      document.cookie = cookieString;
      return true;
    } catch (error) {
      console.warn('CookieManager.set error:', error);
      return false;
    }
  },

  // Clear specific cookie
  clearByName: async (url, name, useWebKit = false) => {
    try {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      return true;
    } catch (error) {
      console.warn('CookieManager.clearByName error:', error);
      return false;
    }
  },

  // Clear all cookies (limited in web environment)
  clearAll: async (useWebKit = false) => {
    try {
      const cookies = parseCookie(document.cookie);
      Object.keys(cookies).forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      return true;
    } catch (error) {
      console.warn('CookieManager.clearAll error:', error);
      return false;
    }
  },

  // Flush (no-op in web)
  flush: async () => {
    return true;
  }
};

export default CookieManager;
