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

export { default as ProductList } from './ProductList';
export type { 
  ProductListProps 
} from './ProductList';

export { default as ArticleList } from './ArticleList';
export type { 
  ArticleListProps,
  Article
} from './ArticleList';

export { default as EventList } from './EventList';
export type { 
  EventListProps,
  Event,
  EventLocation,
  EventAttendee,
  EventAction
} from './EventList';

export { default as MessageList } from './MessageList';
export type { 
  MessageListProps,
  Message,
  MessageAttachment,
  MessageReaction,
  TypingIndicator
} from './MessageList';

export { default as NotificationList } from './NotificationList';
export type { 
  NotificationListProps,
  Notification,
  NotificationAction
} from './NotificationList';

export { default as OrderList } from './OrderList';
export type { 
  OrderListProps,
  Order,
  OrderItem,
  OrderAction,
  ShippingAddress,
  OrderTracking
} from './OrderList';

export { default as TransactionList } from './TransactionList';
export type { 
  TransactionListProps,
  Transaction,
  TransactionAction,
  PaymentMethod,
  TransactionParticipant
} from './TransactionList';

export { default as ActivityFeed } from './ActivityFeed';
export type { 
  ActivityFeedProps,
  Activity,
  ActivityUser,
  ActivityMedia,
  ActivityInteractions
} from './ActivityFeed';

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
 * - Use `ProductList` for list view with filters
 * - Supports wishlist and cart functionality
 * - Built-in ratings and discount indicators
 * 
 * ### For Content Display:
 * - Use `ArticleList` for news/blog articles
 * - Built-in reading time and category filtering
 * 
 * ### For Events & Calendar:
 * - Use `EventList` for calendar events and activities
 * - Supports RSVP functionality and location display
 * - Built-in time-based grouping
 * 
 * ### For Communication:
 * - Use `MessageList` for chat conversations
 * - Supports message bubbles, reactions, and replies
 * - Built-in typing indicators
 * 
 * ### For System Notifications:
 * - Use `NotificationList` for app notifications
 * - Supports categorization and bulk actions
 * - Built-in read/unread states
 * 
 * ### For E-commerce:
 * - Use `OrderList` for purchase history
 * - Supports order tracking and status updates
 * - Built-in reorder and return functionality
 * 
 * ### For Financial Data:
 * - Use `TransactionList` for payment history
 * - Supports categorization and filtering
 * - Built-in balance tracking
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
 * 
 * ### Event Calendar:
 * ```tsx
 * <EventList
 *   events={eventList}
 *   onEventSelect={(event) => navigateToEvent(event)}
 *   onRSVP={(event, status) => handleRSVP(event, status)}
 *   showLocation={true}
 *   groupByDate={true}
 *   allowRSVP={true}
 * />
 * ```
 * 
 * ### Chat Messages:
 * ```tsx
 * <MessageList
 *   messages={chatMessages}
 *   currentUserId="user123"
 *   onMessagePress={(message) => handleMessageAction(message)}
 *   onReaction={(messageId, reaction) => addReaction(messageId, reaction)}
 *   showReactions={true}
 *   enableReply={true}
 * />
 * ```
 * 
 * ### Order History:
 * ```tsx
 * <OrderList
 *   orders={orderHistory}
 *   onOrderPress={(order) => navigateToOrderDetails(order)}
 *   onTrackOrder={(orderId) => showTrackingInfo(orderId)}
 *   onReorder={(order) => handleReorder(order)}
 *   showProductImages={true}
 *   allowReorder={true}
 * />
 * ```
 * 
 * ### Transaction History:
 * ```tsx
 * <TransactionList
 *   transactions={transactionHistory}
 *   onTransactionPress={(transaction) => showDetails(transaction)}
 *   showRunningBalance={true}
 *   groupByDate={true}
 *   allowDispute={true}
 *   categoryFilter={['income', 'transfer']}
 * />
 * ```
 */ 