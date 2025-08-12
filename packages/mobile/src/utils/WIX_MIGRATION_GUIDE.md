# 🔄 Wix API Client Migration Guide

This guide explains the new domain-organized Wix API architecture and how to migrate existing code.

## 📋 **What Changed**

### **Before (Old Architecture)**
```typescript
import { wixApiClient } from '../utils/wixApiClient';

// Everything in one giant file
const products = await wixApiClient.queryProducts();
const cart = await wixApiClient.getCurrentCart();
```

### **After (New Architecture)**
```typescript
// Domain-specific imports
import { wixEcommerceClient, wixBookingApiClient } from '../utils/wix';

// Or unified client
import { wixUnifiedClient } from '../utils/wix';

// Or legacy compatibility (recommended for migration)
import { wixApiClient } from '../utils/wix';
```

## 🏗️ **New Architecture**

### **Domain-Specific Clients**

#### **1. E-commerce Client (`wixEcommerceClient`)**
```typescript
import { wixEcommerceClient } from '../utils/wix';

// Products
const products = await wixEcommerceClient.queryProducts();
const product = await wixEcommerceClient.getProduct(productId);

// Categories
const categories = await wixEcommerceClient.queryCategories();

// Cart
const cart = await wixEcommerceClient.getCurrentCart();
await wixEcommerceClient.addToCart(items);

// Checkout
const checkout = await wixEcommerceClient.createCheckout();
```

#### **2. Booking Client (`wixBookingApiClient`)**
```typescript
import { wixBookingApiClient } from '../utils/wix';

// Services
const services = await wixBookingApiClient.queryServices();
const service = await wixBookingApiClient.getService(serviceId);

// Providers
const providers = await wixBookingApiClient.queryServiceProviders();

// Availability
const slots = await wixBookingApiClient.getAvailableSlots(query);

// Bookings
const booking = await wixBookingApiClient.createBooking(request);
const bookings = await wixBookingApiClient.getCustomerBookings();
```

#### **3. Unified Client (`wixUnifiedClient`)**
```typescript
import { wixUnifiedClient } from '../utils/wix';

// Access all domains
const products = await wixUnifiedClient.ecommerce.queryProducts();
const services = await wixUnifiedClient.booking.queryServices();

// Cross-domain operations
await wixUnifiedClient.clearAllCaches();
const cacheInfo = await wixUnifiedClient.getAllCacheInfo();
```

## 🔄 **Migration Strategies**

### **Strategy 1: No Migration (Recommended)**
Use the legacy compatibility layer - no code changes needed:

```typescript
// This still works exactly the same!
import { wixApiClient } from '../utils/wix';

const products = await wixApiClient.queryProducts();
const cart = await wixApiClient.getCurrentCart();

// New booking methods are also available
const services = await wixApiClient.queryServices();
const booking = await wixApiClient.createBooking(request);
```

### **Strategy 2: Gradual Migration**
Migrate domain by domain over time:

```typescript
// Start with new imports but keep existing method calls
import { wixApiClient } from '../utils/wix';

// Later, switch to domain-specific clients
import { wixEcommerceClient, wixBookingApiClient } from '../utils/wix';
```

### **Strategy 3: Full Migration**
Use domain-specific clients for new code:

```typescript
// New components use domain clients
import { wixEcommerceClient } from '../utils/wix';
import { wixBookingApiClient } from '../utils/wix';

// Existing components keep legacy imports
import { wixApiClient } from '../utils/wix';
```

## 📦 **New Features**

### **1. Booking & Services Integration**
```typescript
import { useWixBooking } from '../context/WixBookingContext';

function BookingScreen() {
  const { 
    services, 
    loadServices, 
    createBooking,
    availableSlots,
    loadAvailableSlots 
  } = useWixBooking();
  
  // Services are automatically adapted to generic Service interface
  return (
    <ServicesScreen 
      enableWixIntegration={true}
      onServicePress={handleServicePress}
    />
  );
}
```

### **2. Generic Block Integration**
```typescript
// ServicesScreen works with both generic data and Wix data
<ServicesScreen
  // Option 1: Generic data
  services={genericServices}
  categories={genericCategories}
  
  // Option 2: Wix integration
  enableWixIntegration={true}
  wixFilters={{ categoryId: 'fitness' }}
  
  // Option 3: Hybrid (Wix with fallback)
  enableWixIntegration={true}
  services={fallbackServices} // Used if Wix fails
/>
```

### **3. Service Adapters**
```typescript
import { adaptWixServices } from '../utils/wix';

// Convert Wix services to generic format
const wixServices = await wixBookingApiClient.queryServices();
const genericServices = adaptWixServices(wixServices, providers);

// Use with any generic component
<ServiceCard service={genericServices[0]} />
```

## 🔧 **File Organization**

```
src/utils/
├── wix/
│   ├── index.ts                 # Main exports & unified client
│   ├── wixEcommerceClient.ts    # E-commerce domain
│   └── wixBookingApiClient.ts   # Booking domain
├── wixApiClient.ts              # Legacy file (now imports from wix/)
├── wixServiceAdapter.ts         # Wix ↔ Generic adapters
└── WIX_MIGRATION_GUIDE.md      # This file
```

## 📱 **Context Integration**

### **E-commerce Context (Existing)**
```typescript
import { useWixCart } from '../context/WixCartContext';

// Still works exactly the same
const { cart, addToCart, getTotal } = useWixCart();
```

### **Booking Context (New)**
```typescript
import { useWixBooking } from '../context/WixBookingContext';

const {
  services,
  providers,
  selectedService,
  availableSlots,
  createBooking,
  loadServices
} = useWixBooking();
```

## ⚡ **Performance Benefits**

1. **Smaller Bundle Size**: Import only needed domains
2. **Better Caching**: Domain-specific cache strategies
3. **Parallel Loading**: Load e-commerce and booking data simultaneously
4. **Code Splitting**: Lazy load booking features when needed

## 🛡️ **Type Safety**

All domain clients are fully typed:

```typescript
// E-commerce types
import type { WixProduct, WixCart } from '../utils/wix';

// Booking types
import type { WixService, WixBooking } from '../utils/wix';

// Generic types (for components)
import type { Service } from '../components/blocks/booking/ServiceCard';
```

## 🧪 **Testing**

Domain clients can be mocked independently:

```typescript
// Mock just e-commerce
jest.mock('../utils/wix', () => ({
  wixEcommerceClient: {
    queryProducts: jest.fn(),
    getCurrentCart: jest.fn(),
  }
}));

// Mock just booking
jest.mock('../utils/wix', () => ({
  wixBookingApiClient: {
    queryServices: jest.fn(),
    createBooking: jest.fn(),
  }
}));
```

## 🔍 **Debugging**

Each domain has its own logging prefix:

```
🛍️ [ECOMMERCE] Loading products...
📅 [BOOKING] Creating booking...
🔄 [WIX ADAPTER] Converting Wix service to generic format...
```

## 📋 **Migration Checklist**

- [ ] **Phase 1**: Update imports to use new `../utils/wix` path
- [ ] **Phase 2**: Add booking functionality where needed
- [ ] **Phase 3**: Gradually migrate to domain-specific clients
- [ ] **Phase 4**: Remove legacy imports and unused code

## ❓ **FAQ**

**Q: Do I need to migrate immediately?**
A: No! The legacy compatibility layer ensures all existing code continues to work.

**Q: Can I use both old and new imports?**
A: Yes! You can gradually migrate domain by domain.

**Q: What if I only need e-commerce features?**
A: You can import just `wixEcommerceClient` to avoid booking bundle size.

**Q: How do I add custom business logic?**
A: Use the adapter pattern - create your own adapters that extend the Wix adapters.

**Q: Is authentication shared between domains?**
A: Yes! All domain clients share the same authentication infrastructure.

## 🎯 **Best Practices**

1. **Use TypeScript**: All clients are fully typed
2. **Handle Errors**: Each domain has specific error handling
3. **Cache Wisely**: Different domains have different cache strategies
4. **Test Integration**: Mock at the domain level for better test isolation
5. **Monitor Performance**: Use the unified client for cross-domain cache insights

---

**Need Help?** Check the usage examples in `src/components/templates/booking/examples/` for real-world implementation patterns!
