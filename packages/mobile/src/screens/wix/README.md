# Wix Store Screens

This folder contains all React Native screens related to Wix store integration using REST APIs.

## Screens Overview

### 🛍️ ProductListScreen
- **Purpose**: Browse and search store products
- **Features**: Product grid, search, category filtering, pull-to-refresh
- **Navigation**: Registered as "Products" tab (position 3)
- **Route**: Navigates to ProductDetail screen when product is tapped

### 📄 ProductDetailScreen  
- **Purpose**: View detailed product information
- **Features**: Image gallery, product options/variants, add to cart
- **Navigation**: Accessed from ProductListScreen
- **Route**: Receives `productId` parameter

### 🛒 CartScreen
- **Purpose**: Manage shopping cart and checkout
- **Features**: Cart items list, quantity controls, remove items, checkout
- **Navigation**: Registered as "Cart" tab (position 4)
- **Route**: Redirects to Wix checkout for payment

## Configuration

All Wix-related configuration is managed through:
- **Config**: `src/config/wixConfig.ts`
- **Client ID**: `6bfa6d89-e039-4145-ad77-948605cfc694`
- **API Client**: `src/utils/wixApiClient.ts`

## Usage

### Import Screens
```typescript
// Import all screens
import './screens/wix';

// Or import individually
import { ProductListScreen, ProductDetailScreen, CartScreen } from './screens/wix';
```

### Configuration Access
```typescript
import { getClientId, getStoresAppId, getWixConfig } from '../config/wixConfig';

const clientId = getClientId(); // Returns your OAuth client ID
const storesAppId = getStoresAppId(); // Returns Wix Stores app ID
```

### API Client Usage
```typescript
import { wixApiClient } from '../utils/wixApiClient';

// Query products
const products = await wixApiClient.queryProducts({ visible: true });

// Add to cart
await wixApiClient.addToCart([{ 
  catalogReference: { 
    appId: wixApiClient.getStoresAppId(),
    catalogItemId: productId 
  }, 
  quantity: 1 
}]);
```

## Dependencies

- **Context**: `WixCartContext` for cart state management
- **Theme**: Integrated with app's ThemeContext
- **Navigation**: Auto-registered with app's navigation system
- **Storage**: Uses AsyncStorage for session persistence

## API Integration

### REST APIs Used
- **Catalog V3**: Product queries and details
- **Categories**: Product categorization  
- **eCommerce Cart**: Cart management
- **eCommerce Checkout**: Checkout creation

### Authentication
- Uses OAuth client ID for visitor authentication
- Supports session token storage for persistent login
- Handles anonymous cart operations

## File Structure
```
wix/
├── ProductListScreen.tsx    # Product browsing
├── ProductDetailScreen.tsx  # Product details  
├── CartScreen.tsx          # Cart management
├── index.ts               # Exports
└── README.md             # This file
```

## Development Notes

- All screens use type-safe API integration
- Proper error handling and loading states
- Responsive design for mobile devices
- Debug logging for development
- Self-registering with navigation system 