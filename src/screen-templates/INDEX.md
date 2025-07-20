# Screen Templates Index

A comprehensive catalog of all available React Native screen templates in this project.

## Quick Reference

| Template | Type | Complexity | Use Case | File Path |
|----------|------|------------|----------|-----------|
| [AuthScreenTemplate](#authscreentemplate) | Basic | Simple | Authentication flows | `/AuthScreenTemplate.tsx` |
| [DashboardScreenTemplate](#dashboardscreentemplate) | Basic | Simple | Dashboard/overview screens | `/DashboardScreenTemplate.tsx` |
| [FormScreenTemplate](#formscreentemplate) | Basic | Simple | Data input forms | `/FormScreenTemplate.tsx` |
| [ListScreenTemplate](#listscreentemplate) | Basic | Simple | List/grid displays | `/ListScreenTemplate.tsx` |
| [ProductListScreen](#productlistscreen) | Complex | Advanced | E-commerce product lists | `/examples/ProductListScreen/` |
| [ProductDetailScreen](#productdetailscreen) | Complex | Advanced | Product detail views | `/examples/ProductDetailScreen/` |
| [CartScreen](#cartscreen) | Complex | Advanced | Shopping cart management | `/examples/CartScreen/` |
| [CheckoutScreen](#checkoutscreen) | Complex | Advanced | Purchase/payment flows | `/examples/CheckoutScreen/` |
| [SearchScreen](#searchscreen) | Complex | Advanced | Search and filtering | `/examples/SearchScreen/` |

---

## Basic Templates

### AuthScreenTemplate
**File**: `AuthScreenTemplate.tsx`
**Size**: ~520 lines
**Complexity**: ⭐⭐⭐

#### Description
Comprehensive authentication template supporting multiple modes (login, signup, forgot password) with validation, social login options, and accessibility features.

#### Key Features
- Multi-mode authentication (login/signup/forgot password)
- Social login integration (Google, Facebook, Apple)
- Form validation with error handling
- Loading states and animations
- Accessibility support
- Keyboard management
- Theme integration

#### Use Cases
- User login screens
- Registration flows
- Password reset functionality
- Social authentication
- Account creation

#### Props Interface
```typescript
interface AuthScreenTemplateProps {
  mode?: 'login' | 'signup' | 'forgot';
  onLogin?: (email: string, password: string) => Promise<void>;
  onSignup?: (email: string, password: string, name: string) => Promise<void>;
  onForgotPassword?: (email: string) => Promise<void>;
  onSocialLogin?: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  showSocialLogins?: boolean;
  allowModeSwitch?: boolean;
}
```

#### Quick Start
```typescript
import { AuthScreenTemplate } from '../screen-templates/AuthScreenTemplate';

export const LoginScreen = () => (
  <AuthScreenTemplate
    mode="login"
    onLogin={handleLogin}
    showSocialLogins={true}
  />
);
```

---

### DashboardScreenTemplate
**File**: `DashboardScreenTemplate.tsx`
**Size**: ~269 lines
**Complexity**: ⭐⭐

#### Description
Dashboard template with customizable stat cards, quick actions, and content sections. Perfect for overview screens and admin panels.

#### Key Features
- Stat cards with icons and trends
- Quick action buttons
- Custom content sections
- Pull-to-refresh functionality
- Responsive grid layout
- Theme integration

#### Use Cases
- App dashboards
- Admin panels
- Overview screens
- Analytics displays
- Control centers

#### Props Interface
```typescript
interface DashboardScreenTemplateProps {
  title?: string;
  stats?: StatCard[];
  quickActions?: QuickAction[];
  onRefresh?: () => Promise<void>;
  children?: React.ReactNode;
}
```

#### Quick Start
```typescript
import { DashboardScreenTemplate } from '../screen-templates/DashboardScreenTemplate';

export const AdminDashboard = () => (
  <DashboardScreenTemplate
    title="Admin Dashboard"
    stats={[{ label: 'Users', value: '1,234', trend: '+12%' }]}
    quickActions={[{ label: 'Add User', onPress: addUser }]}
  />
);
```

---

### FormScreenTemplate
**File**: `FormScreenTemplate.tsx`
**Size**: ~263 lines
**Complexity**: ⭐⭐

#### Description
Flexible form template with validation, field management, and submission handling. Supports various input types and layouts.

#### Key Features
- Dynamic field rendering
- Built-in validation
- Error handling and display
- Loading states
- Keyboard management
- Required field indicators
- Theme integration

#### Use Cases
- Data entry forms
- Settings screens
- Profile editing
- Survey forms
- Contact forms

#### Props Interface
```typescript
interface FormScreenTemplateProps {
  title?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitButtonText?: string;
  validationRules?: Record<string, ValidationRule>;
}
```

#### Quick Start
```typescript
import { FormScreenTemplate } from '../screen-templates/FormScreenTemplate';

export const ProfileForm = () => (
  <FormScreenTemplate
    title="Edit Profile"
    fields={profileFields}
    onSubmit={handleSubmit}
    submitButtonText="Save Profile"
  />
);
```

---

### ListScreenTemplate
**File**: `ListScreenTemplate.tsx`
**Size**: ~239 lines
**Complexity**: ⭐⭐

#### Description
List template with search, filtering, and various display modes. Handles empty states, loading, and refresh functionality.

#### Key Features
- Search functionality
- Multiple display modes (list/grid)
- Pull-to-refresh
- Empty state handling
- Loading indicators
- Add button (floating)
- Theme integration

#### Use Cases
- Item listings
- Contact lists
- File browsers
- Image galleries
- Content feeds

#### Props Interface
```typescript
interface ListScreenTemplateProps<T> {
  title?: string;
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  onSearch?: (query: string) => void;
  onRefresh?: () => Promise<void>;
  onAdd?: () => void;
  displayMode?: 'list' | 'grid';
  emptyMessage?: string;
}
```

#### Quick Start
```typescript
import { ListScreenTemplate } from '../screen-templates/ListScreenTemplate';

export const ContactList = () => (
  <ListScreenTemplate
    title="Contacts"
    data={contacts}
    renderItem={renderContact}
    onSearch={searchContacts}
    onAdd={addContact}
  />
);
```

---

## Complex Examples

### ProductListScreen
**Directory**: `examples/ProductListScreen/`
**Files**: `ProductListScreen.tsx`, `components/`, `__tests__/`
**Size**: ~400+ lines (with tests)
**Complexity**: ⭐⭐⭐⭐

#### Description
Full-featured e-commerce product listing with advanced filtering, sorting, wishlist functionality, and comprehensive testing.

#### Key Features
- Advanced product filtering
- Sort options (price, rating, name)
- Wishlist integration
- Shopping cart quick-add
- Product grid/list views
- Loading and error states
- Comprehensive test suite

#### Use Cases
- E-commerce product catalogs
- Marketplace listings
- Inventory displays
- Product browsers
- Shopping interfaces

#### Key Components
- `ProductCard`: Individual product display
- `FilterModal`: Advanced filtering interface
- `SortOptions`: Sort controls
- `ProductGrid`: Grid layout manager

---

### ProductDetailScreen
**Directory**: `examples/ProductDetailScreen/`
**Files**: `ProductDetailScreen.tsx`, `components/`, `__tests__/`
**Size**: ~350+ lines (with tests)
**Complexity**: ⭐⭐⭐⭐

#### Description
Detailed product view with image gallery, reviews, specifications, and purchase options.

#### Key Features
- Image carousel/gallery
- Product specifications
- Customer reviews
- Related products
- Add to cart/wishlist
- Share functionality
- Rating and reviews

#### Use Cases
- E-commerce product pages
- Item detail views
- Product specifications
- Review systems
- Purchase interfaces

#### Key Components
- `ImageGallery`: Product image carousel
- `ReviewSection`: Customer reviews
- `SpecificationList`: Product details
- `PurchaseSection`: Buy/cart controls

---

### CartScreen
**Directory**: `examples/CartScreen/`
**Files**: `CartScreen.tsx`, `components/`, `__tests__/`
**Size**: ~300+ lines (with tests)
**Complexity**: ⭐⭐⭐⭐

#### Description
Complete shopping cart implementation with quantity management, pricing calculations, and checkout integration.

#### Key Features
- Item quantity management
- Price calculations
- Discount/coupon handling
- Shipping options
- Cart persistence
- Checkout navigation
- Empty cart states

#### Use Cases
- E-commerce shopping carts
- Order management
- Purchase summaries
- Checkout flows
- Price calculators

#### Key Components
- `CartItem`: Individual cart item
- `PricingSummary`: Total calculations
- `CouponInput`: Discount codes
- `CheckoutButton`: Proceed to payment

---

### CheckoutScreen
**Directory**: `examples/CheckoutScreen/`
**Files**: `CheckoutScreen.tsx`, `components/`, `__tests__/`
**Size**: ~400+ lines (with tests)
**Complexity**: ⭐⭐⭐⭐⭐

#### Description
Complete checkout flow with address management, payment processing, and order confirmation.

#### Key Features
- Multi-step checkout process
- Address book integration
- Payment method selection
- Order review and confirmation
- Progress indicator
- Error handling
- Receipt generation

#### Use Cases
- E-commerce checkout
- Payment processing
- Order management
- Billing systems
- Purchase completion

#### Key Components
- `AddressSelection`: Shipping addresses
- `PaymentMethods`: Payment options
- `OrderSummary`: Final review
- `ProgressSteps`: Checkout progress

---

### SearchScreen
**Directory**: `examples/SearchScreen/`
**Files**: `SearchScreen.tsx`, `components/`, `__tests__/`
**Size**: ~250+ lines (with tests)
**Complexity**: ⭐⭐⭐

#### Description
Advanced search interface with filters, suggestions, and result management.

#### Key Features
- Real-time search suggestions
- Advanced filtering options
- Search history
- Result categorization
- Empty state handling
- Voice search support
- Recent searches

#### Use Cases
- Product search
- Content discovery
- Data filtering
- Information retrieval
- Site-wide search

#### Key Components
- `SearchInput`: Search field with suggestions
- `FilterPanel`: Advanced filters
- `SearchResults`: Result display
- `SearchHistory`: Recent searches

---

## Template Selection Guide

### By Complexity Level

#### Beginner (⭐⭐)
- **DashboardScreenTemplate**: Simple stats and actions
- **FormScreenTemplate**: Basic form handling
- **ListScreenTemplate**: Simple list displays

#### Intermediate (⭐⭐⭐)
- **AuthScreenTemplate**: Authentication flows
- **SearchScreen**: Search and filtering

#### Advanced (⭐⭐⭐⭐+)
- **ProductListScreen**: Complex product catalogs
- **ProductDetailScreen**: Detailed product views
- **CartScreen**: Shopping cart logic
- **CheckoutScreen**: Complete purchase flows

### By Use Case

#### E-commerce Applications
1. **ProductListScreen** - Product catalogs
2. **ProductDetailScreen** - Product details
3. **CartScreen** - Shopping cart
4. **CheckoutScreen** - Purchase flow
5. **SearchScreen** - Product search

#### Business Applications
1. **DashboardScreenTemplate** - Overview screens
2. **FormScreenTemplate** - Data entry
3. **ListScreenTemplate** - Item management
4. **AuthScreenTemplate** - User access

#### Content Applications
1. **ListScreenTemplate** - Content feeds
2. **SearchScreen** - Content discovery
3. **DashboardScreenTemplate** - Content metrics
4. **FormScreenTemplate** - Content creation

## Getting Started

1. **Choose Your Template**: Use the table above or selection guide
2. **Copy Template**: Follow the guidelines in `TEMPLATE_GUIDELINES.md`
3. **Customize**: Modify for your specific needs
4. **Test**: Run the included tests or create new ones
5. **Integrate**: Add to your app's navigation structure

## Contributing

To add new templates to this index:

1. Create your template following the guidelines
2. Add entry to the Quick Reference table
3. Add detailed section with description, features, and examples
4. Update the selection guides
5. Test your template thoroughly

## Support

- Review `TEMPLATE_GUIDELINES.md` for detailed usage instructions
- Check `README.md` for project setup and architecture
- Study existing templates for patterns and best practices
- Refer to individual test files for usage examples 