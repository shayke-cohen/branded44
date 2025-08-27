# 🏗️ Wix API Client Structure

## ✅ **Completed Domain Alignment**

All domain clients have been moved to the `domains/` folder for consistency:

### **Domains Structure**
```
packages/mobile/src/utils/wix/
├── domains/                          # 🆕 All domain clients
│   ├── wixCoreClient.ts             # Base client with shared utilities
│   ├── wixAuthenticationClient.ts    # Member/visitor auth & tokens
│   ├── wixCMSClient.ts              # Collections & data items
│   ├── wixEcommerceClient.ts        # Products, cart, checkout
│   ├── wixBookingClient.ts          # Services, providers, bookings
│   ├── wixRestaurantClient.ts       # Restaurant menus & items
│   └── wixMainClient.ts             # Main orchestrating client
├── index.ts                         # Updated exports
├── README_REFACTOR.md               # Documentation
└── wixRestaurantAdapter.ts          # Utility adapters
```

### **Feature Toggles**
```
packages/mobile/src/config/
└── features.ts                      # Environment-based toggles
```

## 🎛️ **Feature Toggle System**

### **Environment Variables**
```bash
# Master toggle
WIX_SDK_ENABLED=true|false

# Domain-specific toggles
WIX_SDK_CART_ENABLED=true|false        # E-commerce cart operations
WIX_SDK_AUTH_ENABLED=true|false        # Authentication operations  
WIX_SDK_RESTAURANTS_ENABLED=true|false # Restaurant menu operations

# Configuration
USE_REST_API_FALLBACK=true
ENABLE_API_CACHING=true
DEBUG_API_CALLS=false
```

### **Runtime Control**
```typescript
import { featureManager } from '../config/features';

// Check status
featureManager.isSDKEnabled()           // Master toggle
featureManager.isCartSDKEnabled()       // Cart operations
featureManager.isAuthSDKEnabled()       // Authentication
featureManager.isRestaurantSDKEnabled() // Restaurant operations
featureManager.isBookingSDKEnabled()    // Booking operations

// Override at runtime
featureManager.setFeature('WIX_SDK_ENABLED', false);
```

## 📋 **Import Patterns**

### **Legacy Compatibility (No Changes Required)**
```typescript
// This still works exactly the same!
import { wixApiClient } from '../utils/wix';
const products = await wixApiClient.queryProducts();
```

### **Domain-Specific Usage (Recommended)**
```typescript
import { 
  wixAuthenticationClient,
  wixCMSClient, 
  wixEcommerceClient,
  wixBookingClient,
  wixRestaurantClient
} from '../utils/wix';

// Authentication
await wixAuthenticationClient.loginMember(email, password);

// CMS Operations  
await wixCMSClient.queryCollection('BlogPosts');

// E-commerce
await wixEcommerceClient.queryProducts();

// Bookings
await wixBookingClient.queryServices();

// Restaurant
await wixRestaurantClient.getMenus();
```

### **Unified Client**
```typescript
import { wixUnifiedClient } from '../utils/wix';

await wixUnifiedClient.ecommerce.queryProducts();
await wixUnifiedClient.booking.queryServices(); 
await wixUnifiedClient.restaurant.getMenus();
```

## 🔧 **Architecture Benefits**

### **✅ Consistent Structure**
- All clients extend `WixCoreClient`
- Shared utilities (caching, HTTP, error handling)
- Feature toggle integration throughout
- Consistent SDK/REST fallback pattern

### **✅ Separation of Concerns**
- **Authentication**: Tokens, member management
- **CMS**: Collections, data items
- **E-commerce**: Products, cart, checkout
- **Booking**: Services, providers, availability
- **Restaurant**: Menus, items, variants

### **✅ Performance & Bundle Size**
- Lazy loading of domain clients
- Selective SDK disable (save ~4MB)
- Intelligent caching across all domains
- REST API fallbacks for all operations

## 🚀 **Migration Path**

### **Phase 1: Test Compatibility**
- All existing code works unchanged
- Feature toggles default to enabled
- Test domain-specific imports

### **Phase 2: Selective Optimization**  
```bash
# Disable non-critical SDKs
WIX_SDK_RESTAURANTS_ENABLED=false
WIX_SDK_CART_ENABLED=false
```

### **Phase 3: Full Optimization**
```bash
# Keep only essential SDKs
WIX_SDK_ENABLED=true
WIX_SDK_AUTH_ENABLED=true   # Complex token management
WIX_SDK_CART_ENABLED=false  # REST is simpler
WIX_SDK_RESTAURANTS_ENABLED=false # REST fallback available
```

## 📊 **Bundle Size Impact**

| Configuration | SDK Size | Savings |
|---------------|----------|---------|
| All SDKs (Default) | ~4.3MB | 0% |
| Auth Only | ~2MB | 53% |
| No SDKs | ~50KB | 98% |

## 🎯 **Next Steps**

1. **✅ Structure aligned** - All clients in domains folder
2. **✅ Feature toggles** - Granular SDK control
3. **✅ Zero breaking changes** - Legacy compatibility maintained
4. **🎯 Ready for optimization** - Start disabling SDKs selectively
