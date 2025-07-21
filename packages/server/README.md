# @branded44/server

Claude Code CLI server for direct execution from the web interface.

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   cd packages/server
   npm install
   ```

2. **Install Claude Code CLI** (if not already installed):
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

3. **Start the server**:
   ```bash
   npm start
   # Or for development with auto-restart:
   npm run dev
   ```

4. **Verify it's running**:
   ```bash
   curl http://localhost:3001/health
   ```

## 🔧 Configuration

- **Port**: Set `PORT` environment variable (default: 3001)
- **Working Directory**: Server runs commands in the directory where it's started

## 📡 API Endpoints

### Health Check
```bash
GET /health
```
Returns server status and timestamp.

### Check Claude Code Installation
```bash
GET /check-claude-code
```
Verifies if Claude Code CLI is installed and returns version info.

### Execute Claude Code
```bash
POST /execute-claude-code
Content-Type: application/json

{
  "prompt": "Your Claude Code prompt here",
  "workingDirectory": "/optional/custom/path"
}
```

### Get Working Directory
```bash
GET /working-directory
```
Returns current working directory information.

## 🔄 Usage with Web Interface

The web interface automatically detects if this server is running:

1. **Auto-detection**: Shows green status when server is available
2. **Direct execution**: Click "🚀 Execute Now" to run Claude Code
3. **Real-time feedback**: Shows execution status and results

## 🏗️ Development

- **Start dev server**: `npm run dev` (uses nodemon for auto-restart)
- **Check logs**: Server logs all Claude Code executions with timing
- **Error handling**: Comprehensive error reporting and graceful shutdown

## 🐛 Troubleshooting

**Server won't start**:
- Check if port 3001 is free: `lsof -i :3001`
- Install dependencies: `npm install`

**Claude Code not found**:
- Install globally: `npm install -g @anthropic-ai/claude-code`
- Check installation: `claude-code --version`

**Web interface can't connect**:
- Verify server is running: `curl http://localhost:3001/health`
- Check CORS settings if running from different domain
- Refresh the web page after starting server

## 🔒 Security Notes

- Server only accepts JSON payloads up to 10MB
- Prompts are not logged in full for security
- Server runs with same permissions as the user who started it
- No authentication - intended for local development only

## 📦 Package Structure

```
packages/server/
├── package.json          # Dependencies and scripts
├── README.md             # This file
└── src/
    └── index.js          # Main server application
```

## 🎯 Integration

This server works seamlessly with:
- **@branded44/web**: Web interface for prompt generation
- **@branded44/mobile**: React Native app development
- **Claude Code CLI**: Direct command execution

Happy coding! 🚀 