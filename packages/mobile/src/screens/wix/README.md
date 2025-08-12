# Wix Screens - Organized Architecture

This directory contains all Wix integration screens for the mobile app, organized using a **domain-driven folder structure** for better maintainability and developer experience.

## 🏗️ Architecture Overview

Our Wix screens follow a **layered architecture pattern** with **domain-based organization**:

```
src/screens/wix/
├── auth/                    # 👤 Authentication & Members
├── ecommerce/              # 🛍️ E-commerce & Shopping  
├── services/               # 📅 Booking & Services
├── restaurant/             # 🍽️ Food & Restaurant
├── content/                # 📝 Content Management
├── navigation/             # 🧭 Navigation Components
└── shared/                 # 🔧 Shared Utilities
```

## 📁 Folder Structure Pattern

Each screen follows a **consistent co-location pattern**:

```
ScreenName/
├── ScreenName.tsx          # Main screen component
├── styles.ts               # Screen-specific styles  
├── hooks.ts                # Screen-specific logic
├── services.ts             # API calls and business logic
└── __tests__/              # Co-located tests
    └── ScreenName.test.tsx
```

## 🎯 Available Screens by Domain

### 👤 **Authentication** (`auth/`)
- **MemberAuthScreen** - User authentication and profile management

### 🛍️ **E-commerce** (`ecommerce/`)
- **ProductListScreen** - Browse Wix Store products with filters
- **ProductDetailScreen** - View individual product details  
- **CartScreen** - Shopping cart and checkout flow

### 📅 **Services & Booking** (`services/`)
- **ServicesListScreen** - Browse Wix Bookings services
- **ServiceDetailScreen** - View service details and book appointments
- **BookingScreen** - Book appointments and services
- **MyBookingsScreen** - View user's booking history

### 🍽️ **Restaurant** (`restaurant/`)
- **FoodScreen** - Restaurant ordering interface with menu

### 📝 **Content** (`content/`)
- **CMSScreen** - Content management and blog posts

### 🧭 **Navigation** (`navigation/`)
- **ProductsNavigation** - E-commerce flow navigation
- **ServicesNavigation** - Booking flow navigation

## 🔧 Shared Utilities (`shared/`)

- **`types.ts`** - Common TypeScript interfaces and types
- **`constants.ts`** - Shared constants and configuration
- **`__tests__/`** - Cross-domain integration tests
- **API clients and adapters** - Centralized Wix API integrations

## 📦 Usage Examples

### Import Individual Screens
```typescript
import { CartScreen, ProductListScreen } from '@/screens/wix';
import { ServicesListScreen } from '@/screens/wix/services';
```

### Import Types and Constants
```typescript
import { 
  WixApiResponse, 
  BaseWixScreenProps,
  WIX_SCREEN_IDS,
  PAGINATION 
} from '@/screens/wix';
```

### Domain-Specific Imports
```typescript
// E-commerce related
import { CartScreen, ProductDetailScreen } from '@/screens/wix/ecommerce';

// Services related  
import { BookingScreen, MyBookingsScreen } from '@/screens/wix/services';
```

## 🧪 Testing Strategy

- **Co-located Tests**: Each screen has tests in its own `__tests__/` folder
- **Domain-Specific Tests**: Tests related to specific domains stay within those domains
- **Integration Tests**: Cross-domain tests in `shared/__tests__/`
- **Runtime Error Tests**: Comprehensive error handling validation

## 🔗 Integration Points

All screens integrate with:
- **Wix Store API** for e-commerce functionality
- **Wix Bookings API** for appointment management  
- **Wix CMS API** for content management
- **Wix Members API** for user authentication
- **Unified cart and member contexts** for state management

## 🚀 Benefits of This Architecture

### For Developers:
- **Logical Grouping**: Related functionality is co-located
- **Predictable Structure**: Consistent patterns across all screens
- **Easy Navigation**: Find what you need quickly
- **Scalable**: Add new features following established patterns

### For AI Agents:
- **Semantic Organization**: Business domains clearly separated
- **Context-Rich**: Related files are grouped together
- **Focused Scope**: Work on specific domains without affecting others
- **Clear Dependencies**: Service files, hooks, and styles are adjacent to screens

### For Maintenance:
- **Reduced Coupling**: Changes within a domain stay within that domain
- **Better Testing**: Tests are co-located with their functionality
- **Easier Refactoring**: Clear boundaries between different business areas
- **Future-Proof**: New features follow the same organizational pattern

## 🛠️ Development Guidelines

1. **Follow the Pattern**: New screens should follow the established folder structure
2. **Co-locate Related Files**: Keep styles, hooks, services, and tests near the screen
3. **Use Shared Utilities**: Leverage common types and constants from `shared/`
4. **Domain Boundaries**: Keep domain-specific logic within domain folders
5. **Clean Imports**: Use the organized export structure for better developer experience

## 🔥 Runtime Error Prevention

This architecture includes **comprehensive runtime error prevention**:

- **Null Safety**: All array accesses and object property accesses are protected
- **Defensive Programming**: Safe fallbacks for undefined/null data
- **Error Boundaries**: Proper error handling at screen level
- **Type Safety**: Strong TypeScript typing prevents runtime errors
- **Tested Error Scenarios**: Comprehensive test coverage for error conditions

## 📱 Original Wix Services Documentation

For detailed information about the Services module specifically, see the archived implementation details below covering the booking flow, API integration, and component usage.

This architecture transforms our Wix screens from a flat, hard-to-navigate structure into a **clean, domain-driven organization** that scales with our application! 🎉