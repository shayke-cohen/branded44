# Screen Template Guidelines

## Overview
This directory contains reusable React Native screen templates designed to accelerate app development. Templates are organized into two categories:

- **Basic Templates**: Simple, customizable starting points for common screen patterns
- **Complex Examples**: Full-featured reference implementations with comprehensive functionality

## Using Templates

### 1. Basic Templates (Root Directory)
Located in `/src/screen-templates/[TemplateName].tsx`

**Purpose**: Quick starting points for new screens
**Usage**: Copy, rename, and customize for your specific needs

```typescript
// Example: Using AuthScreenTemplate
import { AuthScreenTemplate } from '../screen-templates/AuthScreenTemplate';

// Copy the template, rename to your screen, and customize
export const LoginScreen = () => {
  // Customize authentication logic
  return <AuthScreenTemplate /* your props */ />;
};
```

### 2. Complex Examples (Examples Directory)
Located in `/src/screen-templates/examples/[ScreenName]/`

**Purpose**: Reference implementations showing best practices
**Usage**: Study patterns, copy components, or use as architectural guides

```typescript
// Example: Learning from ProductListScreen
import { ProductListScreen } from '../screen-templates/examples/ProductListScreen';

// Study the implementation and adapt patterns to your needs
```

## Template Selection Guide

### Choose Basic Templates When:
- Starting a new screen from scratch
- Need a simple, clean implementation
- Want to customize extensively
- Building MVP or prototype features
- Learning React Native patterns

### Choose Complex Examples When:
- Need comprehensive functionality
- Want to see advanced patterns
- Building production-ready features
- Need inspiration for edge cases
- Studying testing strategies

## Customization Guidelines

### Step 1: Copy Template
```bash
# For basic templates
cp src/screen-templates/AuthScreenTemplate.tsx src/screens/LoginScreen.tsx

# For complex examples
cp -r src/screen-templates/examples/ProductListScreen src/screens/ProductCatalogScreen
```

### Step 2: Rename Components
```typescript
// Change component name
export const LoginScreen = () => {
  // Implementation
};

// Update interface names
interface LoginScreenProps {
  // Props
}
```

### Step 3: Customize Functionality
```typescript
// Modify state management
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

// Add your business logic
const handleLogin = async () => {
  // Your authentication logic
};

// Update UI elements
return (
  <View style={styles.container}>
    {/* Your custom UI */}
  </View>
);
```

### Step 4: Update Styling
```typescript
const styles = StyleSheet.create({
  container: {
    // Your custom styles
    backgroundColor: theme.colors.background,
    padding: theme.spacing.large,
  },
  // Add your style definitions
});
```

## Creating New Templates

### Template Requirements
1. **TypeScript**: Use proper typing for all props and state
2. **Theme Integration**: Use ThemeContext for consistent styling
3. **Accessibility**: Include proper accessibility labels and hints
4. **Error Handling**: Implement loading states and error boundaries
5. **Testing**: Include comprehensive test suite (for complex templates)
6. **Documentation**: Add JSDoc comments for complex logic

### Basic Template Structure
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface YourTemplateProps {
  // Define your props with proper types
  title?: string;
  onAction?: () => void;
}

/**
 * Brief description of template purpose
 * @param props - Template props
 */
export const YourTemplate: React.FC<YourTemplateProps> = ({
  title = 'Default Title',
  onAction,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleAction = () => {
    // Your logic here
    onAction?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      {/* Your template content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
```

### Complex Template Structure
```
src/screen-templates/examples/YourScreen/
├── index.ts                 # Export file
├── YourScreen.tsx          # Main implementation
├── YourScreen.types.ts     # Type definitions
├── components/             # Screen-specific components
│   ├── YourComponent.tsx
│   └── index.ts
└── __tests__/             # Test suite
    └── YourScreen.test.tsx
```

## Best Practices

### Code Organization
- Keep templates focused on single responsibilities
- Extract reusable components to `/src/components/`
- Use proper TypeScript interfaces
- Follow consistent naming conventions

### State Management
- Use local state for simple template data
- Integrate with context for shared application state
- Consider Redux/Zustand for complex state requirements
- Implement proper error boundaries

### Styling Guidelines
- Always use theme context for colors and spacing
- Create responsive designs using Dimensions API
- Follow platform-specific design guidelines
- Test on multiple screen sizes

### Performance Considerations
- Implement lazy loading for large lists
- Use React.memo for expensive components
- Optimize images and assets
- Consider virtualization for long lists

### Testing Strategy
- Unit tests for component logic
- Integration tests for user interactions
- Accessibility testing
- Visual regression testing (where applicable)

## Template Contribution

### Adding New Templates
1. Follow the template structure guidelines above
2. Include comprehensive documentation
3. Add to the INDEX.md file
4. Update exports in index.ts files
5. Consider both basic and complex versions

### Template Naming Conventions
- **Basic Templates**: `[Purpose]Template.tsx` (e.g., `AuthTemplate.tsx`)
- **Complex Examples**: `[Feature]Screen/` (e.g., `ProductListScreen/`)
- **Components**: PascalCase with descriptive names
- **Files**: Match component names exactly

## Troubleshooting

### Common Issues
1. **Theme Not Applied**: Ensure ThemeProvider wraps your app
2. **Navigation Errors**: Check route configuration in navigation files
3. **Type Errors**: Verify all interfaces are properly imported
4. **Test Failures**: Ensure proper mocking of context providers

### Getting Help
1. Check existing templates for similar patterns
2. Review the main README.md for project setup
3. Consult LLM guidelines for development practices
4. Study test files for proper testing patterns

## Template Maintenance

### Regular Updates
- Keep templates aligned with latest React Native versions
- Update dependencies and patterns as needed
- Ensure accessibility compliance
- Maintain test coverage above 80%

### Version Compatibility
- Test templates with current React Native version
- Document any version-specific requirements
- Update TypeScript types as needed
- Maintain backward compatibility where possible 