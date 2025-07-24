# Wix Integration Screens

This directory contains React Native screens for Wix platform integration, including both eCommerce and CMS functionality.

## Available Screens

### eCommerce Screens
- **ProductListScreen**: Display and browse products from Wix Stores
- **ProductDetailScreen**: View detailed product information and add to cart
- **CartScreen**: Manage shopping cart items and checkout

### CMS Screens
- **CMSScreen**: Browse, search, add, edit, and delete items from Wix data collections

## API Clients

### WixApiClient (REST API)
Used for eCommerce operations:
```javascript
import { wixApiClient } from '../../utils/wixApiClient';

// Query products
const products = await wixApiClient.queryProducts({
  limit: 20,
  visible: true
});

// Add to cart
await wixApiClient.addToCart([{
  catalogReference: {
    catalogItemId: productId,
    appId: wixApiClient.getStoresAppId()
  },
  quantity: 1
}]);
```

### WixCmsClient (Wix SDK)
Used for CMS/data collection operations:
```javascript
import { wixCmsClient } from '../../utils/wixApiClient';

// Get all collections
const collections = await wixCmsClient.getCollections();

// Query items from a collection
const response = await wixCmsClient.queryCollection('BlogPosts', {
  filter: { category: 'Technology' },
  sort: [{ fieldName: '_createdDate', order: 'desc' }],
  limit: 10
});

// Add new item
const newPost = await wixCmsClient.insertItem('BlogPosts', {
  title: 'My New Post',
  content: 'Post content here...',
  author: 'John Doe'
});

// Search items
const searchResults = await wixCmsClient.searchItems(
  'BlogPosts',
  'react native',
  ['title', 'content'],
  20
);
```

## Features

### eCommerce Features
- Product browsing with categories
- Search and filtering
- Shopping cart management  
- Checkout integration
- Image optimization
- Caching for performance

### CMS Features
- Browse all data collections
- Query items with filters and sorting
- Search across multiple fields
- Create, read, update, delete operations
- Real-time data synchronization
- Type-safe TypeScript interfaces

## Authentication

Both clients use the same visitor authentication system:
- Automatic token generation and refresh
- Secure token storage via AsyncStorage
- Shared authentication state between clients

## Setup

1. **Configure Wix credentials** in `src/config/wixConfig.ts`:
```typescript
const WIX_CLIENT_ID = 'your-client-id';
const WIX_SITE_ID = 'your-site-id';
```

2. **Import and use the screens**:
```javascript
import { ProductListScreen, CMSScreen } from './screens/wix';
```

3. **Use the API clients directly**:
```javascript
import { wixApiClient, wixCmsClient } from './utils/wixApiClient';
```

## Error Handling

Both clients include comprehensive error handling and logging:
- Network errors are caught and displayed to users
- Authentication errors trigger token refresh
- API errors include helpful debugging information
- Expected errors (like empty carts) are handled gracefully

## TypeScript Support

Full TypeScript support with interfaces for:
- Product data structures
- Cart operations
- CMS data items and collections
- API responses and queries

## Testing

All screens include comprehensive test coverage. Run tests with:
```bash
npm test
``` 