// Claude Code prompt templates for generating React Native screens and apps

export interface SingleScreenPromptParams {
  screenName: string;
  description: string;
  category: string;
  icon: string;
}

export interface CompleteAppPromptParams {
  appDescription: string;
}

export interface UpdateExistingPromptParams {
  updateDescription: string;
}

/**
 * Shared template sections used across different prompt types
 */
const SharedSections = {
  /**
   * Common architecture requirements for React Native development
   */
  getArchitectureRequirements: () => `## Architecture Requirements:
- Create screen files in \`packages/mobile/src/screens/\`
- Each screen must self-register using \`registerScreen\`
- Update \`packages/mobile/src/config/importScreens.ts\` with new screen imports
- Use our theming system (\`useTheme\`)
- Follow React Native best practices`,

  /**
   * Example screen structure template
   */
  getExampleScreenStructure: (screenName?: string) => {
    const exampleName = screenName || 'ScreenName';
    return `## Example Screen Structure:
\`\`\`typescript
import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '@/context';
import { registerScreen } from '@/config/registry';

export default function ${exampleName}() {
  const { theme } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>${exampleName}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Screen description here
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center' }
});

// Self-register the screen
registerScreen({
  name: '${exampleName}',
  component: ${exampleName},
  icon: '📱',
  category: 'Main',
  tab: 1,
  description: 'Description of what this screen does',
  tags: ['tag1', 'tag2']
});
\`\`\``;
  },

  /**
   * Comprehensive testing requirements and examples
   */
  getTestingRequirements: (screenName?: string) => {
    const exampleName = screenName || 'ScreenName';
    return `## Testing Requirements:
**Create comprehensive tests** in \`packages/mobile/src/screens/__tests__/\` that validate:
- Screen renders without crashing
- Key UI elements and text content are displayed
- User interactions work correctly
- Theme integration is working
- Accessibility features are working

### Test Structure Example:
\`\`\`typescript
// ${exampleName}.test.tsx
import React from 'react';
import {render, fireEvent, waitFor} from '../../../test/test-utils';
import ${exampleName} from '../${exampleName}';

describe('${exampleName}', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<${exampleName} />);
      expect(getByText('${exampleName}')).toBeTruthy();
    });

    it('displays key UI elements', () => {
      const {getByText, getByTestId} = render(<${exampleName} />);
      expect(getByText('Important Button')).toBeTruthy();
      expect(getByTestId('main-content')).toBeTruthy();
    });

    it('applies theme correctly', () => {
      const {getByText} = render(<${exampleName} />);
      const titleElement = getByText('${exampleName}');
      expect(titleElement).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('handles user interactions', () => {
      const {getByText} = render(<${exampleName} />);
      const button = getByText('Important Button');
      fireEvent.press(button);
      // Add specific assertions based on expected behavior
    });
  });

  describe('Accessibility', () => {
    it('provides accessible labels', () => {
      const {getByText} = render(<${exampleName} />);
      expect(getByText('${exampleName}')).toBeTruthy();
    });
  });
});
\`\`\``;
  },

  /**
   * Final step instructions
   */
  getFinalStep: () => `## Final Step:
After creating all screens and their tests, run only the tests you created to ensure everything works correctly.`
};

/**
 * Generates a Claude Code prompt for creating a single React Native screen
 */
export function generateSingleScreenPrompt(params: SingleScreenPromptParams): string {
  const { screenName, description, category, icon } = params;
  
  return `You are tasked with creating a new React Native screen following our project's architecture patterns.

## Screen Details:
- **Name**: ${screenName}
- **Description**: ${description}
- **Category**: ${category}
- **Icon**: ${icon}

## Requirements:
1. Create a new screen file in \`packages/mobile/src/screens/\`
2. The screen should use our existing patterns:
   - Import \`useTheme\` from \`@/context\`
   - Use \`SafeAreaView\` for proper spacing
   - Call \`registerScreen\` to self-register
3. Add the screen import to \`packages/mobile/src/config/importScreens.ts\`
4. Use React Native components and styling

${SharedSections.getTestingRequirements(screenName)}

${SharedSections.getExampleScreenStructure(screenName).replace(
  'Screen description here', 
  description
).replace(
  /icon: '📱'/g, 
  `icon: '${icon}'`
).replace(
  /category: 'Main'/g,
  `category: '${category}'`
).replace(
  'Description of what this screen does',
  description
).replace(
  "tags: ['tag1', 'tag2']",
  `tags: ['${category.toLowerCase()}', 'screen']`
)}

Create the complete implementation following these patterns, including both the screen component and comprehensive tests.

${SharedSections.getFinalStep()}`;
}

/**
 * Generates a Claude Code prompt for creating a complete React Native app
 */
export function generateCompleteAppPrompt(params: CompleteAppPromptParams): string {
  const { appDescription } = params;
  
  return `You are tasked with creating a complete React Native app based on a user description.

## App Description:
${appDescription}

## Your Task:
Based on the description above, you need to deduce and create:
1. **App name and purpose**
2. **Core features and functionality** 
3. **User flow and navigation**
4. **Specific screens needed**
5. **Screen content and functionality**

${SharedSections.getArchitectureRequirements()}
- Remove existing screen imports that aren't needed

## Important Notes:
- **REPLACE ALL EXISTING SCREENS**: Remove all current imports in \`importScreens.ts\` and replace with your new app screens
- **Tab Positions**: Assign tab positions 1, 2, 3, 4, etc. for main navigation

${SharedSections.getExampleScreenStructure()}

${SharedSections.getTestingRequirements().replace(
  'Screen renders without crashing',
  'Screen renders without crashing\n- Navigation between screens functions properly\n- App-wide integration tests (navigation flow, state management)'
)}

## App Integration Tests:
Also create or update \`packages/mobile/__tests__/App.test.tsx\` to test:
- Initial app state and default screen
- Navigation between all your new screens
- Theme consistency across screens
- Overall app functionality and user flows

Create a complete, functional app with 3-5 main screens AND comprehensive tests based on the description provided.

${SharedSections.getFinalStep()}`;
}

/**
 * Generates a Claude Code prompt for updating existing React Native app and screens
 */
export function generateUpdateExistingPrompt(params: UpdateExistingPromptParams): string {
  const { updateDescription } = params;
  
  return `You are tasked with updating and improving the existing React Native app based on the following requirements.

## Update Requirements:
${updateDescription}

## Your Task:
Analyze the current app structure and make the requested improvements. You should:

1. **Examine existing screens** in \`packages/mobile/src/screens/\`
2. **Review current imports** in \`packages/mobile/src/config/importScreens.ts\`
3. **Understand the app architecture** and existing patterns
4. **Make targeted improvements** without breaking existing functionality

## Guidelines:
- **Preserve existing functionality** unless explicitly asked to change it
- **Follow established patterns** already used in the codebase
- **Maintain consistency** with existing theming and styling
- **Update tests** for any modified components
- **Add new tests** for any new functionality

${SharedSections.getArchitectureRequirements()}

## Key Considerations:
- **Backward Compatibility**: Ensure existing screens continue to work
- **Incremental Changes**: Make focused improvements rather than wholesale changes
- **Code Quality**: Improve code structure and performance where possible
- **User Experience**: Enhance usability and navigation flow
- **Testing**: Update and add tests to cover new and modified functionality

## Testing Strategy:
- **Run existing tests** to ensure no regressions
- **Update tests** for modified components
- **Add new tests** for new functionality
- **Test integration** between new and existing features

${SharedSections.getExampleScreenStructure()}

## Implementation Approach:
1. **Analyze Current State**: Review existing screens and their functionality
2. **Plan Changes**: Identify what needs to be modified, added, or improved
3. **Implement Updates**: Make changes following existing patterns
4. **Update Tests**: Ensure test coverage for all changes
5. **Verify Integration**: Test that new changes work with existing features

Create focused, high-quality improvements that enhance the app while maintaining stability and consistency.

${SharedSections.getFinalStep()}`;
} 