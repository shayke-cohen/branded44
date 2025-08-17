# Visual Editor Integration Tests

This directory contains comprehensive integration tests that validate the end-to-end functionality of the Visual Editor and Server integration.

## Overview

The Visual Editor Integration Test (`VisualEditorIntegration.test.ts`) validates the complete workflow of:

1. **Session Management**: Creating and managing editor sessions
2. **File Operations**: Creating, reading, updating files through the API
3. **Real-time Communication**: Socket.IO file change notifications
4. **Build System**: Auto-rebuild functionality and bundle generation
5. **Data Persistence**: Session and file persistence across operations
6. **Error Handling**: Graceful handling of invalid inputs and edge cases

## Prerequisites

Before running the integration tests, ensure:

1. **Server is Running**: The server must be running on `http://localhost:3001`
   ```bash
   # From the root directory
   cd packages/server
   npm start
   ```

2. **Dependencies Installed**: Make sure all dev dependencies are installed
   ```bash
   cd packages/mobile
   npm install
   ```

## Running the Integration Test

### Quick Start
```bash
cd packages/mobile
npm run test:integration
```

### Manual Jest Command
```bash
# Run with verbose output
npx jest --testPathPattern=VisualEditorIntegration.test.ts --verbose --testTimeout=30000

# Run with coverage
npx jest --testPathPattern=VisualEditorIntegration.test.ts --coverage --verbose --testTimeout=30000
```

## Test Scenarios

### 1. Session Management Tests
- ✅ **Create New Session**: Validates session creation via `/api/editor/init`
- ✅ **Retrieve Session Info**: Confirms session appears in sessions list
- ✅ **Session Directory Structure**: Verifies workspace and session directories exist
- ✅ **File System Setup**: Confirms base files are copied to session workspace

### 2. File Operations Tests
- ✅ **Create New File**: Creates test files via API endpoints
- ✅ **Save File Content**: Validates file content is saved correctly
- ✅ **Read File Content**: Retrieves and validates saved file content
- ✅ **Update File Content**: Modifies existing files and validates changes
- ✅ **File System Persistence**: Confirms changes persist in the filesystem

### 3. Real-time Communication Tests
- ✅ **Socket.IO Connection**: Establishes Socket.IO connection to server
- ✅ **File Change Events**: Validates `file-changed` events are emitted
- ✅ **Event Data Validation**: Confirms event payloads contain correct data
- ✅ **Real-time Updates**: Tests instant file change notifications

### 4. Build System Tests
- ✅ **Auto-rebuild Triggers**: File changes trigger automatic rebuilds
- ✅ **Build Events**: Validates `rebuild-started` and `rebuild-completed` events
- ✅ **Bundle Generation**: Confirms compiled bundles are created
- ✅ **Build Output Validation**: Verifies build artifacts exist and have content

### 5. Data Persistence Tests
- ✅ **Session Persistence**: Session data persists across operations
- ✅ **File Persistence**: File changes remain after operations
- ✅ **Session Recovery**: Sessions can be retrieved after creation

### 6. Error Handling Tests
- ✅ **Invalid Session IDs**: Graceful handling of non-existent sessions
- ✅ **Invalid File Paths**: Security validation for dangerous paths
- ✅ **Malformed Requests**: Proper error responses for bad requests

## Test Configuration

The integration test uses these configurations:

- **Server URL**: `http://localhost:3001`
- **Test Timeout**: 30 seconds (for build operations)
- **Socket.IO Timeout**: 10 seconds (for real-time events)
- **Build Timeout**: 15 seconds (for auto-rebuild validation)

## Expected Output

When the test runs successfully, you should see output like:

```
Visual Editor Server Integration
  Session Management
    ✅ should create a new editor session successfully
    ✅ should retrieve session information
  File Operations
    ✅ should create and save a new file via editor API
    ✅ should read file content via editor API
    ✅ should update file content via editor API
  File Watching and Real-time Updates
    ✅ should receive file change events via Socket.IO
  Build System Integration
    ✅ should trigger auto-rebuild when files change
    ✅ should create compiled bundle files
  Session Persistence and Recovery
    ✅ should persist session data across server operations
  Error Handling and Edge Cases
    ✅ should handle invalid session IDs gracefully
    ✅ should handle invalid file paths gracefully
    ✅ should handle malformed requests gracefully

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

## Troubleshooting

### Server Not Running
If you see connection errors:
```
❌ Server is not running. Please start the server first.
```

**Solution**: Start the server in a separate terminal:
```bash
cd packages/server
npm start
```

### Session Creation Failures
If session creation fails:
- Check if the server has proper file system permissions
- Ensure the `tmp/` directory is writable
- Verify no other editor instances are running

### Socket.IO Connection Issues
If real-time tests fail:
- Confirm the server supports Socket.IO connections
- Check firewall settings for port 3001
- Verify Socket.IO is properly initialized in the server

### Build System Failures
If auto-rebuild tests fail:
- Check if webpack is properly configured
- Verify the AutoRebuildManager is initialized
- Ensure the SessionBuilder has proper permissions

### Memory Issues
If tests are slow or fail with memory errors:
- Close other applications to free memory
- Restart the server between test runs
- Increase Node.js memory limit: `--max-old-space-size=4096`

## Test Files Created

During testing, these temporary files are created and cleaned up:

- `components/TestComponent.tsx` - Basic test file for CRUD operations
- `components/FileWatchTest.tsx` - File for testing file watchers
- `screens/BuildTestScreen.tsx` - File for triggering auto-rebuilds
- `persistence/TestFile.tsx` - File for testing persistence

All test files are automatically cleaned up when the test session ends.

## Integration with CI/CD

To run this test in CI/CD pipelines:

1. **Start Server**: Ensure the server starts before tests
2. **Health Check**: Wait for server to be ready
3. **Run Tests**: Execute the integration test
4. **Cleanup**: Stop the server and clean up sessions

Example CI configuration:
```yaml
- name: Start Server
  run: cd packages/server && npm start &
  
- name: Wait for Server
  run: sleep 10
  
- name: Run Integration Tests
  run: cd packages/mobile && npm run test:integration
  
- name: Cleanup
  run: pkill -f "npm start"
```

## Contributing

When adding new integration tests:

1. Follow the existing test structure and naming conventions
2. Include proper cleanup in `afterAll` hooks
3. Use descriptive test names that explain what is being validated
4. Add appropriate timeouts for async operations
5. Include console logging for debugging purposes
6. Validate both API responses and file system changes

## Support

For issues with integration tests:

1. Check the server logs for errors
2. Verify all dependencies are properly installed
3. Ensure file system permissions are correct
4. Confirm no other processes are using the test directories
