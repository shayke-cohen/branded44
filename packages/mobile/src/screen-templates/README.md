# Screen Templates

This directory contains all screen templates organized into two categories:

- **Basic Templates**: Simple, reusable starting points for common patterns
- **Complex Examples**: Full-featured reference implementations with advanced functionality

All templates include best practices for styling, accessibility, and testing.

## Basic Templates

These are simple, customizable starting points for common screen patterns:

### Available Templates

### 1. ListScreenTemplate
**Purpose**: Display data in a searchable, filterable list format

**Features**:
- Search functionality
- Pull-to-refresh
- Empty state handling
- Add button integration
- Status badges
- Theme-aware styling

**Use Cases**:
- Product listings
- User directories
- Task lists
- Content feeds
- Inventory management

**Props**:
```typescript
interface ListScreenTemplateProps {
  title?: string;
  searchable?: boolean;
  refreshable?: boolean;
  onItemPress?: (item: ListItem) => void;
  onAdd?: () => void;
  emptyMessage?: string;
}
```

### 2. FormScreenTemplate
**Purpose**: Create or edit data with proper validation and UX

**Features**:
- Form validation
- Error handling
- Keyboard management
- Loading states
- Required field indicators
- Auto-save drafts (customizable)

**Use Cases**:
- User profile editing
- Contact forms
- Product creation
- Settings configuration
- Survey forms

**Props**:
```typescript
interface FormScreenTemplateProps {
  title?: string;
  initialData?: Partial<FormData>;
  onSave?: (data: FormData) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  loading?: boolean;
}
```

### 3. DashboardScreenTemplate
**Purpose**: Display overview information and quick actions

**Features**:
- Stat cards with change indicators
- Quick action buttons
- Custom content sections
- Pull-to-refresh
- Responsive grid layout

**Use Cases**:
- Admin dashboards
- Analytics overviews
- Home screens
- Performance metrics
- Business intelligence

**Props**:
```typescript
interface DashboardScreenTemplateProps {
  title?: string;
  stats?: StatCard[];
  quickActions?: QuickAction[];
  onRefresh?: () => void;
  onStatPress?: (stat: StatCard) => void;
  children?: React.ReactNode;
}
```

### 4. AuthScreenTemplate
**Purpose**: Handle authentication flows (login, signup, forgot password)

**Features**:
- Multi-mode support (login/signup/forgot password)
- Form validation
- Social login integration
- Password visibility toggle
- Mode switching
- Loading states

**Use Cases**:
- User authentication
- Account creation
- Password recovery
- Social login flows
- Multi-step authentication

**Props**:
```typescript
interface AuthScreenTemplateProps {
  mode?: 'login' | 'signup' | 'forgot-password';
  appName?: string;
  onAuth?: (data: AuthData, mode: AuthMode) => void;
  onModeChange?: (mode: AuthMode) => void;
  loading?: boolean;
  socialLogin?: boolean;
  onSocialLogin?: (provider: 'google' | 'facebook' | 'apple') => void;
}
```

## Complex Examples

These are full-featured reference implementations located in the `examples/` folder:

### Available Examples

#### **ProductListScreen** (`examples/ProductListScreen/`)
- Complete product catalog with categories
- Search and filtering functionality
- Grid/list view toggle
- Add to cart integration
- Comprehensive test coverage

#### **ProductDetailScreen** (`examples/ProductDetailScreen/`)  
- Detailed product view with image gallery
- Size and color selection
- Add to cart with validation
- Reviews and ratings display
- Back navigation

#### **CartScreen** (`examples/CartScreen/`)
- Shopping cart with quantity management
- Remove items functionality
- Price calculations with tax and shipping
- Checkout flow integration
- Empty state handling

#### **SearchScreen** (`examples/SearchScreen/`)
- Advanced search with filters
- Category and brand filtering
- Price range selection
- Sort functionality
- Search history

#### **CheckoutScreen** (`examples/CheckoutScreen/`)
- Multi-step checkout process
- Address and payment forms
- Form validation and error handling
- Order summary and confirmation
- Payment integration ready

### When to Use Examples vs Templates

- **Use Basic Templates** when starting a new screen from scratch
- **Use Complex Examples** when you need advanced functionality or want to see complete implementations
- **Reference Examples** to understand how to integrate multiple features together

## How to Use Templates

### 1. Copy the Template
Copy the template file you need into your `src/screens/` directory:

**For Basic Templates:**
```bash
cp src/screen-templates/ListScreenTemplate.tsx src/screens/MyListScreen/MyListScreen.tsx
```

**For Complex Examples:**
```bash
cp -r src/screen-templates/examples/ProductListScreen src/screens/MyProductList
```

### 2. Customize the Interface
Update the TypeScript interfaces to match your data structure:

```typescript
// Change from generic ListItem to your specific type
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}
```

### 3. Update the Component
- Rename the component
- Update the data source
- Customize the render functions
- Add your specific business logic

### 4. Create Tests
Copy the test pattern from existing templates:

```bash
mkdir src/screens/MyListScreen/__tests__
cp src/screen-templates/__tests__/ListScreenTemplate.test.tsx src/screens/MyListScreen/__tests__/MyListScreen.test.tsx
```

## Customization Guidelines

### Styling
- All templates use the theme context
- Customize colors by updating theme variables
- Maintain consistent spacing (8px grid)
- Keep accessibility in mind

### Data Integration
- Replace sample data with your API calls
- Use React Query or similar for data fetching
- Handle loading and error states appropriately
- Implement proper cache invalidation

### Navigation
- Add navigation logic for item selections
- Implement modal or stack navigation as needed
- Handle deep linking if required
- Manage navigation state properly

### Testing
- Test all user interactions
- Verify accessibility features
- Test error scenarios
- Ensure proper data flow

## Best Practices

### Performance
- Use `React.memo()` for expensive list items
- Implement proper `FlatList` optimization
- Avoid inline functions in render
- Use `useCallback` for event handlers

### Accessibility
- Add proper `testID` props
- Include accessibility labels
- Support screen readers
- Ensure proper focus management

### Error Handling
- Validate all user inputs
- Provide clear error messages
- Handle network failures gracefully
- Implement retry mechanisms

### Code Quality
- Follow TypeScript best practices
- Use proper component composition
- Keep components focused and single-purpose
- Document complex business logic

## Integration Examples

### Using ListScreenTemplate for Products
```typescript
import ListScreenTemplate from '../screen-templates/ListScreenTemplate';

const ProductListScreen = () => {
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', {productId: product.id});
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  return (
    <ListScreenTemplate
      title="Products"
      onItemPress={handleProductPress}
      onAdd={handleAddProduct}
      emptyMessage="No products available"
    />
  );
};
```

### Using FormScreenTemplate for User Profile
```typescript
import FormScreenTemplate from '../screen-templates/FormScreenTemplate';

const EditProfileScreen = ({route}) => {
  const {user} = route.params;

  const handleSave = async (formData: ProfileData) => {
    try {
      await updateUserProfile(user.id, formData);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <FormScreenTemplate
      title="Edit Profile"
      initialData={user}
      onSave={handleSave}
      onCancel={() => navigation.goBack()}
      isEditing={true}
    />
  );
};
```

## Testing Templates

Each template should include comprehensive tests covering:

- **Rendering**: Component mounts without errors
- **Interactions**: User actions trigger correct callbacks
- **Validation**: Form validation works correctly
- **States**: Loading, error, and empty states
- **Accessibility**: Screen reader compatibility
- **Edge Cases**: Missing props, network errors

## Contributing

When adding new templates:

1. Follow the existing patterns and naming conventions
2. Include comprehensive TypeScript interfaces
3. Add proper accessibility features
4. Write thorough tests
5. Document the template in this README
6. Provide usage examples

## Common Patterns

All templates follow these patterns:

- Use theme context for styling
- Include proper TypeScript types
- Handle loading and error states
- Support accessibility features
- Include comprehensive tests
- Follow React Native best practices
- Use consistent naming conventions
- Implement proper keyboard handling

## File Structure

```
screen-templates/
├── README.md                   # This documentation
├── index.ts                    # Export all templates and examples
├── ListScreenTemplate.tsx      # Basic list template
├── FormScreenTemplate.tsx      # Basic form template  
├── DashboardScreenTemplate.tsx # Basic dashboard template
├── AuthScreenTemplate.tsx      # Basic auth template
└── examples/                   # Complex reference implementations
    ├── index.ts               # Export all examples
    ├── ProductListScreen/     # E-commerce product list
    ├── ProductDetailScreen/   # Product detail view
    ├── CartScreen/           # Shopping cart
    ├── SearchScreen/         # Advanced search
    └── CheckoutScreen/       # Multi-step checkout
```

These templates provide a solid foundation for common screen patterns while maintaining flexibility for customization. Use them as starting points and adapt them to your specific requirements. 