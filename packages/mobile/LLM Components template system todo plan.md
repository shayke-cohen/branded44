# 🚀 Complete LLM Component System Todo List

## 📋 Project Overview
Building a comprehensive React Native component system with 270+ components optimized for AI code generation.

**Timeline**: 4-6 weeks  
**Goal**: Enable AI agents to generate any mobile app type  
**Coverage**: 20+ app categories with complete UI/UX flows

---

## ✅ PHASE 1: FOUNDATION SETUP (Week 1)

### 🔧 1.1 Initial Project Setup

#### ✅ Task 1.1.1: Create Base Project
```bash
# Execute these commands:
npx @react-native-reusables/cli init LLMComponentSystem
cd LLMComponentSystem
```

#### ✅ Task 1.1.2: Install React Native Reusables Components
```bash
# Select these essential components:
npx @react-native-reusables/cli

# Components to select:
- button, input, card, modal, alert, badge
- checkbox, switch, tabs, progress, skeleton
- avatar, table, separator, accordion, sheet
- toast, tooltip, popover, dialog, calendar
```

#### ✅ Task 1.1.3: Verify Installation
- [ ] Test that UI components render correctly
- [ ] Check TypeScript definitions work
- [ ] Verify NativeWind styling is active
- [ ] Test on iOS and Android simulators

#### ✅ Task 1.1.4: Create Folder Structure
```bash
mkdir -p src/components/{blocks,templates,layout}
mkdir -p src/components/blocks/{auth,forms,lists,social,ecommerce,finance,health,media,location,booking,restaurant}
mkdir -p src/components/templates/{auth,profile,home,business,booking,provider,restaurant,restaurant-management}
mkdir -p src/components/flows/{auth,ecommerce,social,booking,restaurant}
mkdir -p src/lib
mkdir -p docs
mkdir -p examples
mkdir -p prompts
```

### 📚 1.2 Core Configuration Files

#### ✅ Task 1.2.1: Create Constants File
**File**: `src/lib/constants.ts`

**LLM Prompt**:
```
Create a comprehensive constants file for a React Native component library with:

1. COLORS object with:
   - Primary colors (50-900 scale)
   - Semantic colors (success, warning, error, info)
   - Neutral grays (50-900 scale)
   - Brand colors

2. SPACING object with:
   - xs, sm, md, lg, xl, 2xl, 3xl values
   - Consistent 4px base unit

3. TYPOGRAPHY object with:
   - Font sizes (xs to 4xl)
   - Font weights (light to black)
   - Line heights

4. LAYOUT object with:
   - Screen dimensions
   - Safe area constants
   - Common aspect ratios

5. ANIMATIONS object with:
   - Duration constants
   - Easing curves
   - Common transitions

Include TypeScript types and JSDoc comments for AI agent usage.
```

#### ✅ Task 1.2.2: Create Types File
**File**: `src/lib/types.ts`

**LLM Prompt**:
```
Create a comprehensive TypeScript types file for a React Native component library with:

1. User-related types:
   - User, Profile, Account, Session
   - Authentication states
   - User preferences

2. UI-related types:
   - Common component props
   - Theme types
   - Layout types
   - Navigation types

3. Data types:
   - API response types
   - Form data types
   - List item types

4. Business types:
   - Product, Order, Payment
   - Message, Chat, Notification
   - Event, Booking, Appointment

5. Utility types:
   - Loading states
   - Error types
   - Success/failure responses

Include extensive JSDoc comments explaining each type for AI agents.
```

#### ✅ Task 1.2.3: Create Utils File
**File**: `src/lib/utils.ts`

**LLM Prompt**:
```
Create a comprehensive utilities file for React Native with:

1. Styling utilities:
   - cn() function for className merging
   - Platform-specific styling helpers
   - Responsive design helpers

2. Validation utilities:
   - Email, phone, password validators
   - Form validation helpers
   - Input sanitization

3. Formatting utilities:
   - Date/time formatters
   - Currency formatters
   - Number formatters
   - Text truncation

4. Navigation utilities:
   - Route helpers
   - Deep linking utilities
   - Navigation state helpers

5. Storage utilities:
   - AsyncStorage wrappers
   - Cache management
   - Secure storage helpers

Include TypeScript definitions and usage examples for AI agents.
```

---

## 🧱 PHASE 2: CORE BLOCKS CREATION (Week 1-2)

### 🔐 2.1 Authentication Blocks (Priority: HIGH)

#### ✅ Task 2.1.1: Authentication Blocks Batch 1
**LLM Prompt**:
```
Create these 6 authentication block components using React Native Reusables UI components:

1. **LoginForm** - Email/password login with validation
2. **SignupForm** - Registration with terms acceptance  
3. **ForgotPasswordForm** - Password reset flow
4. **OTPVerificationForm** - Phone/email verification
5. **SocialLoginButtons** - Google, Apple, Facebook, Twitter
6. **ProfileCard** - User info display with edit option

Requirements:
- Use React Native Reusables components: Button, Input, Card, etc.
- TypeScript interfaces for all props
- Comprehensive JSDoc comments with usage examples
- NativeWind styling with consistent design tokens
- Form validation and error handling
- Loading states for all async operations
- Accessibility support

File structure: src/components/blocks/auth/[component-name].tsx
Include index.ts file exporting all components and types.
```

#### ✅ Task 2.1.2: Authentication Blocks Batch 2
**LLM Prompt**:
```
Create these 6 additional authentication block components:

1. **ProfileEditForm** - Comprehensive profile editing
2. **SettingsPanel** - Account settings with toggles
3. **SecuritySettings** - Password, 2FA, privacy controls
4. **NotificationSettings** - Push notification preferences
5. **SubscriptionCard** - Plan details with upgrade/cancel
6. **UserRoleSelector** - Admin/user role management

Same requirements as Batch 1. Focus on consistent APIs and styling.
```

### 📋 2.2 Form & Data Entry Blocks (Priority: HIGH)

#### ✅ Task 2.2.1: Form Blocks Batch 1
**LLM Prompt**:
```
Create these 8 form and data entry block components:

1. **ContactForm** - Name, email, phone, message
2. **AddressForm** - Street, city, state, zip with validation
3. **PaymentForm** - Credit card with validation (no Stripe integration yet)
4. **SearchForm** - Advanced search with filters
5. **FilterPanel** - Multi-category filtering
6. **SortPanel** - Sort options with direction
7. **DateRangePicker** - Start/end date selection
8. **TimeSlotPicker** - Available time slots selection

Requirements:
- Use React Native Reusables: Input, Button, Card, Select, etc.
- Real-time validation
- TypeScript interfaces
- JSDoc documentation
- Consistent error handling
- Loading states
- Reset functionality

File structure: src/components/blocks/forms/[component-name].tsx
```

#### ✅ Task 2.2.2: Form Blocks Batch 2
**LLM Prompt**:
```
Create these 4 additional form components:

1. **RatingForm** - Star rating with review text
2. **FeedbackForm** - Bug reports, feature requests
3. **SurveyForm** - Multi-question surveys
4. **QuizForm** - Questions with multiple choice

Focus on interactive elements and data collection patterns.
```

### 📊 2.3 Data Display & Lists Blocks (Priority: HIGH)

#### ✅ Task 2.3.1: List Blocks Batch 1
**LLM Prompt**:
```
Create these 10 data display and list block components:

1. **UserList** - Grid/list view with actions
2. **ProductGrid** - E-commerce product display
3. **ProductList** - List view with filters
4. **ArticleList** - News/blog articles
5. **EventList** - Calendar events with time
6. **MessageList** - Chat message bubbles
7. **NotificationList** - System notifications
8. **OrderList** - Purchase history
9. **TransactionList** - Financial transactions
10. **ActivityFeed** - Social media style feed

Requirements:
- Use React Native Reusables: Card, Avatar, Badge, Button
- Infinite scroll capability
- Empty states
- Loading states
- Pull-to-refresh
- Search/filter integration
- Item actions (edit, delete, etc.)
- Consistent list item patterns

File structure: src/components/blocks/lists/[component-name].tsx
```

#### ✅ Task 2.3.2: List Blocks Batch 2
**LLM Prompt**:
```
Create these 10 additional list components:

1. **LeaderboardList** - Rankings with scores
2. **ContactList** - Phonebook style contacts
3. **FavoritesList** - Saved/bookmarked items
4. **RecentlyViewedList** - History tracking
5. **CategoryGrid** - App categories/sections
6. **TagCloud** - Topic tags with counts
7. **StatsList** - Key metrics display
8. **ProgressTracker** - Multi-step progress
9. **TimelineList** - Chronological events
10. **CommentThread** - Nested comments

Same requirements as Batch 1, focus on specialized display patterns.
```

### 🛒 2.4 E-commerce Blocks (Priority: MEDIUM)

#### ✅ Task 2.4.1: E-commerce Blocks Batch 1
**LLM Prompt**:
```
Create these 8 e-commerce block components:

1. **ProductCard** - Image, price, rating, actions
2. **ProductDetails** - Full product information
3. **CartItem** - Cart item with quantity controls
4. **CartSummary** - Total, taxes, discounts
5. **CheckoutForm** - Complete purchase flow
6. **OrderSummary** - Order confirmation details
7. **PaymentMethodSelector** - Credit card, PayPal, etc.
8. **ShippingMethodSelector** - Delivery options

Requirements:
- E-commerce specific patterns
- Price formatting
- Quantity controls
- Add to cart functionality
- Wishlist integration
- Stock indicators
- Shipping calculations
- Tax handling

File structure: src/components/blocks/ecommerce/[component-name].tsx
```

#### ✅ Task 2.4.2: E-commerce Blocks Batch 2
**LLM Prompt**:
```
Create these 8 additional e-commerce components:

1. **AddressSelector** - Saved addresses
2. **CouponCode** - Discount code entry
3. **WishlistItem** - Save for later functionality
4. **PriceComparison** - Multiple vendor prices
5. **ProductReviews** - Customer reviews with photos
6. **RelatedProducts** - Recommendation grid
7. **RecentlyViewed** - Shopping history
8. **StockIndicator** - Availability status

Focus on enhanced shopping experience features.
```

### 💬 2.5 Social & Communication Blocks (Priority: MEDIUM)

#### ✅ Task 2.5.1: Social Blocks Batch 1
**LLM Prompt**:
```
Create these 8 social and communication block components:

1. **PostCard** - Social media post with actions
2. **StoryCard** - Instagram-style stories
3. **MessageBubble** - Chat message with timestamp
4. **ChatInput** - Message composer with media
5. **UserProfile** - Social profile with stats
6. **FollowButton** - Follow/unfollow with count
7. **LikeButton** - Heart/like with animation
8. **ShareButton** - Social sharing options

Requirements:
- Social media interaction patterns
- Real-time updates
- Media upload capability
- Animation support
- User engagement metrics
- Privacy controls
- Notification integration

File structure: src/components/blocks/social/[component-name].tsx
```

#### ✅ Task 2.5.2: Social Blocks Batch 2
**LLM Prompt**:
```
Create these 9 additional social components:

1. **CommentCard** - Individual comment
2. **MentionInput** - @username autocomplete
3. **HashtagInput** - #hashtag autocomplete
4. **MediaPicker** - Photo/video selection
5. **VoiceRecorder** - Audio message recording
6. **VideoCall** - Video chat interface
7. **GroupChat** - Multi-user chat header
8. **ContactPicker** - Select from contacts
9. **InviteFriends** - Share app invitation

Focus on advanced social features and media handling.
```

### 📅 2.6 Booking & Service Blocks (Priority: HIGH)

#### ✅ Task 2.6.1: Core Booking Blocks
**LLM Prompt**:
```
Create these 8 booking and service-related block components:

1. **ServiceCard** - Service display with pricing, duration, description
2. **ServiceProviderCard** - Provider profile with ratings, specialties, availability
3. **BookingCalendar** - Available time slots with provider schedule integration
4. **TimeSlotGrid** - Visual time slot selection with availability indicators
5. **BookingForm** - Complete booking form with customer details and preferences
6. **BookingSummary** - Booking confirmation with service, time, provider, and pricing
7. **AppointmentCard** - Individual appointment display with status and actions
8. **ReviewCard** - Customer reviews with ratings and photos

Requirements:
- Use React Native Reusables: Card, Button, Calendar, etc.
- Support multiple service types (appointments, classes, consultations, etc.)
- Include pricing tiers and duration options
- Provider availability and booking rules
- Customer review and rating integration
- Payment method integration readiness

File structure: src/components/blocks/booking/[component-name].tsx
```

#### ✅ Task 2.6.2: Advanced Booking Blocks
**LLM Prompt**:
```
Create these 6 additional service and booking components:

1. **ClassScheduleCard** - Group classes with capacity and enrollment
2. **RecurringBookingForm** - Recurring appointment setup (weekly, monthly, etc.)
3. **CancellationPolicy** - Service cancellation terms and fee display
4. **WaitlistCard** - Join waitlist for fully booked slots
5. **PackageCard** - Service packages and membership tiers
6. **ResourceBookingCard** - Equipment/room booking (separate from services)

Focus on advanced booking scenarios and business rules.
```

### 🏥 2.7 Specialized Blocks (Priority: MEDIUM)

#### ✅ Task 2.7.1: Health & Fitness Blocks
**LLM Prompt**:
```
Create these 12 health and fitness block components:

1. **WorkoutCard** - Exercise routine display
2. **ExerciseSet** - Reps and weight tracking
3. **ProgressChart** - Fitness metrics graph
4. **MealCard** - Food diary entry
5. **CalorieCounter** - Daily calorie tracking
6. **WaterTracker** - Hydration logging
7. **SleepTracker** - Sleep quality metrics
8. **HeartRateMonitor** - Real-time HR display
9. **StepCounter** - Daily steps with goal
10. **WeightLog** - Weight tracking over time
11. **BodyMeasurements** - Comprehensive body metrics
12. **SupplementTracker** - Vitamin/supplement log

File structure: src/components/blocks/health/[component-name].tsx
```

#### ✅ Task 2.7.2: Finance Blocks
**LLM Prompt**:
```
Create these 12 finance block components:

1. **AccountBalance** - Current balance display
2. **TransactionCard** - Individual transaction
3. **BudgetTracker** - Spending categories
4. **ExpenseForm** - Add expense entry
5. **IncomeForm** - Add income entry
6. **BillReminder** - Upcoming bills
7. **InvestmentCard** - Portfolio holdings
8. **CurrencyConverter** - Exchange rates
9. **PaymentQR** - QR code for payments
10. **SplitBill** - Group expense splitting
11. **TaxCalculator** - Tax estimation
12. **SavingsGoal** - Goal tracking

File structure: src/components/blocks/finance/[component-name].tsx
```

#### ✅ Task 2.7.3: Location & Maps Blocks
**LLM Prompt**:
```
Create these 10 location and maps block components:

1. **LocationPicker** - Map with pin selection
2. **AddressList** - Saved locations
3. **DirectionsCard** - Route information
4. **NearbyPlaces** - Location-based results
5. **CheckinCard** - Location check-in
6. **DeliveryTracker** - Real-time tracking
7. **GeofenceSetup** - Location-based alerts
8. **DistanceCalculator** - Between two points
9. **LocationSearch** - Search places with autocomplete
10. **MapFilters** - Filter by category/distance

File structure: src/components/blocks/location/[component-name].tsx
```

#### ✅ Task 2.7.4: Media & Entertainment Blocks
**LLM Prompt**:
```
Create these 12 media and entertainment block components:

1. **MusicPlayer** - Audio playback controls
2. **PlaylistCard** - Music playlist display
3. **VideoPlayer** - Video with controls
4. **PodcastCard** - Episode information
5. **BookCard** - E-book cover and progress
6. **MediaLibrary** - Content collection
7. **DownloadManager** - Offline content
8. **QualitySelector** - Video/audio quality
9. **SubtitleSettings** - Caption preferences
10. **PlaybackSpeed** - Speed control
11. **SleepTimer** - Auto-stop timer
12. **EqualizeSettings** - Audio customization

File structure: src/components/blocks/media/[component-name].tsx
```

#### ✅ Task 2.7.5: Restaurant & Dining Blocks (NEW CATEGORY - PRIORITY: HIGH)
**LLM Prompt**:
```
Create these 14 restaurant and dining block components:

1. **MenuCard** - Food item display with photo, description, price, dietary tags
2. **MenuCategoryHeader** - Menu section headers with descriptions and icons
3. **RestaurantCard** - Restaurant listing with cuisine, rating, delivery time, price range
4. **RestaurantHeader** - Restaurant hero section with banner, rating, hours, contact
5. **OrderItemCard** - Cart item with customization options and quantity controls
6. **OrderSummary** - Order total with breakdown (subtotal, tax, fees, tip)
7. **DeliveryTracker** - Real-time order tracking with status and ETA
8. **ReservationCard** - Table booking display with date, time, party size, special requests
9. **ReviewCard** - Restaurant reviews with food photos and detailed ratings
10. **DietaryFilter** - Filter panel for dietary restrictions and preferences
11. **CuisineSelector** - Cuisine type selection with icons and descriptions
12. **TableAvailability** - Available reservation times with party size options
13. **RestaurantInfo** - Hours, location, contact, parking, amenities
14. **PromotionBanner** - Special offers, discounts, and featured items

Requirements:
- Use React Native Reusables: Card, Button, Badge, etc.
- Support multiple restaurant types (fast food, fine dining, cafes, etc.)
- Include comprehensive food allergen and dietary information
- Real-time availability and delivery tracking
- Photo galleries for food items and restaurant interiors
- Rating systems with breakdown (food, service, ambiance, value)
- Integration readiness for Wix Restaurants API (see Wix Integration Notes below)
- Customization options (ingredients, size, preparation)
- Price calculations with tax, fees, and tip handling
- Location-based features (delivery zones, pickup times)

File structure: src/components/blocks/restaurant/[component-name].tsx
```

#### ✅ Task 2.7.6: Additional Restaurant Service Blocks
**LLM Prompt**:
```
Create these 8 additional restaurant service components:

1. **KitchenDisplayCard** - Order management for restaurant staff
2. **TableManagement** - Table status and seating management
3. **WaitlistCard** - Restaurant waitlist with estimated wait times
4. **LoyaltyCard** - Rewards points and loyalty program display
5. **NutritionCard** - Detailed nutritional information and calorie counts
6. **SpecialRequestForm** - Custom instructions and dietary accommodations
7. **GroupOrderCard** - Collaborative ordering for multiple people
8. **CateringPackage** - Large order packages for events and catering

Focus on restaurant operations and advanced dining experiences.
```

#### 🔗 Wix API Integration Notes for Restaurant Components

**Design Principles for Wix Compatibility:**

1. **Generic Data Interfaces**: All restaurant components use generic TypeScript interfaces that can be adapted to any API response format, including Wix Restaurants API.

2. **Adapter Pattern Implementation**: Components accept standardized data structures that can be populated via adapter functions, similar to the existing `wixServiceAdapter.ts` pattern used for booking components.

3. **Future Integration Points**:
   - `wixRestaurantApiClient.ts` - REST API client for Wix Restaurants
   - `wixRestaurantAdapter.ts` - Data transformation layer
   - Integration with existing `wix/index.ts` unified client

4. **API-Ready Features**:
   - Menu and restaurant data fetching with caching
   - Order placement and tracking
   - Reservation management
   - Review and rating synchronization
   - Real-time order status updates
   - Payment processing integration

5. **Component Data Patterns**:
   ```typescript
   // Generic interfaces that work with any API
   interface MenuItem {
     id: string;
     name: string;
     description: string;
     price: number;
     // ... can be adapted from Wix response
   }
   
   // Adapter function example (to be implemented)
   function adaptWixMenuItem(wixItem: WixMenuItemResponse): MenuItem {
     return {
       id: wixItem._id,
       name: wixItem.name,
       // ... transformation logic
     };
   }
   ```

This approach ensures components remain framework-agnostic while being optimized for future Wix integration.

---

## 📱 PHASE 3: TEMPLATES CREATION (Week 2-3)

### 🔐 3.1 Authentication Templates

#### ✅ Task 3.1.1: Auth Templates Batch 1
**LLM Prompt**:
```
Create these 4 authentication template components (full screens):

1. **WelcomeScreen** - App introduction with CTA
2. **LoginScreen** - Sign in with social options using LoginForm block
3. **SignupScreen** - Registration flow using SignupForm block
4. **ForgotPasswordScreen** - Password reset using ForgotPasswordForm block

Requirements:
- Use authentication blocks from src/components/blocks/auth/
- Full screen layouts with SafeAreaView
- Navigation prop handling
- Loading states for entire screen
- Error boundary handling
- Keyboard avoiding behavior
- Brand styling and imagery
- Consistent spacing and layout

File structure: src/components/templates/auth/[screen-name].tsx
Include screen-specific interfaces and navigation types.
```

#### ✅ Task 3.1.2: Auth Templates Batch 2
**LLM Prompt**:
```
Create these 4 additional authentication templates:

1. **OTPVerificationScreen** - Code verification using OTPVerificationForm
2. **CreateProfileScreen** - Initial profile setup using ProfileEditForm
3. **OnboardingScreen** - App feature introduction with slides
4. **PermissionsScreen** - Request app permissions with explanations

Same requirements as Batch 1, focus on user onboarding flow.
```

### 👤 3.2 Profile & Settings Templates

#### ✅ Task 3.2.1: Profile Templates
**LLM Prompt**:
```
Create these 4 profile and settings template components:

1. **ProfileScreen** - User profile view/edit using ProfileCard and ProfileEditForm
2. **SettingsScreen** - App preferences using SettingsPanel
3. **AccountScreen** - Account management using various settings blocks
4. **SecurityScreen** - Security settings using SecuritySettings block

Requirements:
- Use profile blocks from src/components/blocks/auth/
- Header with navigation
- Section-based layouts
- Save/cancel functionality
- Change detection
- Confirmation dialogs
- Success/error feedback

File structure: src/components/templates/profile/[screen-name].tsx
```

#### ✅ Task 3.2.2: Settings Templates
**LLM Prompt**:
```
Create these 4 additional settings templates:

1. **NotificationScreen** - Notification preferences using NotificationSettings
2. **PrivacyScreen** - Privacy controls
3. **SubscriptionScreen** - Plan management using SubscriptionCard
4. **HelpScreen** - Support and FAQs

Focus on user preferences and app configuration.
```

### 🏠 3.3 Home & Dashboard Templates

#### ✅ Task 3.3.1: Main App Templates
**LLM Prompt**:
```
Create these 8 home and dashboard template components:

1. **DashboardScreen** - Main app dashboard with widgets
2. **HomeScreen** - Primary landing page with navigation
3. **FeedScreen** - Social media feed using ActivityFeed block
4. **ExploreScreen** - Content discovery using various list blocks
5. **SearchScreen** - Search with filters using SearchForm block
6. **NotificationsScreen** - System notifications using NotificationList
7. **ActivityScreen** - Recent activity using ActivityFeed
8. **TrendingScreen** - Popular content using various list displays

Requirements:
- Use appropriate blocks for data display
- Tab navigation integration
- Pull-to-refresh functionality
- Infinite scrolling
- Empty states
- Loading skeletons
- Search integration
- Filter panels

File structure: src/components/templates/home/[screen-name].tsx
```

### 🛒 3.4 E-commerce Templates

#### ✅ Task 3.4.1: Shopping Templates
**LLM Prompt**:
```
Create these 8 e-commerce template components:

1. **ShopScreen** - Product catalog using ProductGrid
2. **ProductDetailsScreen** - Single product view using ProductDetails
3. **CartScreen** - Shopping cart using CartItem and CartSummary
4. **CheckoutScreen** - Purchase flow using CheckoutForm
5. **OrderConfirmationScreen** - Order success using OrderSummary
6. **OrderHistoryScreen** - Past orders using OrderList
7. **WishlistScreen** - Saved products using FavoritesList
8. **PaymentMethodsScreen** - Manage payments using PaymentMethodSelector

Requirements:
- Use e-commerce blocks from src/components/blocks/ecommerce/
- Shopping cart state management
- Price calculations
- Shipping integration
- Payment processing UI
- Order tracking
- Return/refund flows

File structure: src/components/templates/ecommerce/[screen-name].tsx
```

### 💬 3.5 Communication Templates

#### ✅ Task 3.5.1: Chat Templates
**LLM Prompt**:
```
Create these 8 communication template components:

1. **ChatListScreen** - Conversation list using MessageList
2. **ChatScreen** - Message conversation using MessageBubble and ChatInput
3. **ContactsScreen** - Contact list using ContactList
4. **GroupChatScreen** - Group messaging using GroupChat blocks
5. **CallScreen** - Voice/video calls using VideoCall interface
6. **StoriesScreen** - Instagram-style stories using StoryCard
7. **PostScreen** - Create new post using social blocks
8. **CommentsScreen** - Post comments using CommentThread

Requirements:
- Use social blocks from src/components/blocks/social/
- Real-time messaging patterns
- Media sharing capabilities
- Voice/video integration
- Story creation flows
- Comment threading
- User mentions/tagging

File structure: src/components/templates/communication/[screen-name].tsx
```

### 📅 3.6 Business Templates

#### ✅ Task 3.6.1: Business App Templates
**LLM Prompt**:
```
Create these 3 core business template components:

1. **CalendarScreen** - Calendar view with month/week/day views and event management
2. **EventDetailsScreen** - Event information with RSVP and attendee management  
3. **CreateEventScreen** - Add/edit events with full form functionality

File structure: src/components/templates/business/[screen-name].tsx
```

### 🏢 3.7 Booking & Service Templates (NEW CATEGORY)

#### ✅ Task 3.7.1: Service Provider Blocks (PRIORITY: HIGH)
**LLM Prompt**:
```
Create these 8 booking and service-related block components:

1. **ServiceCard** - Service display with pricing, duration, description
2. **ServiceProviderCard** - Provider profile with ratings, specialties, availability
3. **BookingCalendar** - Available time slots with provider schedule integration
4. **TimeSlotGrid** - Visual time slot selection with availability indicators
5. **BookingForm** - Complete booking form with customer details and preferences
6. **BookingSummary** - Booking confirmation with service, time, provider, and pricing
7. **AppointmentCard** - Individual appointment display with status and actions
8. **ReviewCard** - Customer reviews with ratings and photos

Requirements:
- Use React Native Reusables: Card, Button, Calendar, etc.
- Support multiple service types (appointments, classes, consultations, etc.)
- Include pricing tiers and duration options
- Provider availability and booking rules
- Customer review and rating integration
- Payment method integration readiness

File structure: src/components/blocks/booking/[component-name].tsx
```

#### ✅ Task 3.7.2: Additional Service Blocks
**LLM Prompt**:
```
Create these 6 additional service and booking components:

1. **ClassScheduleCard** - Group classes with capacity and enrollment
2. **RecurringBookingForm** - Recurring appointment setup (weekly, monthly, etc.)
3. **CancellationPolicy** - Service cancellation terms and fee display
4. **WaitlistCard** - Join waitlist for fully booked slots
5. **PackageCard** - Service packages and membership tiers
6. **ResourceBookingCard** - Equipment/room booking (separate from services)

Focus on advanced booking scenarios and business rules.
```

#### ✅ Task 3.7.3: Advanced Booking Blocks Batch 3
**LLM Prompt**:
```
Create these 8 advanced booking and service components:

1. **AvailabilityManager** - Provider availability calendar with time blocks
2. **BookingRulesCard** - Display booking policies and restrictions
3. **ServiceLocationCard** - Location details with map and directions
4. **PaymentOptionsCard** - Payment methods with deposit/full payment options
5. **BookingStatusCard** - Real-time booking status with progress indicators
6. **ServiceDurationPicker** - Flexible duration selection for services
7. **GroupBookingCard** - Book for multiple people with group discounts
8. **ServiceAddonSelector** - Optional add-on services and upgrades

Requirements:
- Complex booking logic handling
- Multi-participant booking support
- Dynamic pricing calculations
- Location-based services
- Advanced payment scenarios

File structure: src/components/blocks/booking/[component-name].tsx
```

#### ✅ Task 3.7.4: Provider Management Blocks
**LLM Prompt**:
```
Create these 6 provider-focused booking components:

1. **ProviderScheduleCard** - Weekly schedule view with availability slots
2. **BookingRequestCard** - Incoming booking requests for providers
3. **ClientHistoryCard** - Customer history and preferences for providers
4. **ServiceMetricsCard** - Booking statistics and performance metrics
5. **BlockedTimeCard** - Manage unavailable time slots and breaks
6. **ProviderNotesCard** - Internal notes and customer preferences

Focus on provider-side booking management and business operations.
```

#### ✅ Task 3.7.5: Booking & Service Templates
**LLM Prompt**:
```
Create these 10 booking and service template components:

1. **ServicesScreen** - Browse available services with categories and search
2. **ServiceDetailsScreen** - Detailed service view with provider info and booking CTA
3. **ProvidersScreen** - Browse service providers with filters and ratings
4. **ProviderDetailsScreen** - Provider profile with services, reviews, and availability
5. **BookingScreen** - Complete booking flow with service, provider, and time selection
6. **BookingConfirmationScreen** - Booking success with details and next steps
7. **MyBookingsScreen** - Customer's upcoming and past appointments
8. **BookingDetailsScreen** - Individual booking details with modify/cancel options
9. **ClassesScreen** - Group classes and workshops with enrollment
10. **ReviewsScreen** - Leave and view reviews for services and providers

Requirements:
- Use booking blocks from src/components/blocks/booking/
- Full booking flow from discovery to confirmation
- Customer management and booking history
- Provider availability and scheduling
- Review and rating systems
- Payment integration readiness
- Cancellation and rescheduling flows

File structure: src/components/templates/booking/[screen-name].tsx
```

#### ✅ Task 3.7.6: Provider Dashboard Templates
**LLM Prompt**:
```
Create these 8 provider-focused template screens:

1. **ProviderDashboardScreen** - Overview of bookings, revenue, and performance
2. **ProviderCalendarScreen** - Comprehensive calendar view with booking management
3. **ClientManagementScreen** - Customer database with history and preferences
4. **ServiceManagementScreen** - Manage services, pricing, and availability
5. **BookingRequestsScreen** - Pending requests and quick approval/rejection
6. **RevenueReportsScreen** - Financial reporting and analytics
7. **ProviderSettingsScreen** - Business settings, policies, and preferences
8. **ProviderProfileScreen** - Public profile management and optimization

Requirements:
- Business management focus
- Analytics and reporting capabilities
- Client relationship management
- Service optimization tools
- Financial tracking and reporting

File structure: src/components/templates/provider/[screen-name].tsx
```

#### ✅ Task 3.7.7: Service Business Flows
**LLM Prompt**:
```
Create these 5 service business flow components:

1. **ServiceDiscoveryFlow** - Browse → Filter → Service → Provider → Book → Confirm
2. **BookingManagementFlow** - View bookings → Modify → Reschedule → Cancel → Refund
3. **ProviderOnboardingFlow** - Register → Profile → Services → Availability → Payment → Live
4. **ReviewFlow** - Service completion → Rating → Review → Photos → Submit → Thank you
5. **ClassEnrollmentFlow** - Browse classes → Details → Schedule → Enroll → Payment → Confirmation

Requirements:
- Multi-step booking processes
- Provider and customer user journeys
- Payment processing integration points
- Notification and reminder systems
- Cancellation and refund handling

File structure: src/components/flows/booking/[flow-name].tsx
```

#### ✅ Task 3.7.8: Advanced Service Flows
**LLM Prompt**:
```
Create these 7 additional service business flows:

1. **RecurringBookingFlow** - Set up → Schedule → Payment → Confirm → Manage recurring appointments
2. **WaitlistFlow** - Join waitlist → Notification → Book slot → Confirm when available
3. **GroupBookingFlow** - Select group → Choose service → Coordinate schedules → Group payment
4. **ServiceUpgradeFlow** - Current booking → Upgrade options → Price difference → Confirm upgrade
5. **ReschedulingFlow** - Select booking → New time options → Reschedule policies → Confirm change
6. **RefundRequestFlow** - Select booking → Reason → Policy check → Process refund → Confirmation
7. **ProviderSubstitutionFlow** - Provider unavailable → Find replacement → Customer approval → Update booking

Requirements:
- Complex booking scenarios
- Multi-party coordination
- Policy enforcement
- Payment adjustments
- Customer communication

File structure: src/components/flows/booking/[flow-name].tsx
```

### 🍽️ 3.8 Restaurant & Dining Templates (NEW CATEGORY - PRIORITY: HIGH)

#### ✅ Task 3.8.1: Core Restaurant Templates
**LLM Prompt**:
```
Create these 10 restaurant and dining template components:

1. **RestaurantListScreen** - Browse restaurants with filters (cuisine, rating, delivery time, price range)
2. **RestaurantDetailScreen** - Restaurant profile with menu preview, photos, reviews, info
3. **MenuScreen** - Complete menu with categories, items, search, and dietary filters
4. **MenuItemDetailScreen** - Individual food item with photos, ingredients, customization options
5. **CartScreen** - Order review with item customization, quantity, and order summary
6. **CheckoutScreen** - Payment, delivery/pickup options, special instructions, tip
7. **OrderTrackingScreen** - Real-time order status with delivery tracking and ETA
8. **OrderHistoryScreen** - Past orders with reorder functionality and receipts
9. **ReservationScreen** - Table booking with date/time selection and party details
10. **ReviewScreen** - Leave reviews with photos and detailed rating categories

Requirements:
- Use restaurant blocks from src/components/blocks/restaurant/
- Support both delivery and pickup workflows
- Real-time order tracking and notifications
- Comprehensive search and filtering
- Photo galleries and media handling
- Payment integration readiness
- Location-based services (delivery zones, restaurant finder)
- Accessibility for screen readers and larger text
- Multi-language support for menu items
- Integration readiness with Wix Restaurants API

File structure: src/components/templates/restaurant/[screen-name].tsx
```

#### ✅ Task 3.8.2: Restaurant Management Templates
**LLM Prompt**:
```
Create these 8 restaurant management template screens:

1. **RestaurantDashboardScreen** - Overview of orders, revenue, ratings, and key metrics
2. **OrderManagementScreen** - Incoming orders with acceptance, preparation time estimates
3. **MenuManagementScreen** - Add/edit menu items, categories, pricing, and availability
4. **ReservationManagementScreen** - Table bookings with seating chart and waitlist
5. **KitchenDisplayScreen** - Order queue for kitchen staff with timing and special instructions
6. **DeliveryManagementScreen** - Delivery tracking, driver assignment, and route optimization
7. **AnalyticsScreen** - Sales reports, popular items, customer insights, and performance metrics
8. **RestaurantSettingsScreen** - Business hours, delivery zones, payment settings, staff management

Requirements:
- Restaurant owner/manager perspective
- Real-time order management
- Staff workflow optimization
- Business analytics and reporting
- Multi-location support
- Integration with POS systems
- Staff role management
- Inventory tracking capabilities

File structure: src/components/templates/restaurant-management/[screen-name].tsx
```

#### ✅ Task 3.8.3: Specialized Dining Templates
**LLM Prompt**:
```
Create these 6 specialized dining template screens:

1. **CateringScreen** - Large order management for events and corporate catering
2. **GroupOrderScreen** - Collaborative ordering for multiple people with split payments
3. **SubscriptionMealsScreen** - Meal plan subscriptions with dietary preferences and scheduling
4. **LoyaltyProgramScreen** - Rewards tracking, points redemption, and exclusive offers
5. **NutritionTrackingScreen** - Calorie counting and dietary goal tracking with restaurant meals
6. **WaitlistScreen** - Restaurant waitlist management with real-time updates and notifications

Focus on advanced dining scenarios and specialized restaurant services.
```

---

## 🔄 PHASE 4: FLOWS CREATION (Week 3-4)

### 🔐 4.1 Authentication Flows

#### ✅ Task 4.1.1: Complete Authentication Flows
**LLM Prompt**:
```
Create these 5 complete authentication flow components:

1. **CompleteOnboardingFlow** - Welcome → Signup → Profile → Permissions → Dashboard
2. **SocialLoginFlow** - Social selection → OAuth → Profile creation → Dashboard  
3. **PasswordRecoveryFlow** - Email entry → Verification → New password → Login
4. **AccountVerificationFlow** - Email/Phone → OTP → Profile completion
5. **GuestToUserFlow** - Browse as guest → Register prompt → Quick signup

Requirements:
- Use React Navigation for flow management
- State management across screens
- Progress indicators
- Back navigation handling
- Error recovery
- Success confirmations
- Analytics tracking points

File structure: src/components/flows/auth/[flow-name].tsx
Include flow-specific navigation types and state interfaces.
```

### 🛒 4.2 E-commerce Flows

#### ✅ Task 4.2.1: Shopping Flows
**LLM Prompt**:
```
Create these 5 e-commerce flow components:

1. **PurchaseFlow** - Browse → Product → Add to cart → Checkout → Payment → Confirmation
2. **ReturnRefundFlow** - Order history → Return request → Reason → Shipping → Refund
3. **WishlistToPurchaseFlow** - Wishlist → Product details → Add to cart → Checkout
4. **ProductDiscoveryFlow** - Search → Filters → Results → Product → Purchase
5. **SubscriptionFlow** - Plan selection → Payment → Confirmation → First use

Requirements:
- Shopping cart persistence
- Payment integration readiness
- Order tracking
- Inventory checks
- Price calculations
- Shipping cost calculation
- Tax handling

File structure: src/components/flows/ecommerce/[flow-name].tsx
```

### 💬 4.3 Social Flows

#### ✅ Task 4.3.1: Social Media Flows
**LLM Prompt**:
```
Create these 5 social and communication flow components:

1. **NewUserOnboardingFlow** - Welcome → Find friends → Follow suggestions → First post
2. **ContentCreationFlow** - Create → Add media → Write caption → Tag → Publish
3. **FriendConnectionFlow** - Search → Profile → Follow → Message → Chat
4. **GroupCreationFlow** - New group → Add members → Set permissions → First message
5. **LiveStreamingFlow** - Go live → Stream setup → Broadcast → End → Save

Requirements:
- Social graph management
- Media upload handling
- Real-time features
- Privacy controls
- Content moderation hooks
- Engagement tracking

File structure: src/components/flows/social/[flow-name].tsx
```

### 📅 4.4 Booking & Service Flows

#### ✅ Task 4.4.1: Core Booking Flows
**LLM Prompt**:
```
Create these 5 service business flow components:

1. **ServiceDiscoveryFlow** - Browse → Filter → Service → Provider → Book → Confirm
2. **BookingManagementFlow** - View bookings → Modify → Reschedule → Cancel → Refund
3. **ProviderOnboardingFlow** - Register → Profile → Services → Availability → Payment → Live
4. **ReviewFlow** - Service completion → Rating → Review → Photos → Submit → Thank you
5. **ClassEnrollmentFlow** - Browse classes → Details → Schedule → Enroll → Payment → Confirmation

Requirements:
- Multi-step booking processes
- Provider and customer user journeys
- Payment processing integration points
- Notification and reminder systems
- Cancellation and refund handling

File structure: src/components/flows/booking/[flow-name].tsx
```

#### ✅ Task 4.4.2: Advanced Booking Flows
**LLM Prompt**:
```
Create these 7 additional service business flows:

1. **RecurringBookingFlow** - Set up → Schedule → Payment → Confirm → Manage recurring appointments
2. **WaitlistFlow** - Join waitlist → Notification → Book slot → Confirm when available
3. **GroupBookingFlow** - Select group → Choose service → Coordinate schedules → Group payment
4. **ServiceUpgradeFlow** - Current booking → Upgrade options → Price difference → Confirm upgrade
5. **ReschedulingFlow** - Select booking → New time options → Reschedule policies → Confirm change
6. **RefundRequestFlow** - Select booking → Reason → Policy check → Process refund → Confirmation
7. **ProviderSubstitutionFlow** - Provider unavailable → Find replacement → Customer approval → Update booking

Requirements:
- Complex booking scenarios
- Multi-party coordination
- Policy enforcement
- Payment adjustments
- Customer communication

File structure: src/components/flows/booking/[flow-name].tsx
```

### 🏥 4.5 Specialized Flows

#### ✅ Task 4.5.1: Healthcare Flows
**LLM Prompt**:
```
Create these 4 healthcare flow components:

1. **AppointmentBookingFlow** - Doctor search → Availability → Book → Confirmation → Reminder
2. **SymptomCheckFlow** - Symptoms → Questions → Assessment → Recommendations → Doctor
3. **PrescriptionRefillFlow** - Medication → Request refill → Doctor approval → Pharmacy
4. **TelehealthFlow** - Appointment → Pre-check → Video call → Notes → Follow-up

File structure: src/components/flows/healthcare/[flow-name].tsx
```

#### ✅ Task 4.5.2: Transportation Flows
**LLM Prompt**:
```
Create these 4 transportation flow components:

1. **RideBookingFlow** - Location → Destination → Vehicle → Driver → Trip → Payment → Rating
2. **TripPlanningFlow** - Destination → Dates → Flights → Hotels → Activities → Booking
3. **CarRentalFlow** - Location → Dates → Car selection → Insurance → Pickup → Return
4. **NavigationFlow** - Destination → Route → Traffic → Directions → Arrival

File structure: src/components/flows/transportation/[flow-name].tsx
```

#### ✅ Task 4.5.3: Finance Flows
**LLM Prompt**:
```
Create these 4 finance flow components:

1. **MoneyTransferFlow** - Recipient → Amount → Payment method → Confirm → Send → Receipt
2. **InvestmentFlow** - Research → Select → Amount → Risk assessment → Purchase → Track
3. **LoanApplicationFlow** - Loan type → Amount → Documents → Credit check → Approval → Terms
4. **BudgetSetupFlow** - Income → Categories → Limits → Track → Alerts → Adjust

File structure: src/components/flows/finance/[flow-name].tsx
```

#### ✅ Task 4.5.4: Restaurant & Dining Flows (NEW CATEGORY)
**LLM Prompt**:
```
Create these 8 restaurant and dining flow components:

1. **RestaurantDiscoveryFlow** - Location → Cuisine → Filters → Browse → Select → Menu preview
2. **FoodOrderingFlow** - Menu → Customize → Add to cart → Review order → Checkout → Tracking
3. **TableReservationFlow** - Restaurant → Date/time → Party size → Special requests → Confirm
4. **DeliveryTrackingFlow** - Order placed → Kitchen prep → Driver assigned → En route → Delivered
5. **RestaurantReviewFlow** - Order completion → Rating → Photos → Written review → Submit
6. **LoyaltySignupFlow** - Discover program → Benefits → Account creation → First reward
7. **GroupOrderFlow** - Create group → Invite friends → Coordinate orders → Split payment → Track
8. **CateringRequestFlow** - Event details → Menu selection → Quote request → Approval → Scheduling

Requirements:
- Multi-step restaurant experiences
- Real-time order and delivery tracking
- Social features for group ordering
- Business coordination for catering
- Payment handling with tips and splitting
- Location-based services and delivery zones
- Integration readiness with Wix Restaurants API
- Notification systems for order updates
- Review and rating collection

File structure: src/components/flows/restaurant/[flow-name].tsx
```

#### ✅ Task 4.5.5: Advanced Restaurant Flows
**LLM Prompt**:
```
Create these 6 additional restaurant business flows:

1. **SubscriptionMealFlow** - Preferences → Plan selection → Scheduling → Payment → Delivery management
2. **RestaurantOnboardingFlow** - Registration → Menu setup → Photos → Delivery zones → Payment setup → Go live
3. **WaitlistFlow** - Join waitlist → Real-time updates → Table ready → Seating confirmation
4. **DietaryAccommodationFlow** - Dietary needs → Restaurant filtering → Menu customization → Order placement
5. **RefundRequestFlow** - Order issue → Report problem → Evidence → Resolution → Refund processing
6. **RestaurantPartnershipFlow** - Apply → Verification → Contract → Integration → Launch

Requirements:
- Complex restaurant business scenarios
- Subscription and recurring order management
- Restaurant partner onboarding
- Customer service and dispute resolution
- Dietary restriction handling
- Multi-party coordination

File structure: src/components/flows/restaurant/[flow-name].tsx
```

---

## 📚 PHASE 5: DOCUMENTATION & INDEX FILES (Week 4)

### 📝 5.1 Component Documentation

#### ✅ Task 5.1.1: Component Documentation
**LLM Prompt**:
```
Create comprehensive documentation for AI agents:

1. **Component Library Guide** (docs/components.md)
   - Quick reference for all components
   - Usage patterns and examples
   - Props documentation
   - Common patterns for forms, lists, navigation

2. **Block Components Guide** (docs/blocks.md)
   - All available blocks organized by category
   - When to use each block
   - Composition patterns
   - Customization examples

3. **Template Components Guide** (docs/templates.md)
   - Full screen templates
   - Navigation integration
   - State management patterns
   - Layout best practices

4. **Flow Components Guide** (docs/flows.md)
   - User journey patterns
   - Multi-screen flows
   - State persistence
   - Navigation flow management

Requirements:
- Include code examples for every component
- Explain props and interfaces clearly
- Show common usage patterns
- Include troubleshooting tips
- Optimize for AI agent consumption
```

#### ✅ Task 5.1.2: AI Agent Specific Documentation
**LLM Prompt**:
```
Create AI agent optimization documentation:

1. **AI Agent Usage Guide** (docs/ai-agent-guide.md)
   - How to discover components
   - Naming conventions
   - Import patterns
   - Common combinations
   - Error handling patterns

2. **Code Generation Patterns** (docs/generation-patterns.md)
   - Form creation patterns
   - List implementation patterns
   - Navigation setup patterns
   - State management patterns

3. **Component Selection Guide** (docs/component-selection.md)
   - Decision tree for choosing components
   - App type to component mapping
   - Feature requirements to blocks mapping

Include specific examples that AI agents can reference and adapt.
```

### 📑 5.2 Index Files Creation

#### ✅ Task 5.2.1: Main Component Index
**LLM Prompt**:
```
Create the main component index file (src/components/index.ts):

1. Export all UI components from React Native Reusables
2. Export all blocks organized by category
3. Export all templates organized by category
4. Export all flows organized by category
5. Export all types and interfaces
6. Include usage documentation in comments
7. Group related exports together
8. Include component selection guide in comments

Make it easy for AI agents to discover and import any component.
```

#### ✅ Task 5.2.2: Category-Specific Index Files
**LLM Prompt**:
```
Create index files for each category:

1. src/components/blocks/index.ts - All blocks with categories
2. src/components/blocks/auth/index.ts - Auth blocks
3. src/components/blocks/forms/index.ts - Form blocks
4. src/components/blocks/lists/index.ts - List blocks
5. src/components/blocks/ecommerce/index.ts - E-commerce blocks
6. src/components/blocks/social/index.ts - Social blocks
7. src/components/blocks/booking/index.ts - Booking & service blocks
8. src/components/blocks/health/index.ts - Health & fitness blocks
9. src/components/blocks/finance/index.ts - Finance blocks
10. src/components/blocks/restaurant/index.ts - Restaurant & dining blocks
11. src/components/templates/index.ts - All templates
12. src/components/templates/booking/index.ts - Booking templates
13. src/components/templates/provider/index.ts - Provider templates
14. src/components/templates/restaurant/index.ts - Restaurant templates
15. src/components/templates/restaurant-management/index.ts - Restaurant management templates
16. src/components/flows/index.ts - All flows
17. src/components/flows/booking/index.ts - Booking flows
18. src/components/flows/restaurant/index.ts - Restaurant flows

Each index should include:
- Named exports for all components
- Type exports
- Usage examples in comments
- Category descriptions
```

#### ✅ Task 5.2.3: Library Entry Point
**LLM Prompt**:
```
Create the main library entry point (index.ts):

1. Re-export everything from src/components/index.ts
2. Export utility functions from src/lib/
3. Export constants and types
4. Include comprehensive library documentation
5. Add version information
6. Include quick start examples
7. Add troubleshooting section

This should be the single import point for the entire library.
```

### 📖 5.3 Usage Examples

#### ✅ Task 5.3.1: App Type Examples
**LLM Prompt**:
```
Create complete app examples in the examples/ folder:

1. **Social Media App** (examples/social-media-app.tsx)
   - Login flow using auth templates
   - Feed screen using social blocks
   - Profile screen using profile templates
   - Post creation using content flows

2. **E-commerce App** (examples/ecommerce-app.tsx)
   - Product browsing using shop templates
   - Shopping cart using cart blocks
   - Checkout using purchase flows
   - Order tracking using order templates

3. **Business App** (examples/business-app.tsx)
   - Dashboard using home templates
   - Task management using business blocks
   - Calendar using scheduling templates
   - Reports using analytics blocks

4. **Health App** (examples/health-app.tsx)
   - Workout tracking using fitness blocks
   - Meal logging using nutrition templates
   - Progress tracking using health flows

5. **Booking & Service App** (examples/booking-app.tsx)
   - Service discovery using booking templates
   - Provider management using provider templates
   - Appointment booking using booking flows
   - Review and rating using service blocks

6. **Restaurant & Food Delivery App** (examples/restaurant-app.tsx)
   - Restaurant discovery using restaurant templates
   - Menu browsing and food ordering using restaurant blocks
   - Order tracking using delivery flows
   - Review and rating using restaurant review system

Each example should show:
- Complete app structure
- Navigation setup
- State management
- Component integration
- Real-world usage patterns
```

#### ✅ Task 5.3.2: Pattern Examples
**LLM Prompt**:
```
Create pattern examples showing common implementations:

1. **Form Patterns** (examples/patterns/forms.tsx)
   - Login forms, registration forms
   - Validation patterns
   - Multi-step forms
   - Dynamic forms

2. **List Patterns** (examples/patterns/lists.tsx)
   - Infinite scroll lists
   - Search and filter
   - Grid layouts
   - Pull-to-refresh

3. **Navigation Patterns** (examples/patterns/navigation.tsx)
   - Tab navigation
   - Stack navigation
   - Drawer navigation
   - Modal navigation

4. **Data Patterns** (examples/patterns/data.tsx)
   - API integration
   - State management
   - Caching patterns
   - Real-time updates

Focus on reusable patterns that AI agents can adapt for different use cases.
```

---

## 🤖 PHASE 6: LLM PROMPTS LIBRARY (Week 4)

### 📝 6.1 Setup Prompts

#### ✅ Task 6.1.1: Project Setup Prompts
**File**: `prompts/setup-prompts.md`

**LLM Prompt**:
```
Create a collection of setup prompts for AI agents:

1. **New Project Setup Prompt**
   - Complete project initialization
   - Folder structure creation
   - Configuration files setup
   - Initial component installation

2. **Navigation Setup Prompt**
   - React Navigation configuration
   - Tab navigator setup
   - Stack navigator setup
   - Deep linking configuration

3. **State Management Setup Prompt**
   - Zustand store setup
   - Redux Toolkit setup
   - Context API setup
   - Local storage integration

4. **API Integration Setup Prompt**
   - API client configuration
   - Authentication handling
   - Error handling setup
   - Data fetching patterns

5. **Testing Setup Prompt**
   - Jest configuration
   - React Native Testing Library
   - Component testing patterns
   - Integration testing

Each prompt should include step-by-step instructions and code examples.
```

### 🧱 6.2 Component Generation Prompts

#### ✅ Task 6.2.1: Block Generation Prompts
**File**: `prompts/block-generation-prompts.md`

**LLM Prompt**:
```
Create prompts for generating different types of blocks:

1. **Form Block Generation Prompt**
   - Template for creating form components
   - Validation patterns
   - Error handling
   - Submission logic

2. **List Block Generation Prompt**
   - Template for list components
   - Item rendering patterns
   - Infinite scroll setup
   - Empty states

3. **Card Block Generation Prompt**
   - Template for card components
   - Different card variants
   - Action buttons
   - Status indicators

4. **Social Block Generation Prompt**
   - Template for social components
   - User interactions
   - Real-time features
   - Media handling

5. **Business Block Generation Prompt**
   - Template for business components
   - Data visualization
   - CRUD operations
   - Export functionality

Include specific requirements and examples for each type.
```

#### ✅ Task 6.2.2: Template Generation Prompts
**File**: `prompts/template-generation-prompts.md`

**LLM Prompt**:
```
Create prompts for generating screen templates:

1. **List Screen Template Prompt**
   - Screen with list of items
   - Search and filter functionality
   - Add new item capability
   - Item detail navigation

2. **Detail Screen Template Prompt**
   - Single item display
   - Edit functionality
   - Related items
   - Action buttons

3. **Form Screen Template Prompt**
   - Data entry screen
   - Validation and submission
   - Cancel/save actions
   - Navigation handling

4. **Dashboard Screen Template Prompt**
   - Overview screen with widgets
   - Quick actions
   - Recent activity
   - Navigation to details

5. **Settings Screen Template Prompt**
   - Configuration options
   - Profile management
   - Preferences
   - Account actions

Each prompt should specify layout patterns, navigation, and state management.
```

### 🔄 6.3 Flow Generation Prompts

#### ✅ Task 6.3.1: Flow Creation Prompts
**File**: `prompts/flow-generation-prompts.md`

**LLM Prompt**:
```
Create prompts for generating user flows:

1. **Authentication Flow Prompt**
   - Multi-screen auth journey
   - State persistence
   - Error handling
   - Success navigation

2. **CRUD Flow Prompt**
   - Create, read, update, delete journey
   - Form handling
   - Confirmation dialogs
   - Success feedback

3. **Purchase Flow Prompt**
   - Shopping journey
   - Cart management
   - Payment processing
   - Order confirmation

4. **Onboarding Flow Prompt**
   - User introduction journey
   - Permission requests
   - Profile setup
   - First-time experience

5. **Social Flow Prompt**
   - Content creation journey
   - Sharing and interaction
   - Community features
   - Privacy controls

Include navigation patterns, state management, and user experience considerations.
```

### 🎯 6.4 App Generation Prompts

#### ✅ Task 6.4.1: Complete App Prompts
**File**: `prompts/app-generation-prompts.md`

**LLM Prompt**:
```
Create prompts for generating complete apps:

1. **Social Media App Prompt**
   - Complete Instagram/Twitter clone
   - User authentication
   - Feed and posts
   - User profiles
   - Messaging system

2. **E-commerce App Prompt**
   - Complete shopping app
   - Product catalog
   - Shopping cart
   - Payment integration
   - Order management

3. **Business App Prompt**
   - Complete CRM/productivity app
   - Dashboard and analytics
   - Task management
   - Team collaboration
   - Reporting features

4. **Health App Prompt**
   - Complete fitness tracking app
   - Workout logging
   - Nutrition tracking
   - Progress monitoring
   - Goal setting

5. **Finance App Prompt**
   - Complete financial management app
   - Account tracking
   - Budget management
   - Investment tracking
   - Bill management

6. **Booking & Service App Prompt**
   - Complete appointment booking app
   - Service discovery and browsing
   - Provider profiles and scheduling
   - Booking management and history
   - Review and rating system
   - Payment and cancellation handling

7. **Restaurant & Food Delivery App Prompt**
   - Complete food ordering and delivery app
   - Restaurant discovery with cuisine and location filtering
   - Menu browsing with customization options
   - Cart management and order placement
   - Real-time order tracking and delivery
   - Table reservation system
   - Review and rating for restaurants and food
   - Loyalty program and promotions
   - Group ordering and payment splitting

Each prompt should specify the complete feature set, navigation structure, and data requirements.
```

---

## ✅ FINAL CHECKLIST & TESTING (Week 4)

### 🧪 Testing Tasks

#### ✅ Task 7.1: Component Testing
- [ ] Test all UI components render correctly
- [ ] Verify all block components work independently
- [ ] Test all template components with navigation
- [ ] Verify all flows work end-to-end
- [ ] Test on iOS and Android devices
- [ ] Verify TypeScript definitions are correct
- [ ] Test accessibility features
- [ ] Performance testing with large datasets

#### ✅ Task 7.2: AI Agent Testing
- [ ] Test component discovery through index files
- [ ] Verify prompts generate working code
- [ ] Test complete app generation using prompts
- [ ] Verify documentation is AI-readable
- [ ] Test import/export consistency
- [ ] Validate TypeScript interfaces work with AI
- [ ] Test example code runs without errors

#### ✅ Task 7.3: Integration Testing
- [ ] Test navigation between all screens
- [ ] Verify state management works across flows
- [ ] Test data persistence and loading
- [ ] Verify API integration patterns work
- [ ] Test error handling throughout the system
- [ ] Performance testing under load
- [ ] Cross-platform compatibility testing

### 📋 Final Deliverables Checklist

#### ✅ Components (350+ total)
- [ ] 36 UI components (React Native Reusables) ✅
- [ ] 200+ block components across 13 categories (including restaurant)
- [ ] 122+ template components (full screens)
- [ ] 66+ flow components (user journeys)

#### ✅ Documentation
- [ ] Component library guide
- [ ] AI agent usage guide
- [ ] Code generation patterns
- [ ] App type examples
- [ ] Troubleshooting guide

#### ✅ Index Files
- [ ] Main component index
- [ ] Category-specific indices
- [ ] Type definitions index
- [ ] Example code index

#### ✅ Prompts Library
- [ ] Setup prompts for AI agents
- [ ] Component generation prompts
- [ ] Template generation prompts
- [ ] Flow generation prompts
- [ ] Complete app generation prompts

#### ✅ Examples
- [ ] 4 complete app examples
- [ ] Pattern implementation examples
- [ ] Flow usage examples
- [ ] Real-world integration examples

---

## 🎯 SUCCESS METRICS

### Quantitative Goals
- [ ] **350+ components** available for AI generation
- [ ] **98% app type coverage** across mobile app categories (including restaurant/food delivery)
- [ ] **<5 minutes** to generate basic app using AI prompts
- [ ] **<30 minutes** to generate complex app using AI prompts
- [ ] **100% TypeScript coverage** for all components
- [ ] **Zero breaking changes** across component APIs

### Qualitative Goals
- [ ] **AI agents can easily discover** all available components
- [ ] **Consistent APIs** across similar component types
- [ ] **Professional quality** visual design for all components
- [ ] **Comprehensive documentation** that AI can understand
- [ ] **Real-world usability** in production applications
- [ ] **Extensibility** for custom business requirements

---

## 🚀 POST-COMPLETION ROADMAP

### Phase 7: Advanced Features (Week 5-6)
- [ ] Animation library integration
- [ ] Advanced state management patterns
- [ ] Real-time data synchronization
- [ ] Offline-first capabilities
- [ ] Performance optimization
- [ ] Security best practices

### Phase 8: AI Enhancement (Week 7-8)
- [ ] AI prompt optimization based on usage
- [ ] Auto-generation of new components
- [ ] Component suggestion algorithms
- [ ] Usage analytics and optimization
- [ ] Advanced AI agent training

### Maintenance & Evolution
- [ ] Monthly component library updates
- [ ] New app category support
- [ ] Community contribution integration
- [ ] AI model training improvements
- [ ] Performance monitoring and optimization

---

**Total Estimated Timeline: 4-6 weeks**  
**Total Components: 350+**  
**App Categories Covered: 23+ (including restaurant/food delivery)**  
**AI Agent Ready: 100%**