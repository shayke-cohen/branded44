import React, { useState, useEffect } from 'react';
import { generateSingleScreenPrompt, generateCompleteAppPrompt } from '../utils/claudePrompts';

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
  const [permissionMode, setPermissionMode] = useState('default');
  const [verbose, setVerbose] = useState(false);
  const [maxTurns, setMaxTurns] = useState(20);
  const [workingDirectory, setWorkingDirectory] = useState('/Users/shayco/claude-code/branded44/packages/mobile');

  // Additional security/proxy options 
  const [dangerouslySkipPermissions, setDangerouslySkipPermissions] = useState(true);
  const [anthropicBaseUrl, setAnthropicBaseUrl] = useState('http://localhost:3002/api/anthropic-proxy');
  const [anthropicAuthToken, setAnthropicAuthToken] = useState('fake-key-for-proxy');

  // Claude Code conversation display
  const [claudeMessages, setClaudeMessages] = useState<any[]>([]);
  const [showConversation, setShowConversation] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [lastExecutedPrompt, setLastExecutedPrompt] = useState('');

  // Real-time streaming
  const [streamingMessages, setStreamingMessages] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(true);

  // Quick SDK Test
  const [testPrompt, setTestPrompt] = useState('List files in current directory');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestExecuting, setIsTestExecuting] = useState(false);
  const [useProxyForTest, setUseProxyForTest] = useState(false);
  const [showTestConversation, setShowTestConversation] = useState(false);

  // UI Collapse/Expand state
  const [showSingleScreenDetails, setShowSingleScreenDetails] = useState(false);
  const [showCompleteAppDetails, setShowCompleteAppDetails] = useState(false);
  const [showQuickTest, setShowQuickTest] = useState(false);

  useEffect(() => {
    // Check if Claude Code server is available
    fetch('http://localhost:3001/check-claude-code')
      .then(res => res.json())
      .then(data => setServerAvailable(data.installed))
      .catch(() => setServerAvailable(false));
  }, []);

  // Auto-scroll to bottom when streaming messages update
  useEffect(() => {
    if (isStreaming && streamingMessages.length > 0) {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [streamingMessages, isStreaming]);

  // Auto-populate description from screen name
  useEffect(() => {
    if (screenName && description === '') {
      setDescription(screenName);
    }
  }, [screenName, description]);

  // ✅ Refactored to use centralized prompt functions
  const generatePrompt = () => {
    if (mode === 'single') {
      return generateSingleScreenPrompt({
        screenName,
        description,
        category,
        icon
      });
    } else {
      return generateCompleteAppPrompt({
        appDescription
      });
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
    if (maxTurns !== 20) command += ` --max-turns ${maxTurns}`;
    if (workingDirectory) command += ` --add-dir "${workingDirectory}"`;
    if (dangerouslySkipPermissions) command += ` --dangerously-skip-permissions`;
    
    // Add environment variables if specified
    let envVars = '';
    if (anthropicBaseUrl) envVars += `ANTHROPIC_BASE_URL="${anthropicBaseUrl}" `;
    if (anthropicAuthToken) envVars += `ANTHROPIC_AUTH_TOKEN="${anthropicAuthToken}" `;
    
    return envVars + command;
  };

  const executeClaudeCodeStreaming = async () => {
    // Validate required fields for single mode
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
    }

    setIsExecuting(true);
    setIsStreaming(true);
    setStreamingMessages([]);
    setShowConversation(true);
    
    try {
      const prompt = generatePrompt();
      setLastExecutedPrompt(prompt);

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
      if (dangerouslySkipPermissions) requestBody.dangerouslySkipPermissions = dangerouslySkipPermissions;
      if (anthropicBaseUrl) requestBody.anthropicBaseUrl = anthropicBaseUrl;
      if (anthropicAuthToken) requestBody.anthropicAuthToken = anthropicAuthToken;

      console.log('Starting streaming execution with options:', requestBody);

      // Use fetch stream for real-time streaming
      const response = await fetch('http://localhost:3001/execute-claude-code-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let allMessages: any[] = [];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last line in buffer if it doesn't end with \n
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line.length > 6) {
            try {
              const jsonStr = line.slice(6).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                
                if (data.type === 'connection') {
                  console.log('🌊 Streaming connection established');
                } else if (data.type === 'message') {
                  allMessages = [...allMessages, data.message];
                  setStreamingMessages(allMessages);
                  console.log(`📨 Received: ${data.message.type}`);
                } else if (data.type === 'complete') {
                  setStreamingMessages(data.messages || allMessages);
                  console.log('✅ Streaming execution completed successfully');
                } else if (data.type === 'error') {
                  console.error('❌ Streaming execution failed:', data);
                  alert(`❌ Claude Code failed: ${data.error}\n\nDetails: ${data.details || 'No details available'}`);
                }
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', line, e);
            }
          }
        }
      }

      console.log('✅ Streaming execution completed successfully!');
      alert('🚀 Execution completed! Check the mobile package for changes.');

    } catch (error) {
      console.error('Streaming execution error:', error);
      alert(`❌ Execution failed: ${error}`);
    } finally {
      setIsExecuting(false);
      setIsStreaming(false);
    }
  };

  const executeClaudeCode = async () => {
    if (streamingEnabled) {
      return executeClaudeCodeStreaming();
    }

    // Validate required fields for single mode
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
    }

    setIsExecuting(true);
    try {
      const prompt = generatePrompt();
      setLastExecutedPrompt(prompt); // Store the prompt for display
      
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
      if (dangerouslySkipPermissions) requestBody.dangerouslySkipPermissions = dangerouslySkipPermissions;
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

  const isFormValid = () => {
    if (mode === 'single') {
      return screenName.trim() && description.trim();
    } else if (mode === 'complete') {
      return appDescription.trim();
    }
    return false;
  };

  // Test execution function
  const executeTestPrompt = async () => {
    if (!testPrompt.trim()) {
      alert('Please enter a test prompt.');
      return;
    }

    setIsTestExecuting(true);
    setShowTestConversation(true);
    
    try {
      const requestBody: any = {
        prompt: testPrompt,
        maxTurns: maxTurns
      };

      // Add basic options for testing
      if (workingDirectory) requestBody.workingDirectory = workingDirectory;
      if (dangerouslySkipPermissions) requestBody.dangerouslySkipPermissions = dangerouslySkipPermissions;
      
      // Use proxy options for test if enabled
      if (useProxyForTest) {
        if (anthropicBaseUrl) requestBody.anthropicBaseUrl = anthropicBaseUrl;
        if (anthropicAuthToken) requestBody.anthropicAuthToken = anthropicAuthToken;
      }

      console.log('🧪 Testing Claude Code SDK with prompt:', requestBody);

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
        console.log('✅ Test execution completed successfully');
      } else {
        alert(`❌ Test execution failed: ${result.error}\n\nDetails: ${result.details || 'No details available'}`);
      }
    } catch (error) {
      console.error('Test execution error:', error);
      alert(`❌ Test execution failed: ${error}`);
      setTestResult({ success: false, error: error.toString() });
    } finally {
      setIsTestExecuting(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      width: '100%',
      maxHeight: 'calc(100vh - 200px)',
      overflow: 'auto'
    }}>
      
      <div className="sticky-header">
        <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>🤖 Claude Code Prompt Generator</h1>
        <p style={{ margin: '0 0 20px 0', color: '#666' }}>
          Generate prompts for Claude Code to create React Native screens or complete apps
        </p>

        {/* Quick SDK Test Section - Collapsible */}
        <button
          onClick={() => setShowQuickTest(!showQuickTest)}
          style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '15px',
            fontSize: '14px',
            width: '100%',
            textAlign: 'left'
          }}
        >
          {showQuickTest ? '🔽' : '🔼'} 🧪 Quick SDK Test
        </button>

        {showQuickTest && (
          <div style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '4px', background: '#f9f9f9', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Test Claude Code SDK</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter a test prompt (e.g., 'List files in current directory')"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }}
              />
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={useProxyForTest}
                  onChange={(e) => setUseProxyForTest(e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                Use proxy settings for test
              </label>
            </div>
            <button
              onClick={executeTestPrompt}
              disabled={isTestExecuting || !testPrompt.trim()}
              style={{
                background: (isTestExecuting || !testPrompt.trim()) ? '#6c757d' : '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: (isTestExecuting || !testPrompt.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                marginRight: '10px'
              }}
            >
              {isTestExecuting ? '⏳ Testing...' : '🧪 Test SDK'}
            </button>
            
            {testResult && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px', 
                background: testResult.success ? '#d4edda' : '#f8d7da', 
                border: testResult.success ? '1px solid #c3e6cb' : '1px solid #f5c6cb', 
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <strong>{testResult.success ? '✅ Test Passed' : '❌ Test Failed'}:</strong> 
                {testResult.success ? ` Completed in ${testResult.duration}ms` : ` ${testResult.error}`}
              </div>
            )}
          </div>
        )}
        
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
          {/* Always visible: Screen Name */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Screen Name: <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              placeholder="e.g., ProfileScreen"
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: screenName.trim() ? '1px solid #ccc' : '2px solid #ff6b6b', 
                borderRadius: '4px',
                backgroundColor: screenName.trim() ? 'white' : '#ffebee'
              }}
            />
          </div>

          {/* Collapsible details section */}
          <button
            onClick={() => setShowSingleScreenDetails(!showSingleScreenDetails)}
            style={{
              background: '#f0f0f0',
              border: '1px solid #ccc',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '15px',
              fontSize: '14px',
              width: '100%',
              textAlign: 'left'
            }}
          >
            {showSingleScreenDetails ? '🔽' : '🔼'} Screen Details
          </button>

          {showSingleScreenDetails && (
            <div style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '4px', background: '#f9f9f9', marginBottom: '15px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this screen does (auto-filled from screen name)"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Main, Settings, Social"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Icon:</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="e.g., 👤, ⚙️, 💬"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          {/* Always visible: App Description */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              App Description: <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Describe your app idea. For example: 'A fitness tracking app where users can log workouts, track progress, and share achievements with friends.'"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: appDescription.trim() ? '1px solid #ccc' : '2px solid #ff6b6b', 
                borderRadius: '4px',
                minHeight: '120px',
                resize: 'vertical',
                backgroundColor: appDescription.trim() ? 'white' : '#ffebee'
              }}
            />
          </div>

          {/* Optional: Collapsible details section for future app options */}
          {showCompleteAppDetails && (
            <div style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '4px', background: '#f9f9f9', marginBottom: '15px' }}>
              {/* Future app-specific options can go here */}
            </div>
          )}
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
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Turns:</label>
                <input
                  type="number"
                  value={maxTurns}
                  onChange={(e) => setMaxTurns(parseInt(e.target.value) || 20)}
                  min="1"
                  max="100"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Working Directory:</label>
                <input
                  type="text"
                  value={workingDirectory}
                  onChange={(e) => setWorkingDirectory(e.target.value)}
                  placeholder="/path/to/your/project"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Permission Mode:</label>
                <select
                  value={permissionMode}
                  onChange={(e) => setPermissionMode(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="default">Default</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Anthropic Base URL:</label>
                <input
                  type="text"
                  value={anthropicBaseUrl}
                  onChange={(e) => setAnthropicBaseUrl(e.target.value)}
                  placeholder="http://localhost:3002/api/anthropic-proxy"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Anthropic Auth Token:</label>
                <input
                  type="password"
                  value={anthropicAuthToken}
                  onChange={(e) => setAnthropicAuthToken(e.target.value)}
                  placeholder="fake-key-for-proxy"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={dangerouslySkipPermissions}
                  onChange={(e) => setDangerouslySkipPermissions(e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                ⚠️ Skip Permissions (Dangerous)
              </label>

              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={verbose}
                  onChange={(e) => setVerbose(e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                Verbose Logging
              </label>

              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={streamingEnabled}
                  onChange={(e) => setStreamingEnabled(e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                Real-time Streaming
              </label>
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
            disabled={isExecuting || !isFormValid()}
            style={{
              background: (isExecuting || !isFormValid()) ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: (isExecuting || !isFormValid()) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: (isExecuting || !isFormValid()) ? 0.6 : 1
            }}
          >
            {isExecuting 
              ? (isStreaming ? '🌊 Streaming Live...' : '⏳ Executing...') 
              : (streamingEnabled ? '🌊 Execute with Streaming' : '🚀 Execute Now')}
          </button>
        )}
        
        {!isFormValid() && (
          <div style={{ 
            marginTop: '10px', 
            padding: '8px', 
            background: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '4px',
            color: '#856404',
            fontSize: '14px'
          }}>
            ⚠️ Please fill in all required fields (*) before executing.
          </div>
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

            {/* Prompt Section */}
            {lastExecutedPrompt && (
              <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid #e0e0e0',
                background: '#f8f9fa'
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📝 Sent Prompt</h3>
                <pre style={{
                  background: '#ffffff',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  fontSize: '12px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {lastExecutedPrompt}
                </pre>
              </div>
            )}

            {/* Messages */}
            <div 
              className="messages-container"
              style={{
                flex: 1,
                padding: '20px',
                overflow: 'auto'
              }}
            >
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>💬 Claude Messages</h3>
              
              {isStreaming && (
                <div style={{ 
                  padding: '10px', 
                  background: '#e3f2fd', 
                  border: '1px solid #bbdefb', 
                  borderRadius: '4px',
                  marginBottom: '15px',
                  color: '#1565c0'
                }}>
                  🌊 Streaming live messages... ({streamingMessages.length} received)
                </div>
              )}

              {(streamingMessages.length > 0 ? streamingMessages : claudeMessages).map((message, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  background: message.type === 'system' ? '#f8f9fa' : 
                           message.type === 'assistant' ? '#e8f5e8' :
                           message.type === 'user' ? '#e3f2fd' : '#fff'
                }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '5px',
                    color: message.type === 'system' ? '#6c757d' :
                           message.type === 'assistant' ? '#28a745' :
                           message.type === 'user' ? '#007bff' : '#333'
                  }}>
                    {message.type === 'system' && '⚙️ System'}
                    {message.type === 'assistant' && '🤖 Claude'}
                    {message.type === 'user' && '👤 User'}
                    {message.type === 'tool_use' && '🔧 Tool Use'}
                    {message.type === 'tool_result' && '📋 Tool Result'}
                    {!['system', 'assistant', 'user', 'tool_use', 'tool_result'].includes(message.type) && `📝 ${message.type}`}
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                    {message.content && (
                      <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        margin: 0,
                        fontFamily: 'inherit'
                      }}>
                        {typeof message.content === 'string' 
                          ? message.content 
                          : JSON.stringify(message.content, null, 2)}
                      </pre>
                    )}
                    {message.type === 'tool_use' && (
                      <div>
                        <strong>Tool:</strong> {message.name}<br />
                        <strong>Input:</strong> <pre style={{ margin: '5px 0', fontSize: '12px' }}>{JSON.stringify(message.input, null, 2)}</pre>
                      </div>
                    )}
                    {message.type === 'tool_result' && message.is_error && (
                      <div style={{ color: '#dc3545' }}>
                        <strong>❌ Error:</strong> {message.error || 'Tool execution failed'}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {((streamingMessages.length === 0 && claudeMessages.length === 0) || (!isStreaming && !executionResult)) && (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  No messages to display yet. Execute a prompt to see Claude's responses.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptGenerator; 