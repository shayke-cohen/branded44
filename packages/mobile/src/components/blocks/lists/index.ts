/**
 * Lists & Data Display Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all list and data display related block components with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Lists
 * @author AI Component System
 * @version 1.0.0
 */

// === LIST COMPONENTS ===

export { default as UserList } from './UserList';
export type { 
  UserListProps, 
  UserListItem, 
  UserAction 
} from './UserList';

export { default as ProductGrid } from './ProductGrid';
export type { 
  ProductGridProps, 
  Product 
} from './ProductGrid';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * ## Quick Component Selection Guide
 * 
 * ### For User Management:
 * - Use `UserList` for displaying users with actions
 * - Supports both list and grid layouts
 * - Built-in search and status indicators
 * 
 * ### For Product Display:
 * - Use `ProductGrid` for e-commerce product listings
 * - Supports wishlist and cart functionality
 * - Built-in ratings and discount indicators
 * 
 * ## Common Implementation Patterns
 * 
 * ### User Directory:
 * ```tsx
 * <UserList
 *   users={userList}
 *   onUserSelect={(user) => navigateToProfile(user)}
 *   actions={[
 *     { id: 'message', label: 'Message', icon: '💬', onPress: sendMessage },
 *     { id: 'follow', label: 'Follow', icon: '👥', onPress: followUser }
 *   ]}
 *   showSearch={true}
 *   layout="list"
 *   allowLayoutSwitch={true}
 * />
 * ```
 * 
 * ### Product Catalog:
 * ```tsx
 * <ProductGrid
 *   products={productList}
 *   onProductSelect={(product) => navigateToProduct(product)}
 *   onAddToCart={(product) => addToCart(product)}
 *   onToggleWishlist={(product) => toggleWishlist(product)}
 *   numColumns={2}
 *   showWishlist={true}
 *   showRating={true}
 * />
 * ```
 */ 