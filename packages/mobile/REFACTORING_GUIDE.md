# 🏗️ Wix Screens Refactoring Guide

## 🔥 The Problem

Our Wix screens have grown massive (up to 1,394 lines!) due to:
- **Mixed concerns** - API calls, state management, UI, and styles all in one file
- **Inline styles** - Hundreds of lines of StyleSheet objects
- **Duplicated logic** - Similar patterns copied across screens
- **Hard to maintain** - Changes require touching massive files
- **Hard to test** - Tightly coupled code is difficult to unit test

## 🎯 The Solution: Layered Architecture

We've created a **5-layer architecture** that separates concerns and keeps screens thin:

```
📱 SCREEN LAYER (< 200 lines)
├── Pure presentation logic
├── Event handlers
└── UI composition

🪝 HOOKS LAYER  
├── Screen-specific state management
├── Business logic
└── Side effects

🏗️ SERVICE LAYER
├── API calls
├── Data transformations  
└── Business rules

🎨 STYLES LAYER
├── Theme-aware styles
├── Responsive layouts
└── Reusable style objects

🧩 COMPONENTS LAYER
├── Reusable UI components
├── Consistent interfaces
└── Isolated concerns
```

## 📋 Refactoring Checklist

### ✅ Step 1: Create Service Layer
```typescript
// services/WixProductService.ts
class WixProductService {
  async getProducts(query: ProductQuery): Promise<ProductListResponse> {
    // API calls and data transformation
  }
}
```

### ✅ Step 2: Extract Styles  
```typescript
// styles/ProductListStyles.ts
export const createProductListStyles = (theme: Theme) => StyleSheet.create({
  container: { /* styles */ },
  // ... all styles organized by component
});
```

### ✅ Step 3: Create Custom Hooks
```typescript
// hooks/useProductList.ts
export const useProductList = (query?: ProductQuery) => {
  // State management, API calls, business logic
  return { products, loading, actions };
};
```

### ✅ Step 4: Build Reusable Components
```typescript
// components/product/ProductCard.tsx
export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  // Focused, reusable component
};
```

### ✅ Step 5: Refactor Screen
```typescript
// screens/wix/ProductListScreen.tsx (< 200 lines!)
const ProductListScreen = () => {
  const { products, loading, actions } = useProductList();
  const styles = createProductListStyles(theme);
  
  return (
    <SafeAreaView style={styles.container}>
      <ProductGrid 
        products={products}
        loading={loading}
        {...actions}
      />
    </SafeAreaView>
  );
};
```

## 🎯 Results

### Before vs After

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Lines of Code** | 1,394 | 185 | **87% reduction** |
| **Maintainability** | ❌ Hard | ✅ Easy | **Dramatic improvement** |
| **Testability** | ❌ Difficult | ✅ Simple | **Each layer testable** |
| **Reusability** | ❌ None | ✅ High | **Components/hooks/services** |
| **Consistency** | ❌ Varied | ✅ Standardized | **Same patterns everywhere** |

## 📁 File Structure

```
src/
├── services/
│   ├── WixProductService.ts      # Product API calls
│   ├── WixBookingService.ts      # Booking API calls  
│   └── WixRestaurantService.ts   # Restaurant API calls
├── hooks/
│   ├── useProductList.ts         # Product list logic
│   ├── useBookingFlow.ts         # Booking flow logic
│   └── useServiceDetail.ts       # Service detail logic
├── styles/
│   ├── ProductListStyles.ts      # Product screen styles
│   ├── BookingStyles.ts          # Booking screen styles
│   └── ServiceStyles.ts          # Service screen styles
├── components/
│   ├── product/
│   │   ├── ProductCard.tsx       # Product card component
│   │   └── ProductGrid.tsx       # Product grid component
│   ├── booking/
│   │   ├── BookingCard.tsx       # Booking card component
│   │   └── TimeSlotPicker.tsx    # Time slot picker
│   └── common/
│       ├── LoadingState.tsx      # Loading state component
│       ├── ErrorState.tsx        # Error state component
│       └── EmptyState.tsx        # Empty state component
└── screens/wix/
    ├── ProductListScreen.tsx     # Thin screen (< 200 lines)
    ├── BookingScreen.tsx         # Thin screen (< 200 lines)
    └── ServiceDetailScreen.tsx   # Thin screen (< 200 lines)
```

## 🚀 Implementation Plan

### Phase 1: Foundation (DONE ✅)
- ✅ Create service layer architecture
- ✅ Extract common styles
- ✅ Build reusable components
- ✅ Develop custom hooks pattern
- ✅ Create refactored example (ProductListScreen)

### Phase 2: Refactor Largest Screens
1. **ProductListScreen** (1,394 lines) → **185 lines** ✅ Example created
2. **ServiceDetailScreen** (1,069 lines) → Target: **< 200 lines**
3. **ServicesListScreen** (1,031 lines) → Target: **< 200 lines**

### Phase 3: Apply to All Screens  
4. **ProductDetailScreen** (844 lines) → Target: **< 200 lines**
5. **CartScreen** (816 lines) → Target: **< 200 lines**
6. **CMSScreen** (735 lines) → Target: **< 200 lines**
7. **MemberAuthScreen** (675 lines) → Target: **< 200 lines**
8. **BookingScreen** (663 lines) → Target: **< 200 lines**
9. **FoodScreen** (657 lines) → Target: **< 200 lines**
10. **MyBookingsScreen** (612 lines) → Target: **< 200 lines**

## 🎯 Benefits

### For Developers
- **Faster development** - Reusable components and clear patterns
- **Easier debugging** - Isolated concerns and clear data flow
- **Better testing** - Each layer can be tested independently
- **Reduced complexity** - Smaller, focused files

### For Maintenance  
- **Easier updates** - Changes isolated to specific layers
- **Consistent patterns** - Same architecture across all screens
- **Reduced bugs** - Less coupling, clearer interfaces
- **Better documentation** - Self-documenting code structure

### For Performance
- **Better code splitting** - Services and components can be lazy loaded
- **Optimized re-renders** - Isolated state management
- **Smaller bundles** - Unused components/styles can be tree-shaken
- **Better caching** - Services can implement sophisticated caching

## 🔧 Quick Start

To refactor a screen:

1. **Extract styles** to `styles/ScreenNameStyles.ts`
2. **Create service** in `services/WixScreenService.ts`  
3. **Build custom hook** in `hooks/useScreenName.ts`
4. **Create components** in `components/screen/`
5. **Refactor screen** to use the above layers

Result: A maintainable, testable screen under 200 lines!

---

**Next Action:** Start with the 3 largest screens to get maximum impact! 🚀
