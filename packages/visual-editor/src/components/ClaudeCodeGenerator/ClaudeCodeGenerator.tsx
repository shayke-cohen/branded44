import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSession } from '../../contexts/SessionContext';

// Types
interface SingleScreenPromptParams {
  screenName: string;
  description: string;
  category: string;
  icon: string;
}

interface CompleteAppPromptParams {
  appDescription: string;
}

interface UpdateExistingPromptParams {
  updateDescription: string;
}

// Styled Components
const GeneratorContainer = styled.div`
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 13px;
  line-height: 1.4;
  max-height: calc(100vh - 280px); /* Account for header + footer space */
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
`;

const SectionDescription = styled.p`
  margin: 0 0 16px 0;
  color: #666;
  font-size: 12px;
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
`;

const ModeTab = styled.label<{ $active: boolean }>`
  flex: 1;
  padding: 10px 16px;
  background: ${props => props.$active ? '#007aff' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#333333'};
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease;
  border-right: 1px solid #e0e0e0;
  
  &:last-child {
    border-right: none;
  }

  &:hover {
    background: ${props => props.$active ? '#0051d0' : '#f5f5f5'};
  }

  input {
    display: none;
  }
`;

const CollapsibleSection = styled.div`
  margin-bottom: 16px;
`;

const CollapsibleHeader = styled.button`
  width: 100%;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 10px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  text-align: left;
  transition: background 0.2s ease;

  &:hover {
    background: #f0f0f0;
  }
`;

const CollapsibleContent = styled.div`
  border: 1px solid #e0e0e0;
  border-top: none;
  padding: 16px;
  border-radius: 0 0 4px 4px;
  background: #f9f9f9;
`;

const FormGroup = styled.div`
  margin-bottom: 12px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
`;

const RequiredMark = styled.span`
  color: #e74c3c;
`;

const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 8px 12px;
  border: ${props => props.$error ? '2px solid #e74c3c' : '1px solid #e0e0e0'};
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
  background: ${props => props.$error ? '#ffebee' : 'white'};

  &:focus {
    outline: none;
    border-color: #007aff;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
  }
`;

const TextArea = styled.textarea<{ $error?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  border: ${props => props.$error ? '2px solid #e74c3c' : '1px solid #e0e0e0'};
  border-radius: 4px;
  font-size: 12px;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  background: ${props => props.$error ? '#ffebee' : 'white'};

  &:focus {
    outline: none;
    border-color: #007aff;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'info' }>`
  padding: 10px 16px;
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'primary': return '#007aff';
      case 'info': return '#17a2b8';
      default: return '#e0e0e0';
    }
  }};
  background: ${props => {
    switch (props.$variant) {
      case 'primary': return '#007aff';
      case 'info': return '#17a2b8';
      default: return '#ffffff';
    }
  }};
  color: ${props => props.$variant === 'primary' || props.$variant === 'info' ? '#ffffff' : '#333333'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;

  &:hover:not(:disabled) {
    background: ${props => {
      switch (props.$variant) {
        case 'primary': return '#0051d0';
        case 'info': return '#138496';
        default: return '#f5f5f5';
      }
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusIndicator = styled.div<{ $status: 'available' | 'unavailable' | 'checking' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  background: ${props => {
    switch (props.$status) {
      case 'available': return '#d4edda';
      case 'unavailable': return '#f8d7da';
      case 'checking': default: return '#f0f0f0';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'available': return '#c3e6cb';
      case 'unavailable': return '#f5c6cb';
      case 'checking': default: return '#e0e0e0';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'available': return '#155724';
      case 'unavailable': return '#721c24';
      case 'checking': default: return '#666';
    }
  }};
`;

const ResultDisplay = styled.div<{ $success: boolean }>`
  margin-top: 12px;
  padding: 12px;
  background: ${props => props.$success ? '#d4edda' : '#f8d7da'};
  border: 1px solid ${props => props.$success ? '#c3e6cb' : '#f5c6cb'};
  border-radius: 4px;
  font-size: 12px;
  color: ${props => props.$success ? '#155724' : '#721c24'};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
  cursor: pointer;

  input[type="checkbox"] {
    margin: 0;
  }
`;

// Prompt generation functions
const SharedSections = {
  getArchitectureRequirements: () => `## Architecture Requirements:
- Create screen files in \`packages/mobile/src/screens/\`
- Each screen must self-register using \`registerScreen\`
- Update \`packages/mobile/src/config/importScreens.ts\` with new screen imports
- Use our theming system (\`useTheme\`)
- Follow React Native best practices`,

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

  getFinalStep: () => `## Final Step:
After creating all screens and their tests, run only the tests you created to ensure everything works correctly.`
};

function generateSingleScreenPrompt(params: SingleScreenPromptParams): string {
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

function generateCompleteAppPrompt(params: CompleteAppPromptParams): string {
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

Create a complete, functional app with 3-5 main screens AND comprehensive tests based on the description provided.

${SharedSections.getFinalStep()}`;
}

function generateUpdateExistingPrompt(params: UpdateExistingPromptParams): string {
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

Create focused, high-quality improvements that enhance the app while maintaining stability and consistency.

${SharedSections.getFinalStep()}`;
}

const ClaudeCodeGenerator: React.FC = () => {
  const { currentSession } = useSession();
  const [mode, setMode] = useState<'single' | 'complete' | 'update'>('single');
  const [screenName, setScreenName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [serverAvailable, setServerAvailable] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showQuickTest, setShowQuickTest] = useState(false);
  const [showSingleScreenDetails, setShowSingleScreenDetails] = useState(false);
  const [showCompleteAppDetails, setShowCompleteAppDetails] = useState(false);
  
  // Quick SDK Test
  const [testPrompt, setTestPrompt] = useState('List the files in the current working directory and tell me what kind of project this is');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestExecuting, setIsTestExecuting] = useState(false);

  // Claude Settings - all options from web package
  const [systemPrompt, setSystemPrompt] = useState('');
  const [appendSystemPrompt, setAppendSystemPrompt] = useState('');
  const [allowedTools, setAllowedTools] = useState('Read,Write,List');
  const [disallowedTools, setDisallowedTools] = useState('');
  const [mcpConfig, setMcpConfig] = useState('');
  const [permissionPromptTool, setPermissionPromptTool] = useState('');
  const [model, setModel] = useState('');
  const [permissionMode, setPermissionMode] = useState('default');
  const [verbose, setVerbose] = useState(true);
  const [maxTurns, setMaxTurns] = useState(100);
  const [workingDirectory, setWorkingDirectory] = useState(currentSession?.sessionPath || '/Users/shayco/branded44/packages/mobile');
  const [dangerouslySkipPermissions, setDangerouslySkipPermissions] = useState(true);
  const [anthropicBaseUrl, setAnthropicBaseUrl] = useState('http://localhost:3003/api/anthropic-proxy');
  const [anthropicAuthToken, setAnthropicAuthToken] = useState('fake-key-for-proxy');
  const [showClaudeSettings, setShowClaudeSettings] = useState(false);

  // Update working directory when session changes
  useEffect(() => {
    if (currentSession?.sessionPath) {
      setWorkingDirectory(currentSession.sessionPath);
    }
  }, [currentSession?.sessionPath]);

  useEffect(() => {
    // Check if Claude Code server is available
    fetch('http://localhost:3001/check-claude-code')
      .then(res => res.json())
      .then(data => setServerAvailable(data.installed ? 'available' : 'unavailable'))
      .catch(() => setServerAvailable('unavailable'));
  }, []);

  // Auto-populate description from screen name
  useEffect(() => {
    if (screenName && description === '') {
      setDescription(screenName);
    }
  }, [screenName, description]);

  const generatePrompt = () => {
    if (mode === 'single') {
      return generateSingleScreenPrompt({
        screenName,
        description,
        category,
        icon
      });
    } else if (mode === 'complete') {
      return generateCompleteAppPrompt({
        appDescription
      });
    } else {
      return generateUpdateExistingPrompt({
        updateDescription
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Prompt copied to clipboard!');
  };

  const executeTestPrompt = async () => {
    setIsTestExecuting(true);
    setTestResult(null);
    
    try {
      const startTime = Date.now();
      const requestBody: any = {
        prompt: testPrompt,
        maxTurns: maxTurns,
        workingDirectory: workingDirectory,
        anthropicBaseUrl: anthropicBaseUrl,
        anthropicAuthToken: anthropicAuthToken
      };

      // Add all Claude settings - always include defaults
      if (systemPrompt) requestBody.systemPrompt = systemPrompt;
      if (appendSystemPrompt) requestBody.appendSystemPrompt = appendSystemPrompt;
      if (allowedTools) requestBody.allowedTools = allowedTools.split(',').map(t => t.trim());
      if (disallowedTools) requestBody.disallowedTools = disallowedTools.split(',').map(t => t.trim());
      if (mcpConfig) requestBody.mcpConfig = mcpConfig;
      if (permissionPromptTool) requestBody.permissionPromptTool = permissionPromptTool;
      if (model) requestBody.model = model;
      if (permissionMode !== 'default') requestBody.permissionMode = permissionMode;
      requestBody.verbose = verbose; // Always include verbose setting
      requestBody.dangerouslySkipPermissions = dangerouslySkipPermissions; // Always include this setting

      const response = await fetch('http://localhost:3001/execute-claude-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      const duration = Date.now() - startTime;

      setTestResult({
        success: true,
        duration: duration,
        result: result
      });

    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsTestExecuting(false);
    }
  };

  const executeClaudeCode = async () => {
    // Validate required fields
    if (mode === 'single') {
      if (!screenName.trim()) {
        alert('Please enter a screen name before executing.');
        return;
      }
      if (!description.trim()) {
        alert('Please enter a screen description before executing.');
        return;
      }
    } else if (mode === 'complete') {
      if (!appDescription.trim()) {
        alert('Please enter an app description before executing.');
        return;
      }
    } else if (mode === 'update') {
      if (!updateDescription.trim()) {
        alert('Please enter an update description before executing.');
        return;
      }
    }

    setIsExecuting(true);
    try {
      const prompt = generatePrompt();
      
      const requestBody: any = {
        prompt: prompt,
        maxTurns: maxTurns,
        workingDirectory: workingDirectory,
        anthropicBaseUrl: anthropicBaseUrl,
        anthropicAuthToken: anthropicAuthToken
      };

      // Add all Claude settings - always include defaults
      if (systemPrompt) requestBody.systemPrompt = systemPrompt;
      if (appendSystemPrompt) requestBody.appendSystemPrompt = appendSystemPrompt;
      if (allowedTools) requestBody.allowedTools = allowedTools.split(',').map(t => t.trim());
      if (disallowedTools) requestBody.disallowedTools = disallowedTools.split(',').map(t => t.trim());
      if (mcpConfig) requestBody.mcpConfig = mcpConfig;
      if (permissionPromptTool) requestBody.permissionPromptTool = permissionPromptTool;
      if (model) requestBody.model = model;
      if (permissionMode !== 'default') requestBody.permissionMode = permissionMode;
      requestBody.verbose = verbose; // Always include verbose setting
      requestBody.dangerouslySkipPermissions = dangerouslySkipPermissions; // Always include this setting

      console.log('Executing Claude Code with options:', requestBody);

      const response = await fetch('http://localhost:3001/execute-claude-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Claude Code execution result:', result);

      alert('🚀 Code generation completed! Check the mobile package for new screens.');
      
      // Clear form
      if (mode === 'single') {
        setScreenName('');
        setDescription('');
        setCategory('');
        setIcon('');
      } else if (mode === 'complete') {
        setAppDescription('');
      } else {
        setUpdateDescription('');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Claude Code execution error:', errorMessage);
      alert(`❌ Code generation failed: ${errorMessage}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusText = () => {
    switch (serverAvailable) {
      case 'available': return '✅ Claude Code CLI is installed and ready';
      case 'unavailable': return '❌ Claude Code CLI is not installed. Install it with: npm install -g @anthropic-ai/claude-code';
      case 'checking': default: return '⏳ Checking Claude Code CLI availability...';
    }
  };

  return (
    <GeneratorContainer>
      <SectionHeader>
        <SectionTitle>🤖 Claude Code Generator</SectionTitle>
        <SectionDescription>
          Generate prompts for Claude Code to create React Native screens or complete apps
        </SectionDescription>
      </SectionHeader>

      <StatusIndicator $status={serverAvailable}>
        {getStatusText()}
      </StatusIndicator>

      {serverAvailable === 'unavailable' && (
        <CollapsibleContent style={{ marginBottom: '16px', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
          <SectionTitle style={{ fontSize: '14px', margin: '0 0 8px 0', color: '#721c24' }}>
            📦 Installation Required
          </SectionTitle>
          <div style={{ fontSize: '12px', color: '#721c24', lineHeight: '1.4' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              To use Claude Code Generator, install the Claude Code CLI:
            </p>
            <div style={{ 
              background: '#2d3748', 
              color: '#e2e8f0', 
              padding: '8px 12px', 
              borderRadius: '4px', 
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '11px',
              marginBottom: '8px'
            }}>
              npm install -g @anthropic-ai/claude-code
            </div>
            <p style={{ margin: '0', fontSize: '11px', opacity: 0.8 }}>
              After installation, refresh the page to start generating code.
            </p>
          </div>
        </CollapsibleContent>
      )}

      {/* Quick SDK Test Section */}
      <CollapsibleSection>
        <CollapsibleHeader onClick={() => setShowQuickTest(!showQuickTest)}>
          {showQuickTest ? '🔽' : '🔼'} 🧪 Quick SDK Test
        </CollapsibleHeader>
        
        {showQuickTest && (
          <CollapsibleContent>
            <FormGroup>
              <Input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter a test prompt (e.g., 'List files in current directory')"
              />
            </FormGroup>
            
            <Button
              $variant="info"
              onClick={executeTestPrompt}
              disabled={isTestExecuting || !testPrompt.trim()}
            >
              {isTestExecuting ? '⏳ Testing...' : '🧪 Test SDK'}
            </Button>
            
            {testResult && (
              <div>
                <ResultDisplay $success={testResult.success}>
                  <strong>{testResult.success ? '✅ Test Passed' : '❌ Test Failed'}:</strong> 
                  {testResult.success ? ` Completed in ${testResult.duration}ms` : ` ${testResult.error}`}
                </ResultDisplay>
                
                {testResult.success && testResult.result?.output && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    border: '1px solid #e9ecef', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    <strong>Claude Response:</strong><br/>
                    {testResult.result.output}
                  </div>
                )}
              </div>
            )}
          </CollapsibleContent>
        )}
      </CollapsibleSection>

      {/* Claude Settings Section */}
      <CollapsibleSection>
        <CollapsibleHeader onClick={() => setShowClaudeSettings(!showClaudeSettings)}>
          {showClaudeSettings ? '🔽' : '🔼'} ⚙️ Claude Settings
        </CollapsibleHeader>
        
        {showClaudeSettings && (
          <CollapsibleContent>
            <FormGrid>
              <FormGroup>
                <Label>Model:</Label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">Default</option>
                  <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                  <option value="claude-opus-4-20250514">Claude Opus 4</option>
                  <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</option>
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                </select>
              </FormGroup>
              
              <FormGroup>
                <Label>Max Turns:</Label>
                <Input
                  type="number"
                  value={maxTurns}
                  onChange={(e) => setMaxTurns(parseInt(e.target.value) || 100)}
                  min="1"
                  max="100"
                />
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <Label>Working Directory:</Label>
              <Input
                type="text"
                value={workingDirectory}
                onChange={(e) => setWorkingDirectory(e.target.value)}
                placeholder="/path/to/your/project"
              />
            </FormGroup>

            <FormGrid>
              <FormGroup>
                <Label>Anthropic Base URL:</Label>
                <Input
                  type="text"
                  value={anthropicBaseUrl}
                  onChange={(e) => setAnthropicBaseUrl(e.target.value)}
                  placeholder="http://localhost:3003/api/anthropic-proxy"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Anthropic Auth Token:</Label>
                <Input
                  type="password"
                  value={anthropicAuthToken}
                  onChange={(e) => setAnthropicAuthToken(e.target.value)}
                  placeholder="fake-key-for-proxy"
                />
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <Label>System Prompt:</Label>
              <TextArea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Custom system instructions for Claude"
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <Label>Append System Prompt:</Label>
              <TextArea
                value={appendSystemPrompt}
                onChange={(e) => setAppendSystemPrompt(e.target.value)}
                placeholder="Additional instructions to append"
                rows={2}
              />
            </FormGroup>

            <FormGrid>
              <FormGroup>
                <Label>Allowed Tools:</Label>
                <Input
                  type="text"
                  value={allowedTools}
                  onChange={(e) => setAllowedTools(e.target.value)}
                  placeholder="Read,Write,Bash (comma-separated)"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Disallowed Tools:</Label>
                <Input
                  type="text"
                  value={disallowedTools}
                  onChange={(e) => setDisallowedTools(e.target.value)}
                  placeholder="WebFetch,WebSearch (comma-separated)"
                />
              </FormGroup>
            </FormGrid>

            <FormGrid>
              <FormGroup>
                <Label>MCP Config:</Label>
                <Input
                  type="text"
                  value={mcpConfig}
                  onChange={(e) => setMcpConfig(e.target.value)}
                  placeholder="MCP configuration file path"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Permission Prompt Tool:</Label>
                <Input
                  type="text"
                  value={permissionPromptTool}
                  onChange={(e) => setPermissionPromptTool(e.target.value)}
                  placeholder="Permission prompt tool"
                />
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <Label>Permission Mode:</Label>
              <select
                value={permissionMode}
                onChange={(e) => setPermissionMode(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="default">Default</option>
                <option value="strict">Strict</option>
                <option value="permissive">Permissive</option>
              </select>
            </FormGroup>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={verbose}
                  onChange={(e) => setVerbose(e.target.checked)}
                />
                Verbose output
              </CheckboxLabel>
              
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={dangerouslySkipPermissions}
                  onChange={(e) => setDangerouslySkipPermissions(e.target.checked)}
                />
                Skip permissions (dangerous)
              </CheckboxLabel>
            </div>
          </CollapsibleContent>
        )}
      </CollapsibleSection>

      {/* Mode Selection */}
      <ModeSelector>
        <ModeTab $active={mode === 'single'}>
          <input
            type="radio"
            value="single"
            checked={mode === 'single'}
            onChange={(e) => setMode(e.target.value as any)}
          />
          📱 Create Screen
        </ModeTab>
        <ModeTab $active={mode === 'update'}>
          <input
            type="radio"
            value="update"
            checked={mode === 'update'}
            onChange={(e) => setMode(e.target.value as any)}
          />
          🔄 Update Existing
        </ModeTab>
        <ModeTab $active={mode === 'complete'}>
          <input
            type="radio"
            value="complete"
            checked={mode === 'complete'}
            onChange={(e) => setMode(e.target.value as any)}
          />
          🚀 Generate App
        </ModeTab>
      </ModeSelector>

      {/* Single Screen Mode */}
      {mode === 'single' && (
        <>
          <FormGroup>
            <Label>Screen Name <RequiredMark>*</RequiredMark></Label>
            <Input
              type="text"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              placeholder="e.g., ProfileScreen"
              $error={!screenName.trim()}
            />
          </FormGroup>

          <CollapsibleSection>
            <CollapsibleHeader onClick={() => setShowSingleScreenDetails(!showSingleScreenDetails)}>
              {showSingleScreenDetails ? '🔽' : '🔼'} Screen Details
            </CollapsibleHeader>
            
            {showSingleScreenDetails && (
              <CollapsibleContent>
                <FormGroup>
                  <Label>Description:</Label>
                  <TextArea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this screen does (auto-filled from screen name)"
                  />
                </FormGroup>
                
                <FormGrid>
                  <FormGroup>
                    <Label>Category:</Label>
                    <Input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Main, Settings, Social"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Icon:</Label>
                    <Input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      placeholder="e.g., 👤, ⚙️, 💬"
                    />
                  </FormGroup>
                </FormGrid>
              </CollapsibleContent>
            )}
          </CollapsibleSection>
        </>
      )}

      {/* Complete App Mode */}
      {mode === 'complete' && (
        <FormGroup>
          <Label>App Description <RequiredMark>*</RequiredMark></Label>
          <TextArea
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            placeholder="Describe your app idea. For example: 'A fitness tracking app where users can log workouts, track progress, and share achievements with friends.'"
            style={{ minHeight: '120px' }}
            $error={!appDescription.trim()}
          />
        </FormGroup>
      )}

      {/* Update Existing Mode */}
      {mode === 'update' && (
        <FormGroup>
          <Label>Update Description <RequiredMark>*</RequiredMark></Label>
          <TextArea
            value={updateDescription}
            onChange={(e) => setUpdateDescription(e.target.value)}
            placeholder="Describe what you want to update or improve in the existing app..."
            style={{ minHeight: '120px' }}
            $error={!updateDescription.trim()}
          />
        </FormGroup>
      )}

      {/* Action Buttons */}
      <ButtonGroup>
        <Button onClick={() => copyToClipboard(generatePrompt())}>
          📋 Copy Prompt
        </Button>
        <Button 
          $variant="primary" 
          onClick={executeClaudeCode}
          disabled={serverAvailable !== 'available' || isExecuting}
        >
          {isExecuting ? '⏳ Generating...' : '🚀 Generate Code'}
        </Button>
      </ButtonGroup>
    </GeneratorContainer>
  );
};

export default ClaudeCodeGenerator;
