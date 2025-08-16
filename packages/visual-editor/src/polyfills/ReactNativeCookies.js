// React Native Cookies polyfill for web
const CookieManager = {
  get: async (url) => {
    // Simple cookie parsing for web
    const cookies = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  },
  
  set: async (url, cookie) => {
    const { name, value, domain, path, expires } = cookie;
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (domain) cookieString += `; domain=${domain}`;
    if (path) cookieString += `; path=${path}`;
    if (expires) cookieString += `; expires=${expires}`;
    
    document.cookie = cookieString;
    return true;
  },
  
  clearAll: async () => {
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    return true;
  },
  
  clear: async (url) => {
    return CookieManager.clearAll();
  }
};

// Export both default and named exports to handle different import styles (ES modules)
export default CookieManager;
export { CookieManager };
