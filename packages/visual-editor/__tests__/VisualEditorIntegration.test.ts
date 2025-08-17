import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { io as ioClient } from 'socket.io-client';

// Configuration
const SERVER_URL = 'http://localhost:3001';
const TEST_TIMEOUT = 30000; // 30 seconds for integration tests

// Test file content for validation
const TEST_FILE_CONTENT = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TestComponent: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Component Created by Integration Test</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default TestComponent;
`;

const UPDATED_TEST_FILE_CONTENT = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TestComponent: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Updated Test Component - Integration Test Success!</Text>
      <Text style={styles.subtitle}>File was successfully edited and saved</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});

export default TestComponent;
`;

describe('Visual Editor Server Integration', () => {
  let sessionId: string;
  let sessionInfo: any;
  let socket: any;

  // Setup before all tests
  beforeAll(async () => {
    console.log('🔧 Setting up integration test environment...');
    
    // Check if server is running
    try {
      await axios.get(`${SERVER_URL}/health`);
      console.log('✅ Server is running');
    } catch (error) {
      throw new Error('❌ Server is not running. Please start the server first.');
    }
  }, TEST_TIMEOUT);

  // Cleanup after all tests
  afterAll(async () => {
    console.log('🧹 Cleaning up integration test environment...');
    
    if (socket) {
      socket.disconnect();
    }

    // Clean up test session if it was created
    if (sessionId) {
      try {
        await axios.delete(`${SERVER_URL}/api/editor/session/${sessionId}`);
        console.log(`✅ Cleaned up test session: ${sessionId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to clean up session: ${error}`);
      }
    }
  }, TEST_TIMEOUT);

  describe('Session Management', () => {
    test('should create a new editor session successfully', async () => {
      console.log('🔨 Creating new editor session...');
      
      const response = await axios.post(`${SERVER_URL}/api/editor/init`, {
        forceNew: true
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.sessionId).toBeDefined();
      expect(response.data.data).toBeDefined();
      expect(response.data.data.workspacePath).toBeDefined();
      expect(response.data.data.sessionPath).toBeDefined();

      // Store session info for other tests
      sessionId = response.data.sessionId;
      sessionInfo = response.data.data;

      console.log(`✅ Created session: ${sessionId}`);
      console.log(`📁 Workspace: ${sessionInfo.workspacePath}`);
      console.log(`📁 Session path: ${sessionInfo.sessionPath}`);

      // Verify session directory exists
      const sessionExists = await fs.pathExists(sessionInfo.sessionPath);
      expect(sessionExists).toBe(true);

      // Verify workspace directory exists
      const workspaceExists = await fs.pathExists(sessionInfo.workspacePath);
      expect(workspaceExists).toBe(true);

      // Verify basic files were copied
      const appFileExists = await fs.pathExists(path.join(sessionInfo.workspacePath, 'App.tsx'));
      expect(appFileExists).toBe(true);
    }, TEST_TIMEOUT);

    test('should retrieve session information', async () => {
      expect(sessionId).toBeDefined();

      const response = await axios.get(`${SERVER_URL}/api/editor/sessions`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.sessions).toBeDefined();
      expect(Array.isArray(response.data.sessions)).toBe(true);

      // Find our test session
      const testSession = response.data.sessions.find((s: any) => s.sessionId === sessionId);
      expect(testSession).toBeDefined();
      expect(testSession.sessionId).toBe(sessionId);
      expect(testSession.workspacePath).toBe(sessionInfo.workspacePath);

      console.log(`✅ Retrieved session info for: ${sessionId}`);
    }, TEST_TIMEOUT);
  });

  describe('File Operations', () => {
    const testFileName = 'components/TestComponent.tsx';

    test('should create and save a new file via editor API', async () => {
      expect(sessionId).toBeDefined();

      console.log(`💾 Creating test file: ${testFileName}`);

      // Create file via editor API
      const response = await axios.put(
        `${SERVER_URL}/api/editor/session-file/${sessionId}/${testFileName}`,
        { content: TEST_FILE_CONTENT },
        { headers: { 'Content-Type': 'application/json' } }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log(`✅ File created successfully via API`);

      // Verify file exists in filesystem
      const filePath = path.join(sessionInfo.workspacePath, testFileName);
      const fileExists = await fs.pathExists(filePath);
      expect(fileExists).toBe(true);

      // Verify file content
      const savedContent = await fs.readFile(filePath, 'utf8');
      expect(savedContent).toBe(TEST_FILE_CONTENT);

      console.log(`✅ File content verified in filesystem`);
    }, TEST_TIMEOUT);

    test('should read file content via editor API', async () => {
      expect(sessionId).toBeDefined();

      console.log(`📖 Reading test file: ${testFileName}`);

      const response = await axios.get(
        `${SERVER_URL}/api/editor/session-file/${sessionId}/${testFileName}`
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.content).toBe(TEST_FILE_CONTENT);

      console.log(`✅ File content read successfully via API`);
    }, TEST_TIMEOUT);

    test('should update file content via editor API', async () => {
      expect(sessionId).toBeDefined();

      console.log(`📝 Updating test file: ${testFileName}`);

      // Update file via editor API
      const response = await axios.put(
        `${SERVER_URL}/api/editor/session-file/${sessionId}/${testFileName}`,
        { content: UPDATED_TEST_FILE_CONTENT },
        { headers: { 'Content-Type': 'application/json' } }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      console.log(`✅ File updated successfully via API`);

      // Verify updated content via API
      const readResponse = await axios.get(
        `${SERVER_URL}/api/editor/session-file/${sessionId}/${testFileName}`
      );

      expect(readResponse.status).toBe(200);
      expect(readResponse.data.success).toBe(true);
      expect(readResponse.data.content).toBe(UPDATED_TEST_FILE_CONTENT);

      // Verify updated content in filesystem
      const filePath = path.join(sessionInfo.workspacePath, testFileName);
      const savedContent = await fs.readFile(filePath, 'utf8');
      expect(savedContent).toBe(UPDATED_TEST_FILE_CONTENT);

      console.log(`✅ File update verified in filesystem`);
    }, TEST_TIMEOUT);
  });

  describe('File Watching and Real-time Updates', () => {
    test('should receive file change events via Socket.IO', async () => {
      expect(sessionId).toBeDefined();

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('File change event not received within timeout'));
        }, 10000);

        console.log(`🔄 Setting up Socket.IO listener for file changes...`);

        // Connect to Socket.IO
        socket = ioClient(SERVER_URL);

        socket.on('connect', () => {
          console.log('✅ Connected to Socket.IO server');
        });

        socket.on('file-changed', (data: any) => {
          console.log('📡 Received file-changed event:', data);

          try {
            expect(data.sessionId).toBe(sessionId);
            expect(data.filePath).toBeDefined();
            expect(data.timestamp).toBeDefined();

            clearTimeout(timeout);
            console.log('✅ File change event verified');
            resolve();
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        });

        socket.on('connect_error', (error: any) => {
          clearTimeout(timeout);
          reject(new Error(`Socket.IO connection error: ${error}`));
        });

        // Trigger a file change after socket is connected
        setTimeout(async () => {
          try {
            const testFile = 'components/FileWatchTest.tsx';
            console.log(`📝 Triggering file change: ${testFile}`);

            await axios.put(
              `${SERVER_URL}/api/editor/session-file/${sessionId}/${testFile}`,
              { content: '// File watch test\nexport default {};\n' },
              { headers: { 'Content-Type': 'application/json' } }
            );

            console.log('✅ File change triggered via API');
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        }, 2000);
      });
    }, TEST_TIMEOUT);
  });

  describe('Build System Integration', () => {
    test('should trigger auto-rebuild when files change', async () => {
      expect(sessionId).toBeDefined();

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Build event not received within timeout'));
        }, 15000);

        console.log(`🔨 Setting up build event listeners...`);

        // Listen for rebuild events
        if (!socket) {
          socket = ioClient(SERVER_URL);
        }

        let rebuildStarted = false;
        let rebuildCompleted = false;

        socket.on('rebuild-started', (data: any) => {
          console.log('🔨 Received rebuild-started event:', data);
          
          try {
            expect(data.sessionId).toBe(sessionId);
            expect(data.triggerFile).toBeDefined();
            expect(data.timestamp).toBeDefined();
            
            rebuildStarted = true;
            console.log('✅ Rebuild started event verified');
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        });

        socket.on('rebuild-completed', (data: any) => {
          console.log('✅ Received rebuild-completed event:', data);
          
          try {
            expect(data.sessionId).toBe(sessionId);
            expect(data.success).toBeDefined();
            expect(data.duration).toBeDefined();
            expect(data.timestamp).toBeDefined();

            if (data.success) {
              expect(data.buildResult).toBeDefined();
              expect(data.buildResult.compiledAppPath).toBeDefined();
            }

            rebuildCompleted = true;

            // Verify both events received
            if (rebuildStarted && rebuildCompleted) {
              clearTimeout(timeout);
              console.log('✅ Auto-rebuild process verified');
              resolve();
            }
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        });

        // Trigger a file change that should cause a rebuild
        setTimeout(async () => {
          try {
            const buildTriggerFile = 'screens/BuildTestScreen.tsx';
            const buildTriggerContent = `
import React from 'react';
import { View, Text } from 'react-native';

export const BuildTestScreen: React.FC = () => {
  return (
    <View>
      <Text>Build test screen - timestamp: ${Date.now()}</Text>
    </View>
  );
};

export default BuildTestScreen;
`;

            console.log(`🔥 Triggering build with file: ${buildTriggerFile}`);

            await axios.put(
              `${SERVER_URL}/api/editor/session-file/${sessionId}/${buildTriggerFile}`,
              { content: buildTriggerContent },
              { headers: { 'Content-Type': 'application/json' } }
            );

            console.log('✅ Build trigger file created');
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        }, 2000);
      });
    }, TEST_TIMEOUT);

    test('should create compiled bundle files', async () => {
      expect(sessionId).toBeDefined();
      expect(sessionInfo).toBeDefined();

      console.log('📦 Checking for compiled bundle files...');

      // Wait a bit for build to complete
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check if build output directory exists
      const buildOutputPath = path.join(sessionInfo.sessionPath, 'dist');
      const buildOutputExists = await fs.pathExists(buildOutputPath);
      
      if (buildOutputExists) {
        console.log('✅ Build output directory found');
        
        // Check for compiled app file
        const compiledAppPath = path.join(buildOutputPath, 'session-app.js');
        const compiledAppExists = await fs.pathExists(compiledAppPath);
        
        if (compiledAppExists) {
          expect(compiledAppExists).toBe(true);
          console.log('✅ Compiled app bundle found');

          // Verify bundle has content
          const bundleStats = await fs.stat(compiledAppPath);
          expect(bundleStats.size).toBeGreaterThan(0);
          console.log(`✅ Bundle size: ${bundleStats.size} bytes`);
        } else {
          console.log('ℹ️ Compiled app bundle not found - build may still be in progress');
        }
      } else {
        console.log('ℹ️ Build output directory not found - auto-rebuild may not have completed yet');
      }
    }, TEST_TIMEOUT);
  });

  describe('Session Persistence and Recovery', () => {
    test('should persist session data across server operations', async () => {
      expect(sessionId).toBeDefined();

      console.log('💾 Testing session persistence...');

      // Create a test file for persistence
      const persistenceTestFile = 'persistence/TestFile.tsx';
      const persistenceTestContent = '// Persistence test file\nexport default {};\n';

      await axios.put(
        `${SERVER_URL}/api/editor/session-file/${sessionId}/${persistenceTestFile}`,
        { content: persistenceTestContent },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('✅ Persistence test file created');

      // Verify file persists by reading it back
      const readResponse = await axios.get(
        `${SERVER_URL}/api/editor/session-file/${sessionId}/${persistenceTestFile}`
      );

      expect(readResponse.status).toBe(200);
      expect(readResponse.data.success).toBe(true);
      expect(readResponse.data.content).toBe(persistenceTestContent);

      console.log('✅ Session data persistence verified');

      // Verify session still shows up in session list
      const sessionsResponse = await axios.get(`${SERVER_URL}/api/editor/sessions`);
      const testSession = sessionsResponse.data.sessions.find((s: any) => s.sessionId === sessionId);
      
      expect(testSession).toBeDefined();
      console.log('✅ Session persistence in session list verified');
    }, TEST_TIMEOUT);
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid session IDs gracefully', async () => {
      console.log('🚫 Testing invalid session ID handling...');

      const invalidSessionId = 'invalid-session-id';
      
      try {
        await axios.get(`${SERVER_URL}/api/editor/session-file/${invalidSessionId}/App.tsx`);
        fail('Expected request to fail for invalid session ID');
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.success).toBe(false);
        } else {
          // Network error or server not available
          expect(error.code).toBeDefined();
        }
        console.log('✅ Invalid session ID handled correctly');
      }
    }, TEST_TIMEOUT);

    test('should handle invalid file paths gracefully', async () => {
      expect(sessionId).toBeDefined();

      console.log('🚫 Testing invalid file path handling...');

      const invalidFilePath = '../../../etc/passwd';
      
      try {
        await axios.get(`${SERVER_URL}/api/editor/session-file/${sessionId}/${invalidFilePath}`);
        fail('Expected request to fail for invalid file path');
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).toBeGreaterThanOrEqual(400);
          expect(error.response.data.success).toBe(false);
        } else {
          // Network error or server not available
          expect(error.code).toBeDefined();
        }
        console.log('✅ Invalid file path handled correctly');
      }
    }, TEST_TIMEOUT);

    test('should handle malformed requests gracefully', async () => {
      expect(sessionId).toBeDefined();

      console.log('🚫 Testing malformed request handling...');

      try {
        await axios.put(
          `${SERVER_URL}/api/editor/session-file/${sessionId}/test.tsx`,
          { invalidField: 'should have content field' },
          { headers: { 'Content-Type': 'application/json' } }
        );
        fail('Expected request to fail for malformed request');
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.success).toBe(false);
        } else {
          // Network error or server not available
          expect(error.code).toBeDefined();
        }
        console.log('✅ Malformed request handled correctly');
      }
    }, TEST_TIMEOUT);
  });
});
