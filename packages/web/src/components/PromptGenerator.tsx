import React, { useState, useEffect } from 'react';

const PromptGenerator: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'complete'>('single');
  const [screenName, setScreenName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [serverAvailable, setServerAvailable] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [appendSystemPrompt, setAppendSystemPrompt] = useState('');
  const [allowedTools, setAllowedTools] = useState('');
  const [disallowedTools, setDisallowedTools] = useState('');
  const [mcpConfig, setMcpConfig] = useState('');
  const [permissionPromptTool, setPermissionPromptTool] = useState('');
  const [model, setModel] = useState('');
  const [permissionMode, setPermissionMode] = useState('bypass-permissions');
  const [verbose, setVerbose] = useState(false);
  const [maxTurns, setMaxTurns] = useState(3);
  const [workingDirectory, setWorkingDirectory] = useState('');

  // Additional security/proxy options (removed duplicate dangerouslySkipPermissions)
  const [anthropicBaseUrl, setAnthropicBaseUrl] = useState('http://localhost:3002/api/anthropic-proxy');
  const [anthropicAuthToken, setAnthropicAuthToken] = useState('fake-key-for-proxy');

  // Claude Code conversation display
  const [claudeMessages, setClaudeMessages] = useState<any[]>([]);
  const [showConversation, setShowConversation] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // Quick SDK Test
  const [testPrompt, setTestPrompt] = useState('List files in current directory');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestExecuting, setIsTestExecuting] = useState(false);
  const [useProxyForTest, setUseProxyForTest] = useState(false);
  const [showTestConversation, setShowTestConversation] = useState(false);

  useEffect(() => {
    // Check if Claude Code server is available
    fetch('http://localhost:3001/check-claude-code')
      .then(res => res.json())
      .then(data => setServerAvailable(data.installed))
      .catch(() => setServerAvailable(false));
  }, []);

  const generatePrompt = () => {
    if (mode === 'single') {
      const singleScreenPrompt = `You are tasked with creating a new React Native screen following our project's architecture patterns.

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

## Example Structure:
\`\`\`typescript
import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '@/context';
import { registerScreen } from '@/config/registry';

export default function ${screenName}() {
  const { theme } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>${screenName}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          ${description}
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
  name: '${screenName}',
  component: ${screenName},
  icon: '${icon}',
  category: '${category}',
  tab: 1, // Adjust tab position as needed
  description: '${description}',
  tags: ['${category.toLowerCase()}', 'screen']
});
\`\`\`

Create the complete implementation following these patterns.`;

      return singleScreenPrompt;
    } else {
      const completeAppPrompt = `You are tasked with creating a complete React Native app based on a user description.

## App Description:
${appDescription}

## Your Task:
Based on the description above, you need to deduce and create:
1. **App name and purpose**
2. **Core features and functionality** 
3. **User flow and navigation**
4. **Specific screens needed**
5. **Screen content and functionality**

## Architecture Requirements:
- Create screen files in \`packages/mobile/src/screens/\`
- Each screen must self-register using \`registerScreen\`
- Update \`packages/mobile/src/config/importScreens.ts\` with new screen imports
- Remove existing screen imports that aren't needed
- Use our theming system (\`useTheme\`)
- Follow React Native best practices

## Important Notes:
- **REPLACE ALL EXISTING SCREENS**: Remove all current imports in \`importScreens.ts\` and replace with your new app screens
- **Tab Positions**: Assign tab positions 1, 2, 3, 4, etc. for main navigation
- **Remove Template Screen**: Also remove the TemplateIndexScreen import from \`App.tsx\`:
  \`\`\`typescript
  // Remove or comment out this line in App.tsx:
  // import './config/registerTemplateScreen';
  \`\`\`

## Example Screen Structure:
\`\`\`typescript
import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '@/context';
import { registerScreen } from '@/config/registry';

export default function ScreenName() {
  const { theme } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Screen content */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Styles
});

registerScreen({
  name: 'Screen Name',
  component: ScreenName,
  icon: '📱',
  category: 'Main',
  tab: 1,
  description: 'Description of what this screen does',
  tags: ['tag1', 'tag2']
});
\`\`\`

Create a complete, functional app with 3-5 main screens based on the description provided.`;

      return completeAppPrompt;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Prompt copied to clipboard!');
  };

  const generateCliCommand = () => {
    const prompt = generatePrompt();
    const escapedPrompt = prompt.replace(/"/g, '\\"');
    
    let command = `claude-code "${escapedPrompt}"`;
    
    // Add advanced options if specified
    if (systemPrompt) command += ` --system-prompt "${systemPrompt}"`;
    if (appendSystemPrompt) command += ` --append-system-prompt "${appendSystemPrompt}"`;
    if (allowedTools) command += ` --allowed-tools "${allowedTools}"`;
    if (disallowedTools) command += ` --disallowed-tools "${disallowedTools}"`;
    if (mcpConfig) command += ` --mcp-config "${mcpConfig}"`;
    if (permissionPromptTool) command += ` --permission-prompt-tool "${permissionPromptTool}"`;
    if (model) command += ` --model "${model}"`;
    if (permissionMode !== 'default') command += ` --permission-mode "${permissionMode}"`;
    if (verbose) command += ` --verbose`;
    if (maxTurns !== 3) command += ` --max-turns ${maxTurns}`;
    if (workingDirectory) command += ` --add-dir "${workingDirectory}"`;
    if (permissionMode === 'bypass-permissions') command += ` --dangerously-skip-permissions`;
    
    // Add environment variables if specified
    let envVars = '';
    if (anthropicBaseUrl) envVars += `ANTHROPIC_BASE_URL="${anthropicBaseUrl}" `;
    if (anthropicAuthToken) envVars += `ANTHROPIC_AUTH_TOKEN="${anthropicAuthToken}" `;
    
    return envVars + command;
  };

  const executeClaudeCode = async () => {
    setIsExecuting(true);
    try {
      const prompt = generatePrompt();
      
      const requestBody: any = {
        prompt: prompt,
        maxTurns: maxTurns
      };

      // Add advanced options if specified
      if (systemPrompt) requestBody.systemPrompt = systemPrompt;
      if (appendSystemPrompt) requestBody.appendSystemPrompt = appendSystemPrompt;
      if (allowedTools) requestBody.allowedTools = allowedTools.split(',').map(t => t.trim());
      if (disallowedTools) requestBody.disallowedTools = disallowedTools.split(',').map(t => t.trim());
      if (mcpConfig) requestBody.mcpConfig = mcpConfig;
      if (permissionPromptTool) requestBody.permissionPromptTool = permissionPromptTool;
      if (model) requestBody.model = model;
      if (permissionMode !== 'default') requestBody.permissionMode = permissionMode;
      if (verbose) requestBody.verbose = verbose;
      if (workingDirectory) requestBody.workingDirectory = workingDirectory;
      if (permissionMode === 'bypass-permissions') requestBody.dangerouslySkipPermissions = true;
      if (anthropicBaseUrl) requestBody.anthropicBaseUrl = anthropicBaseUrl;
      if (anthropicAuthToken) requestBody.anthropicAuthToken = anthropicAuthToken;

      console.log('Executing Claude Code with options:', requestBody);

      const response = await fetch('http://localhost:3001/execute-claude-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      
      if (result.success) {
        setClaudeMessages(result.messages || []);
        setExecutionResult(result);
        setShowConversation(true);
      } else {
        alert(`❌ Claude Code failed: ${result.error}\n\nDetails: ${result.details || 'No details available'}`);
      }
    } catch (error) {
      alert(`❌ Server error: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const executeTestPrompt = async () => {
    setIsTestExecuting(true);
    setTestResult(null);
    try {
      const requestBody: any = {
        prompt: testPrompt,
        maxTurns: 1,
        verbose: true
      };

      // Add proxy settings only if user wants to test with proxy
      if (useProxyForTest) {
        if (anthropicBaseUrl) {
          requestBody.anthropicBaseUrl = anthropicBaseUrl;
        }
        if (anthropicAuthToken) {
          requestBody.anthropicAuthToken = anthropicAuthToken;
        }
      }

      console.log('Testing SDK with:', requestBody);

      const response = await fetch('http://localhost:3001/execute-claude-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      setTestResult(result);
      
      if (result.success) {
        console.log('SDK Test successful:', result);
      } else {
        console.error('SDK Test failed:', result);
      }
    } catch (error) {
      console.error('Error testing SDK:', error);
      setTestResult({ success: false, error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsTestExecuting(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      width: '100%', 
      maxHeight: 'calc(100vh - 200px)', 
      overflow: 'auto',
      position: 'relative'
    }}>
      <style>
        {`
          .sticky-header {
            position: sticky;
            top: 0;
            background: white;
            z-index: 100;
            padding-bottom: 10px;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 20px;
          }
        `}
      </style>
      
      <div className="sticky-header">
        <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>🤖 Claude Code Prompt Generator</h1>
        <p style={{ margin: '0 0 20px 0', color: '#666' }}>
          Generate prompts for Claude Code to create React Native screens or complete apps
        </p>

        {/* Quick SDK Test Section */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>🧪 Quick SDK Test</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter test prompt..."
              style={{ 
                flex: 1, 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={executeTestPrompt}
              disabled={isTestExecuting || !testPrompt.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: isTestExecuting ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTestExecuting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              {isTestExecuting ? '⏳ Testing...' : '🧪 Test SDK'}
            </button>
          </div>
          
          <div style={{ fontSize: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
              <input
                type="checkbox"
                checked={useProxyForTest}
                onChange={(e) => setUseProxyForTest(e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              Use proxy settings ({anthropicBaseUrl || 'default'})
            </label>
          </div>
          
          {testResult && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span><strong>Result:</strong> {testResult.success ? '✅ Success' : '❌ Failed'}</span>
                {testResult.success && testResult.messages && (
                  <button
                    onClick={() => setShowTestConversation(true)}
                    style={{
                      padding: '2px 8px',
                      fontSize: '11px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    View Response
                  </button>
                )}
              </div>
              {testResult.error && <div><strong>Error:</strong> {testResult.error}</div>}
              {testResult.messageCount && <div><strong>Messages:</strong> {testResult.messageCount}</div>}
              {testResult.duration && <div><strong>Duration:</strong> {testResult.duration}ms</div>}
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '20px' }}>
            <input
              type="radio"
              value="single"
              checked={mode === 'single'}
              onChange={(e) => setMode(e.target.value as 'single' | 'complete')}
              style={{ marginRight: '5px' }}
            />
            Single Screen
          </label>
          <label>
            <input
              type="radio"
              value="complete"
              checked={mode === 'complete'}
              onChange={(e) => setMode(e.target.value as 'single' | 'complete')}
              style={{ marginRight: '5px' }}
            />
            Complete App
          </label>
        </div>
      </div>

      {mode === 'single' ? (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#333' }}>Single Screen Details</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Screen Name:</label>
            <input
              type="text"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              placeholder="e.g., ProfileScreen"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., User profile management screen"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., User, Settings, Main"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Icon (emoji):</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g., 👤"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#333' }}>Complete App Description</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              App Description:
            </label>
            <textarea
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Describe your app idea. For example: 'A fitness tracking app where users can log workouts, track progress, and share achievements with friends.'"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                minHeight: '120px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      )}

      {/* Advanced Options */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: '#f0f0f0',
            border: '1px solid #ccc',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '15px'
          }}
        >
          {showAdvanced ? '🔽' : '🔼'} Advanced Options
        </button>

        {showAdvanced && (
          <div style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '4px', background: '#f9f9f9' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>System Prompt:</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Custom system prompt to guide Claude's behavior"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '60px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Append System Prompt:</label>
                <textarea
                  value={appendSystemPrompt}
                  onChange={(e) => setAppendSystemPrompt(e.target.value)}
                  placeholder="Additional instructions to append"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '60px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Allowed Tools:</label>
                <input
                  type="text"
                  value={allowedTools}
                  onChange={(e) => setAllowedTools(e.target.value)}
                  placeholder="Read,Write,Bash (comma-separated)"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Disallowed Tools:</label>
                <input
                  type="text"
                  value={disallowedTools}
                  onChange={(e) => setDisallowedTools(e.target.value)}
                  placeholder="WebFetch,WebSearch (comma-separated)"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Model:</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">Default</option>
                  <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                  <option value="claude-opus-4-20250514">Claude Opus 4</option>
                  <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Permission Mode:</label>
                <select
                  value={permissionMode}
                  onChange={(e) => setPermissionMode(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="default">Default</option>
                  <option value="accept-edits">Accept Edits</option>
                  <option value="bypass-permissions">Bypass Permissions</option>
                  <option value="plan">Plan Mode</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Turns:</label>
                <input
                  type="number"
                  value={maxTurns}
                  onChange={(e) => setMaxTurns(parseInt(e.target.value) || 3)}
                  min="1"
                  max="20"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Working Directory:</label>
                <input
                  type="text"
                  value={workingDirectory}
                  onChange={(e) => setWorkingDirectory(e.target.value)}
                  placeholder="/path/to/custom/directory"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                  <input
                    type="checkbox"
                    checked={verbose}
                    onChange={(e) => setVerbose(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Verbose Logging
                </label>
              </div>

              {/* Custom API Configuration */}
              <div style={{ gridColumn: '1 / -1', marginTop: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>🔧 Custom API Configuration</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Base URL:</label>
                    <input
                      type="text"
                      value={anthropicBaseUrl}
                      onChange={(e) => setAnthropicBaseUrl(e.target.value)}
                      placeholder="http://localhost:3002/api/anthropic-proxy"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <small style={{ color: '#666' }}>Override ANTHROPIC_BASE_URL</small>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Auth Token:</label>
                    <input
                      type="password"
                      value={anthropicAuthToken}
                      onChange={(e) => setAnthropicAuthToken(e.target.value)}
                      placeholder="fake-key-for-proxy"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <small style={{ color: '#666' }}>Override ANTHROPIC_AUTH_TOKEN</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => copyToClipboard(generatePrompt())}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📋 Copy Prompt
        </button>

        <button
          onClick={() => copyToClipboard(generateCliCommand())}
          style={{
            background: '#6f42c1',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          💻 Copy CLI Command
        </button>

        {serverAvailable && (
          <button
            onClick={executeClaudeCode}
            disabled={isExecuting}
            style={{
              background: isExecuting ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: isExecuting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isExecuting ? 0.6 : 1
            }}
          >
            {isExecuting ? '⏳ Executing...' : '🚀 Execute Now'}
          </button>
        )}
      </div>

      {serverAvailable && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '4px',
          color: '#155724'
        }}>
          ✅ <strong>Claude Code Server Detected:</strong> You can execute prompts directly!
        </div>
      )}

      {!serverAvailable && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px',
          color: '#721c24'
        }}>
          ⚠️ <strong>Claude Code Server Not Available:</strong> Copy the CLI command and run it manually.
          <br />
          <small>To enable direct execution: <code>cd branded44 && npm run dev:server</code></small>
        </div>
      )}

      {/* Claude Code Conversation Display */}
      {showConversation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '1000px',
            height: '80%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, color: '#333' }}>🤖 Claude Code Execution Results</h2>
                {executionResult && (
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                    ✅ Completed in {executionResult.duration}ms • {executionResult.messageCount} messages • Working Directory: {executionResult.workingDirectory}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowConversation(false)}
                style={{
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px'
            }}>
              {claudeMessages.map((message, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  background: message.type === 'assistant' ? '#f8f9fa' : 
                            message.type === 'user' ? '#e3f2fd' : 
                            message.type === 'system' ? '#fff3e0' : '#f5f5f5'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: message.type === 'assistant' ? '#28a745' : 
                          message.type === 'user' ? '#007bff' : 
                          message.type === 'system' ? '#fd7e14' : '#6c757d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>
                      {message.type === 'assistant' ? '🤖' : 
                       message.type === 'user' ? '👤' : 
                       message.type === 'system' ? '⚙️' : '📝'}
                    </span>
                    <span style={{ textTransform: 'capitalize' }}>{message.type}</span>
                    {message.subtype && <span style={{ fontSize: '12px', opacity: 0.7 }}>({message.subtype})</span>}
                  </div>
                  
                  {/* Message Content */}
                  {message.message && message.message.content && (
                    <div style={{ marginBottom: '10px' }}>
                      {Array.isArray(message.message.content) ? (
                        message.message.content.map((content: any, contentIndex: number) => (
                          <div key={contentIndex} style={{ marginBottom: '8px' }}>
                            {content.type === 'text' && (
                              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px' }}>
                                {content.text}
                              </div>
                            )}
                            {content.type === 'tool_use' && (
                              <div style={{
                                background: '#fff3cd',
                                border: '1px solid #ffeaa7',
                                borderRadius: '4px',
                                padding: '8px',
                                fontSize: '14px'
                              }}>
                                <strong>🔧 Tool: {content.name}</strong>
                                <pre style={{ margin: '5px 0 0 0', fontSize: '12px', overflow: 'auto' }}>
                                  {JSON.stringify(content.input, null, 2)}
                                </pre>
                              </div>
                            )}
                            {content.type === 'tool_result' && (
                              <div style={{
                                background: content.is_error ? '#f8d7da' : '#d4edda',
                                border: `1px solid ${content.is_error ? '#f5c6cb' : '#c3e6cb'}`,
                                borderRadius: '4px',
                                padding: '8px',
                                fontSize: '14px'
                              }}>
                                <strong>{content.is_error ? '❌' : '✅'} Tool Result</strong>
                                <pre style={{ margin: '5px 0 0 0', fontSize: '12px', overflow: 'auto' }}>
                                  {content.content}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px' }}>
                          {typeof message.message.content === 'string' ? message.message.content : JSON.stringify(message.message.content, null, 2)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* System Message Details */}
                  {message.type === 'system' && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {message.cwd && <div><strong>Working Directory:</strong> {message.cwd}</div>}
                      {message.model && <div><strong>Model:</strong> {message.model}</div>}
                      {message.permissionMode && <div><strong>Permission Mode:</strong> {message.permissionMode}</div>}
                      {message.tools && <div><strong>Available Tools:</strong> {message.tools.join(', ')}</div>}
                    </div>
                  )}

                  {/* Result Summary */}
                  {message.type === 'result' && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div><strong>Duration:</strong> {message.duration_ms}ms (API: {message.duration_api_ms}ms)</div>
                      <div><strong>Turns:</strong> {message.num_turns}</div>
                      <div><strong>Cost:</strong> ${message.total_cost_usd?.toFixed(4) || '0.0000'}</div>
                      {message.result && (
                        <div style={{ marginTop: '8px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          <strong>Final Result:</strong><br/>
                          {message.result}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test SDK Conversation Display */}
      {showTestConversation && testResult?.messages && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '1000px',
            height: '80%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, color: '#333' }}>🧪 SDK Test Response</h2>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                  Prompt: "{testPrompt}" • {testResult.messageCount} messages • {testResult.duration}ms
                </p>
              </div>
              <button
                onClick={() => setShowTestConversation(false)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px'
            }}>
              {testResult.messages.map((message: any, index: number) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  backgroundColor: message.type === 'assistant' ? '#f8f9fa' : 
                                   message.type === 'system' ? '#e3f2fd' :
                                   message.type === 'result' ? '#e8f5e8' : '#fff'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: message.type === 'assistant' ? '#495057' :
                           message.type === 'system' ? '#1976d2' :
                           message.type === 'result' ? '#388e3c' : '#333'
                  }}>
                    {message.type === 'assistant' ? '🤖 Assistant' :
                     message.type === 'system' ? '⚙️ System' :
                     message.type === 'result' ? '✅ Result' : `📝 ${message.type}`}
                  </div>

                  {/* Assistant Message */}
                  {message.type === 'assistant' && message.message?.content && (
                    <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px' }}>
                      {Array.isArray(message.message.content) 
                        ? message.message.content.map((c: any) => c.text).join('')
                        : message.message.content}
                    </div>
                  )}

                  {/* System Message */}
                  {message.type === 'system' && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {message.cwd && <div><strong>Working Directory:</strong> {message.cwd}</div>}
                      {message.model && <div><strong>Model:</strong> {message.model}</div>}
                      {message.permissionMode && <div><strong>Permission Mode:</strong> {message.permissionMode}</div>}
                    </div>
                  )}

                  {/* Result Summary */}
                  {message.type === 'result' && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div><strong>Duration:</strong> {message.duration_ms}ms</div>
                      <div><strong>Cost:</strong> ${message.total_cost_usd?.toFixed(4) || '0.0000'}</div>
                      {message.result && (
                        <div style={{ marginTop: '8px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          <strong>Final Result:</strong><br/>
                          {message.result}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptGenerator; 