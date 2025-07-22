import React, { useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {usePreview, ScreenType} from '../context/PreviewContext';
import {getScreens} from '@mobile/screen-templates/templateConfig';
import { generateCompleteAppPrompt, generateSingleScreenPrompt, generateUpdateExistingPrompt } from '../utils/claudePrompts';

const PreviewNavigation: React.FC = () => {
  const {
    deviceFrame,
    setDeviceFrame,
    selectedScreen,
    setSelectedScreen,
  } = usePreview();

  // App generation state
  const [appDescription, setAppDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [lastPrompt, setLastPrompt] = useState('');

  // Screen creation state
  const [screenName, setScreenName] = useState('');
  const [screenDescription, setScreenDescription] = useState('');
  const [screenCategory, setScreenCategory] = useState('');
  const [screenIcon, setScreenIcon] = useState('');
  const [isCreatingScreen, setIsCreatingScreen] = useState(false);
  const [screenExecutionLogs, setScreenExecutionLogs] = useState<any[]>([]);
  const [lastScreenPrompt, setLastScreenPrompt] = useState('');

  // Update existing state
  const [updateDescription, setUpdateDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateExecutionLogs, setUpdateExecutionLogs] = useState<any[]>([]);
  const [lastUpdatePrompt, setLastUpdatePrompt] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState<'screen' | 'update' | 'app'>('screen');

  const deviceFrames = [
    {key: 'iphone', label: '📱 iPhone'},
    {key: 'android', label: '🤖 Android'},
  ];

  // Get dynamic data from unified registry
  const screenEntities = getScreens();
  
  const screens = screenEntities.map(screen => ({
    key: screen.id,
    label: `${screen.icon || '📱'} ${screen.name}`
  }));

  // Screen creation function
  const createScreen = async () => {
    if (!screenName.trim()) {
      alert('Please enter a screen name.');
      return;
    }

    setIsCreatingScreen(true);

    try {
      const singleScreenPrompt = generateSingleScreenPrompt({
        screenName,
        description: screenDescription || screenName,
        category: screenCategory || 'Main',
        icon: screenIcon || '📱'
      });

      const requestBody = {
        prompt: singleScreenPrompt,
        maxTurns: 20,
        workingDirectory: '/Users/shayco/claude-code/branded44/packages/mobile',
        dangerouslySkipPermissions: true,
        anthropicBaseUrl: 'http://localhost:3002/api/anthropic-proxy',
        anthropicAuthToken: 'fake-key-for-proxy'
      };

      console.log('🚀 Creating screen with Claude Code SDK...');
      
      setLastScreenPrompt(singleScreenPrompt);
      setScreenExecutionLogs([]);

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
                  setScreenExecutionLogs(allMessages);
                  console.log(`📨 Received: ${data.message.type}`);
                } else if (data.type === 'complete') {
                  setScreenExecutionLogs(data.messages || allMessages);
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

      console.log('✅ Screen creation completed successfully!');
      alert('🚀 Screen creation completed! Check the mobile package for the new screen.');
      
      // Clear the inputs
      setScreenName('');
      setScreenDescription('');
      setScreenCategory('');
      setScreenIcon('');

    } catch (error) {
      console.error('Screen creation error:', error);
      alert(`❌ Screen creation failed: ${error}`);
    } finally {
      setIsCreatingScreen(false);
    }
  };

  // Update existing function
  const updateExisting = async () => {
    if (!updateDescription.trim()) {
      alert('Please describe what you want to update.');
      return;
    }

    setIsUpdating(true);

    try {
      const updatePrompt = generateUpdateExistingPrompt({
        updateDescription
      });

      const requestBody = {
        prompt: updatePrompt,
        maxTurns: 20,
        workingDirectory: '/Users/shayco/claude-code/branded44/packages/mobile',
        dangerouslySkipPermissions: true,
        anthropicBaseUrl: 'http://localhost:3002/api/anthropic-proxy',
        anthropicAuthToken: 'fake-key-for-proxy'
      };

      console.log('🚀 Updating existing app with Claude Code SDK...');
      
      setLastUpdatePrompt(updatePrompt);
      setUpdateExecutionLogs([]);

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
                  setUpdateExecutionLogs(allMessages);
                  console.log(`📨 Received: ${data.message.type}`);
                } else if (data.type === 'complete') {
                  setUpdateExecutionLogs(data.messages || allMessages);
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

      console.log('✅ App update completed successfully!');
      alert('🚀 App update completed! Check the mobile package for changes.');
      
      setUpdateDescription('');

    } catch (error) {
      console.error('App update error:', error);
      alert(`❌ App update failed: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // App generation function using same defaults as PromptGenerator
  const generateApp = async () => {
    if (!appDescription.trim()) {
      alert('Please enter an app description.');
      return;
    }

    setIsGenerating(true);

    try {
      // ✅ Using centralized prompt from utils/claudePrompts.ts
      const completeAppPrompt = generateCompleteAppPrompt({
        appDescription
      });

      // Same defaults as PromptGenerator
      const requestBody = {
        prompt: completeAppPrompt,
        maxTurns: 20,
        workingDirectory: '/Users/shayco/claude-code/branded44/packages/mobile',
        dangerouslySkipPermissions: true,
        anthropicBaseUrl: 'http://localhost:3002/api/anthropic-proxy',
        anthropicAuthToken: 'fake-key-for-proxy'
      };

      console.log('🚀 Generating app with Claude Code SDK...');
      
      // Store the prompt for display
      setLastPrompt(completeAppPrompt);
      setExecutionLogs([]);

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
                  setExecutionLogs(allMessages);
                  console.log(`📨 Received: ${data.message.type}`);
                } else if (data.type === 'complete') {
                  setExecutionLogs(data.messages || allMessages);
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

      console.log('✅ App generation completed successfully!');
      alert('🚀 App generation completed! Check the mobile package for new screens.');
      
      // Clear the input
      setAppDescription('');

    } catch (error) {
      console.error('App generation error:', error);
      alert(`❌ App generation failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mobile Preview</Text>
      
      {/* Device Frame Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Frame</Text>
        <View style={styles.buttonRow}>
          {deviceFrames.map((frame) => (
            <TouchableOpacity
              key={frame.key}
              style={[
                styles.button,
                deviceFrame === frame.key && styles.activeButton,
              ]}
              onPress={() => setDeviceFrame(frame.key as any)}>
              <Text
                style={[
                  styles.buttonText,
                  deviceFrame === frame.key && styles.activeButtonText,
                ]}>
                {frame.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Screen Selection */}
      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Screen Access</Text>
          <Text style={styles.hint}>💡 Use native tabs below for navigation</Text>
          {screens.map((screen) => (
            <TouchableOpacity
              key={screen.key}
              style={[
                styles.itemButton,
                selectedScreen === screen.key && styles.activeItemButton,
              ]}
              onPress={() => setSelectedScreen(screen.key as ScreenType)}>
              <Text
                style={[
                  styles.itemButtonText,
                  selectedScreen === screen.key && styles.activeItemButtonText,
                ]}>
                {screen.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      {/* Claude Code Generation Tabs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 Claude Code Generation</Text>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'screen' && styles.activeTab]}
            onPress={() => setActiveTab('screen')}>
            <Text style={[styles.tabText, activeTab === 'screen' && styles.activeTabText]}>
              📱 Create Screen
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'update' && styles.activeTab]}
            onPress={() => setActiveTab('update')}>
            <Text style={[styles.tabText, activeTab === 'update' && styles.activeTabText]}>
              🔄 Update Existing
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'app' && styles.activeTab]}
            onPress={() => setActiveTab('app')}>
            <Text style={[styles.tabText, activeTab === 'app' && styles.activeTabText]}>
              🚀 Generate App
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'screen' && (
            <View>
              <Text style={styles.hint}>Add a new screen to your app. Claude can analyze existing code and run shell commands.</Text>
              
              <View style={styles.inputContainer}>
                <input
                  type="text"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  placeholder="e.g., ProfileScreen, SettingsScreen"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: screenName.trim() ? '1px solid #e0e0e0' : '2px solid #ff6b6b',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '8px',
                    backgroundColor: screenName.trim() ? '#fff' : '#ffebee',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                
                <input
                  type="text"
                  value={screenDescription}
                  onChange={(e) => setScreenDescription(e.target.value)}
                  placeholder="Screen description (optional, defaults to screen name)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '8px',
                    backgroundColor: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={screenCategory}
                    onChange={(e) => setScreenCategory(e.target.value)}
                    placeholder="Category (e.g., Main, Settings)"
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  
                  <input
                    type="text"
                    value={screenIcon}
                    onChange={(e) => setScreenIcon(e.target.value)}
                    placeholder="Icon (e.g., 👤, ⚙️)"
                    style={{
                      width: '100px',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    isCreatingScreen && styles.generatingButton,
                    !screenName.trim() && styles.disabledButton
                  ]}
                  onPress={createScreen}
                  disabled={isCreatingScreen || !screenName.trim()}>
                  <Text style={[
                    styles.generateButtonText,
                    isCreatingScreen && styles.generatingButtonText,
                    !screenName.trim() && styles.disabledButtonText
                  ]}>
                    {isCreatingScreen ? '⏳ Creating...' : '📱 Create Screen'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Screen Creation Logs */}
              {(lastScreenPrompt || screenExecutionLogs.length > 0) && (
                <View style={styles.logsSection}>
                  <Text style={styles.logsSectionTitle}>📋 Screen Creation Logs</Text>
                  
                  {lastScreenPrompt && (
                    <View style={styles.logItem}>
                      <Text style={styles.logItemTitle}>📝 Sent Prompt</Text>
                      <div style={{
                        maxHeight: '200px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {lastScreenPrompt}
                      </div>
                    </View>
                  )}

                  {screenExecutionLogs.length > 0 && (
                    <View style={styles.logItem}>
                      <Text style={styles.logItemTitle}>💬 Claude Messages</Text>
                      <div style={{
                        maxHeight: '300px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px'
                      }}>
                        {screenExecutionLogs.map((message, index) => (
                          <div key={index} style={{
                            marginBottom: '8px',
                            paddingBottom: '8px',
                            borderBottom: index < screenExecutionLogs.length - 1 ? '1px solid #e9ecef' : 'none'
                          }}>
                            <div style={{
                              fontWeight: 'bold',
                              color: message.type === 'text' ? '#007bff' : 
                                    message.type === 'tool_use' ? '#28a745' : 
                                    message.type === 'tool_result' ? '#dc3545' : '#6c757d',
                              marginBottom: '4px'
                            }}>
                              {message.type === 'text' ? '🤖 assistant' :
                               message.type === 'tool_use' ? '🔧 tool_use' :
                               message.type === 'tool_result' ? '📝 tool_result' : 
                               `⚙️ ${message.type}`}
                            </div>
                            <div style={{
                              color: '#495057',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.3'
                            }}>
                              {(() => {
                                if (message.type === 'text' && message.content) {
                                  return message.content;
                                } else if (message.type === 'tool_use') {
                                  return `🔧 Tool: ${message.name}\nInput: ${JSON.stringify(message.input, null, 2)}`;
                                } else if (message.type === 'tool_result') {
                                  return `📝 Tool Result:\n${typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}`;
                                } else if (message.content) {
                                  return typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2);
                                } else {
                                  return JSON.stringify(message, null, 2);
                                }
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {activeTab === 'update' && (
            <View>
              <Text style={styles.hint}>Improve or modify existing screens and functionality. Claude can use shell commands like `ls`, `cat`, `grep`, `git`, `npm`, etc.</Text>
              
              <View style={styles.inputContainer}>
                <textarea
                  value={updateDescription}
                  onChange={(e) => setUpdateDescription(e.target.value)}
                  placeholder="Describe what you want to update, improve, or modify. E.g., 'Add a search feature to the ProfileScreen', 'Improve the styling of all buttons', 'Add navigation between WorkoutScreen and ProgressScreen'"
                  style={{
                    ...styles.textArea,
                    border: updateDescription.trim() ? '1px solid #e0e0e0' : '2px solid #ff6b6b',
                    backgroundColor: updateDescription.trim() ? '#fff' : '#ffebee',
                  }}
                />
                
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    isUpdating && styles.generatingButton,
                    !updateDescription.trim() && styles.disabledButton
                  ]}
                  onPress={updateExisting}
                  disabled={isUpdating || !updateDescription.trim()}>
                  <Text style={[
                    styles.generateButtonText,
                    isUpdating && styles.generatingButtonText,
                    !updateDescription.trim() && styles.disabledButtonText
                  ]}>
                    {isUpdating ? '⏳ Updating...' : '🔄 Update Existing'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Update Logs */}
              {(lastUpdatePrompt || updateExecutionLogs.length > 0) && (
                <View style={styles.logsSection}>
                  <Text style={styles.logsSectionTitle}>📋 Update Logs</Text>
                  
                  {lastUpdatePrompt && (
                    <View style={styles.logItem}>
                      <Text style={styles.logItemTitle}>📝 Sent Prompt</Text>
                      <div style={{
                        maxHeight: '200px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {lastUpdatePrompt}
                      </div>
                    </View>
                  )}

                  {updateExecutionLogs.length > 0 && (
                    <View style={styles.logItem}>
                      <Text style={styles.logItemTitle}>💬 Claude Messages</Text>
                      <div style={{
                        maxHeight: '300px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px'
                      }}>
                        {updateExecutionLogs.map((message, index) => (
                          <div key={index} style={{
                            marginBottom: '8px',
                            paddingBottom: '8px',
                            borderBottom: index < updateExecutionLogs.length - 1 ? '1px solid #e9ecef' : 'none'
                          }}>
                            <div style={{
                              fontWeight: 'bold',
                              color: message.type === 'text' ? '#007bff' : 
                                    message.type === 'tool_use' ? '#28a745' : 
                                    message.type === 'tool_result' ? '#dc3545' : '#6c757d',
                              marginBottom: '4px'
                            }}>
                              {message.type === 'text' ? '🤖 assistant' :
                               message.type === 'tool_use' ? '🔧 tool_use' :
                               message.type === 'tool_result' ? '📝 tool_result' : 
                               `⚙️ ${message.type}`}
                            </div>
                            <div style={{
                              color: '#495057',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.3'
                            }}>
                              {(() => {
                                if (message.type === 'text' && message.content) {
                                  return message.content;
                                } else if (message.type === 'tool_use') {
                                  return `🔧 Tool: ${message.name}\nInput: ${JSON.stringify(message.input, null, 2)}`;
                                } else if (message.type === 'tool_result') {
                                  return `📝 Tool Result:\n${typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}`;
                                } else if (message.content) {
                                  return typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2);
                                } else {
                                  return JSON.stringify(message, null, 2);
                                }
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {activeTab === 'app' && (
            <View>
              <Text style={styles.hint}>Describe your app idea to generate screens. Claude can set up the project structure and dependencies.</Text>
              
              <View style={styles.inputContainer}>
                <textarea
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  placeholder="e.g., A fitness tracking app where users can log workouts, track progress, and share achievements with friends."
                  style={{
                    ...styles.textArea,
                    border: appDescription.trim() ? '1px solid #e0e0e0' : '2px solid #ff6b6b',
                    backgroundColor: appDescription.trim() ? '#fff' : '#ffebee',
                  }}
                />
                
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    isGenerating && styles.generatingButton,
                    !appDescription.trim() && styles.disabledButton
                  ]}
                  onPress={generateApp}
                  disabled={isGenerating || !appDescription.trim()}>
                  <Text style={[
                    styles.generateButtonText,
                    isGenerating && styles.generatingButtonText,
                    !appDescription.trim() && styles.disabledButtonText
                  ]}>
                    {isGenerating ? '⏳ Generating...' : '🚀 Generate App'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Claude Code Logs */}
              {(lastPrompt || executionLogs.length > 0) && (
                <View style={styles.logsSection}>
                  <Text style={styles.logsSectionTitle}>📋 Execution Logs</Text>
                  
                  {lastPrompt && (
                    <View style={styles.logItem}>
                      <Text style={styles.logItemTitle}>📝 Sent Prompt</Text>
                      <div style={{
                        maxHeight: '200px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {lastPrompt}
                      </div>
                    </View>
                  )}

                                      {executionLogs.length > 0 && (
                      <View style={styles.logItem}>
                        <Text style={styles.logItemTitle}>💬 Claude Messages</Text>
                        <div style={{
                          maxHeight: '300px',
                          overflow: 'auto',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          borderRadius: '6px',
                          padding: '10px',
                          fontSize: '12px'
                        }}>
                          {executionLogs.map((message, index) => (
                            <div key={index} style={{
                              marginBottom: '8px',
                              paddingBottom: '8px',
                              borderBottom: index < executionLogs.length - 1 ? '1px solid #e9ecef' : 'none'
                            }}>
                              <div style={{
                                fontWeight: 'bold',
                                color: message.type === 'text' ? '#007bff' : 
                                      message.type === 'tool_use' ? '#28a745' : 
                                      message.type === 'tool_result' ? '#dc3545' : '#6c757d',
                                marginBottom: '4px'
                              }}>
                                {message.type === 'text' ? '🤖 assistant' :
                                 message.type === 'tool_use' ? '🔧 tool_use' :
                                 message.type === 'tool_result' ? '📝 tool_result' : 
                                 `⚙️ ${message.type}`}
                              </div>
                              <div style={{
                                color: '#495057',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.3'
                              }}>
                                {(() => {
                                  if (message.type === 'text' && message.content) {
                                    return message.content;
                                  } else if (message.type === 'tool_use') {
                                    return `🔧 Tool: ${message.name}\nInput: ${JSON.stringify(message.input, null, 2)}`;
                                  } else if (message.type === 'tool_result') {
                                    return `📝 Tool Result:\n${typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}`;
                                  } else if (message.content) {
                                    return typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2);
                                  } else {
                                    return JSON.stringify(message, null, 2);
                                  }
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </View>
                    )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 500,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginRight: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'flex-start',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#ffffff',
  },
  modeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeModeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeModeButtonText: {
    color: '#ffffff',
  },
  modeSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activeModeSubtitle: {
    color: '#ffffff',
    opacity: 0.9,
  },
  itemButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
    marginBottom: 6,
  },
  activeItemButton: {
    backgroundColor: '#007AFF',
  },
  itemButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activeItemButtonText: {
    color: '#ffffff',
  },
  generateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#28a745',
    alignItems: 'center',
    marginTop: 5,
  },
  generatingButton: {
    backgroundColor: '#6c757d',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  generatingButtonText: {
    color: '#ffffff',
  },
  disabledButtonText: {
    color: '#6c757d',
  },
  inputContainer: {
    marginTop: 8,
  },
  textArea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    resize: 'vertical',
    marginBottom: '12px',
    backgroundColor: '#fff',
    outline: 'none',
    lineHeight: '1.4',
    boxSizing: 'border-box',
  },
  logsSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid #e9ecef',
  },
  logsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  logItem: {
    marginBottom: 16,
  },
  logItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '600',
  },
  tabContent: {
    paddingTop: 16,
  },
});

export default PreviewNavigation; 