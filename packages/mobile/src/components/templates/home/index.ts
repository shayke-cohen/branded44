/**
 * Home Templates Index - AI-Optimized React Native Component Library
 * 
 * This file exports all home and dashboard template components (full screens) with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Home Templates
 * @author AI Component System
 * @version 1.0.0
 */

// === HOME AND DASHBOARD TEMPLATES ===

export { default as DashboardScreen } from './DashboardScreen';
export type { 
  DashboardScreenProps, 
  DashboardScreenConfig, 
  DashboardWidget, 
  QuickAction, 
  DashboardStats, 
  WidgetType 
} from './DashboardScreen';

export { default as HomeScreen } from './HomeScreen';
export type { 
  HomeScreenProps, 
  HomeScreenConfig, 
  NavigationCategory, 
  FeaturedContent, 
  PromoBanner 
} from './HomeScreen';

export { default as FeedScreen } from './FeedScreen';
export type { 
  FeedScreenProps, 
  FeedScreenConfig, 
  SocialPost, 
  UserStory, 
  FeedFilter 
} from './FeedScreen';

export { default as SearchScreen } from './SearchScreen';
export type { 
  SearchScreenProps, 
  SearchScreenConfig, 
  SearchResult, 
  SearchSuggestion, 
  SearchFilter, 
  SearchResultType 
} from './SearchScreen';

export { default as NotificationsScreen } from './NotificationsScreen';
export type { 
  NotificationsScreenProps, 
  NotificationsScreenConfig, 
  NotificationFilter, 
  NotificationFilterType, 
  NotificationStats 
} from './NotificationsScreen';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';
export type { 
  BaseComponentProps,
  UserProfile 
} from '../../../lib/types';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * This section provides comprehensive guidance for AI agents on how to use
 * these home and dashboard templates effectively.
 * 
 * ## Quick Template Selection Guide
 * 
 * ### For App Dashboard:
 * - Use `DashboardScreen` for overview and analytics screens
 * - Include widgets, stats, quick actions, and activity feeds
 * - Perfect for admin panels, user dashboards, and metrics views
 * 
 * ### For App Home/Landing:
 * - Use `HomeScreen` for primary landing pages
 * - Include navigation, featured content, and categories
 * - Perfect for main app entry points and content discovery
 * 
 * ### For Social Media Feed:
 * - Use `FeedScreen` for social media and activity feeds
 * - Include posts, stories, interactions, and real-time updates
 * - Perfect for social apps, news feeds, and community features
 * 
 * ### For Search Functionality:
 * - Use `SearchScreen` for comprehensive search experiences
 * - Include filters, suggestions, result types, and history
 * - Perfect for content discovery and advanced search features
 * 
 * ### For Notifications:
 * - Use `NotificationsScreen` for notification management
 * - Include filtering, bulk actions, and notification settings
 * - Perfect for system notifications and user communications
 * 
 * ## Common Implementation Patterns
 * 
 * ### Complete Home Experience:
 * ```tsx
 * // Main dashboard with widgets and stats
 * <DashboardScreen
 *   user={currentUser}
 *   widgets={[
 *     {
 *       id: 'sales',
 *       type: 'stat',
 *       title: 'Total Sales',
 *       value: '$12,345',
 *       trend: 'up',
 *       trendValue: 15
 *     },
 *     {
 *       id: 'users',
 *       type: 'stat',
 *       title: 'Active Users',
 *       value: '1,234',
 *       trend: 'up',
 *       trendValue: 8
 *     }
 *   ]}
 *   quickActions={[
 *     { id: 'create', title: 'Create Post', destination: 'CreatePost' },
 *     { id: 'analytics', title: 'View Analytics', destination: 'Analytics' }
 *   ]}
 *   onWidgetPress={(widget) => navigation.navigate(widget.destination)}
 *   onRefresh={() => handleRefresh()}
 * />
 * 
 * // App home page with navigation and content
 * <HomeScreen
 *   user={currentUser}
 *   categories={[
 *     { id: 'shop', title: 'Shop', destination: 'Shop', icon: '🛍️' },
 *     { id: 'blog', title: 'Blog', destination: 'Blog', icon: '📝' }
 *   ]}
 *   featuredContent={featuredArticles}
 *   recommendations={recommendedProducts}
 *   onCategoryPress={(category) => navigation.navigate(category.destination)}
 *   onFeaturedPress={(content) => navigation.navigate('Article', content)}
 * />
 * 
 * // Social media feed
 * <FeedScreen
 *   currentUser={currentUser}
 *   posts={feedPosts}
 *   stories={userStories}
 *   onPostPress={(post) => navigation.navigate('PostDetail', { post })}
 *   onLikePost={(postId) => handleLikePost(postId)}
 *   onCreatePost={() => navigation.navigate('CreatePost')}
 *   onStoryPress={(story) => navigation.navigate('StoryViewer', { story })}
 * />
 * 
 * // Advanced search
 * <SearchScreen
 *   searchResults={searchResults}
 *   suggestions={searchSuggestions}
 *   recentSearches={recentSearches}
 *   onSearch={(query) => handleSearch(query)}
 *   onResultPress={(result) => navigation.navigate('Detail', result)}
 *   onFilterChange={(filters) => handleFilterChange(filters)}
 * />
 * 
 * // Notifications management
 * <NotificationsScreen
 *   notifications={userNotifications}
 *   stats={{ unread: 5, today: 12, total: 156 }}
 *   onNotificationPress={(notification) => handleNotificationPress(notification)}
 *   onMarkAllRead={() => handleMarkAllRead()}
 *   onNavigateToSettings={() => navigation.navigate('NotificationSettings')}
 * />
 * ```
 * 
 * ### Navigation Integration:
 * ```tsx
 * // React Navigation Tab Navigator
 * const MainTabs = createBottomTabNavigator();
 * 
 * function MainNavigator() {
 *   return (
 *     <MainTabs.Navigator>
 *       <MainTabs.Screen name="Home" component={HomeScreen} />
 *       <MainTabs.Screen name="Feed" component={FeedScreen} />
 *       <MainTabs.Screen name="Search" component={SearchScreen} />
 *       <MainTabs.Screen name="Notifications" component={NotificationsScreen} />
 *       <MainTabs.Screen name="Dashboard" component={DashboardScreen} />
 *     </MainTabs.Navigator>
 *   );
 * }
 * ```
 * 
 * ### State Management Integration:
 * ```tsx
 * // Using with data fetching
 * function DashboardContainer() {
 *   const { data: widgets, loading, error, refetch } = useQuery('dashboard-widgets', fetchWidgets);
 *   const { data: stats } = useQuery('dashboard-stats', fetchStats);
 * 
 *   return (
 *     <DashboardScreen
 *       widgets={widgets}
 *       stats={stats}
 *       loading={loading}
 *       error={error}
 *       onRefresh={refetch}
 *     />
 *   );
 * }
 * 
 * // Using with real-time updates
 * function FeedContainer() {
 *   const { posts, loading } = useFeed();
 *   const { subscribe } = useRealtimeUpdates();
 * 
 *   useEffect(() => {
 *     const unsubscribe = subscribe('posts', handleNewPost);
 *     return unsubscribe;
 *   }, []);
 * 
 *   return (
 *     <FeedScreen
 *       posts={posts}
 *       loading={loading}
 *       onLikePost={handleLikePost}
 *       onCreatePost={handleCreatePost}
 *     />
 *   );
 * }
 * ```
 * 
 * ## Configuration Examples
 * 
 * ### Dashboard with Custom Widgets:
 * ```tsx
 * <DashboardScreen
 *   widgets={[
 *     {
 *       id: 'revenue',
 *       type: 'stat',
 *       title: 'Monthly Revenue',
 *       value: '$45,678',
 *       size: 'large',
 *       color: '#10b981',
 *       trend: 'up',
 *       trendValue: 12
 *     },
 *     {
 *       id: 'chart',
 *       type: 'chart',
 *       title: 'Sales Trend',
 *       size: 'full',
 *       data: chartData
 *     }
 *   ]}
 *   config={{
 *     showGreeting: true,
 *     showSearch: true,
 *     showQuickActions: true,
 *     gridColumns: 2,
 *     maxWidgets: 6
 *   }}
 * />
 * ```
 * 
 * ### Home Screen with Categories:
 * ```tsx
 * <HomeScreen
 *   categories={[
 *     {
 *       id: 'electronics',
 *       title: 'Electronics',
 *       description: 'Latest gadgets',
 *       image: electronicsImage,
 *       destination: 'Electronics',
 *       count: 1250,
 *       featured: true
 *     },
 *     {
 *       id: 'fashion',
 *       title: 'Fashion',
 *       description: 'Trending styles',
 *       image: fashionImage,
 *       destination: 'Fashion',
 *       count: 890
 *     }
 *   ]}
 *   config={{
 *     categoriesStyle: 'grid',
 *     featuredStyle: 'carousel',
 *     showPromoBanners: true,
 *     maxCategories: 8,
 *     maxFeatured: 5
 *   }}
 * />
 * ```
 * 
 * ### Feed with Stories:
 * ```tsx
 * <FeedScreen
 *   currentUser={currentUser}
 *   posts={feedPosts}
 *   stories={[
 *     {
 *       id: 'story1',
 *       author: user1,
 *       media: 'story1.jpg',
 *       type: 'image',
 *       createdAt: new Date(),
 *       isViewed: false
 *     }
 *   ]}
 *   config={{
 *     showStories: true,
 *     showCreatePost: true,
 *     showTrending: true,
 *     enableInfiniteScroll: true,
 *     postsPerPage: 10
 *   }}
 * />
 * ```
 * 
 * ### Search with Advanced Filtering:
 * ```tsx
 * <SearchScreen
 *   searchResults={searchResults}
 *   filters={[
 *     {
 *       key: 'category',
 *       label: 'Category',
 *       type: 'select',
 *       options: [
 *         { label: 'All', value: 'all' },
 *         { label: 'Electronics', value: 'electronics' },
 *         { label: 'Fashion', value: 'fashion' }
 *       ]
 *     },
 *     {
 *       key: 'price',
 *       label: 'Price Range',
 *       type: 'range',
 *       value: [0, 1000]
 *     }
 *   ]}
 *   config={{
 *     showSuggestions: true,
 *     showRecent: true,
 *     showTrending: true,
 *     enableVoiceSearch: true,
 *     availableTypes: ['user', 'product', 'article']
 *   }}
 * />
 * ```
 */

/**
 * === STYLING SYSTEM ===
 * 
 * All templates use the centralized design system:
 * 
 * - `COLORS` - Comprehensive color palette with semantic meanings
 * - `SPACING` - Consistent spacing scale (xs, sm, md, lg, xl, etc.)
 * - `TYPOGRAPHY` - Font sizes, weights, and line heights
 * 
 * Templates accept custom styles via the `style` prop and can be
 * easily themed by modifying the constants file.
 * 
 * ### Custom Styling Example:
 * ```tsx
 * <DashboardScreen
 *   style={{ backgroundColor: '#f8fafc' }}
 *   config={{
 *     headerComponent: <CustomDashboardHeader />,
 *     footerComponent: <CustomDashboardFooter />
 *   }}
 * />
 * ```
 */

/**
 * === PERFORMANCE CONSIDERATIONS ===
 * 
 * These templates are optimized for performance:
 * 
 * ### Lazy Loading:
 * ```tsx
 * // Use React.lazy for large screens
 * const DashboardScreen = React.lazy(() => import('./DashboardScreen'));
 * 
 * function App() {
 *   return (
 *     <Suspense fallback={<LoadingScreen />}>
 *       <DashboardScreen />
 *     </Suspense>
 *   );
 * }
 * ```
 * 
 * ### Data Optimization:
 * ```tsx
 * // Use memoization for expensive calculations
 * const MemoizedDashboard = React.memo(DashboardScreen);
 * 
 * // Use useMemo for complex data transformations
 * function DashboardContainer() {
 *   const processedWidgets = useMemo(
 *     () => processWidgetData(rawWidgets),
 *     [rawWidgets]
 *   );
 * 
 *   return <DashboardScreen widgets={processedWidgets} />;
 * }
 * ```
 */

/**
 * === ACCESSIBILITY FEATURES ===
 * 
 * All templates include comprehensive accessibility support:
 * 
 * - Screen reader compatibility
 * - Keyboard navigation support
 * - High contrast mode support
 * - Text scaling support
 * - Touch target optimization
 * 
 * ### Accessibility Example:
 * ```tsx
 * <DashboardScreen
 *   testID="main-dashboard"
 *   accessibilityLabel="Main dashboard showing key metrics and actions"
 *   accessibilityHint="Swipe to navigate between widgets, double tap to interact"
 * />
 * ```
 */
