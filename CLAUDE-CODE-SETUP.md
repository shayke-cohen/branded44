# Claude Code Integration Setup

This guide explains how to set up and use Claude Code CLI with the prompt generator.

## 📦 Project Structure

```
branded44/
├── package.json              # Root workspace configuration
├── packages/
│   ├── mobile/              # React Native mobile app
│   ├── web/                 # Web preview interface  
│   └── server/              # Claude Code CLI server
│       ├── package.json     # Server dependencies
│       ├── README.md        # Server documentation
│       └── src/
│           └── index.js     # Main server application
└── CLAUDE-CODE-SETUP.md     # This file
```

## 🔧 Prerequisites

1. **Install Claude Code CLI** (Required for both approaches):
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **Verify installation**:
   ```bash
   claude-code --version
   ```

## 📋 Option 1: Copy CLI Commands (Simple)

**How it works**: The web interface generates CLI commands that you copy and paste into your terminal.

1. Generate your prompt in the web interface
2. Click **"🤖 Copy CLI Command"**
3. Paste the command in your terminal:
   ```bash
   claude-code "your generated prompt here"
   ```

**Pros**: Simple, no server setup required
**Cons**: Manual copy/paste step

## 🚀 Option 2: Direct Execution via Server (Advanced)

**How it works**: A Node.js server bridges the web interface and Claude Code CLI for direct execution.

### Setup Instructions:

1. **Install all dependencies** (from root directory):
   ```bash
   # Install root dependencies and all packages
   npm run install:all
   
   # Or install server dependencies manually:
   cd packages/server && npm install
   ```

2. **Start the Claude Code server**:
   ```bash
   # From root directory (recommended):
   npm run start:server
   npm run dev:server    # For development with auto-restart
   
   # Or from packages/server directory:
   cd packages/server
   npm start
   npm run dev           # For development
   ```
   
   You should see:
   ```
   🎯 ==========================================
   🚀 Claude Code Server running on port 3001
   📋 Health check: http://localhost:3001/health
   🔧 Make sure Claude Code CLI is installed:
      npm install -g @anthropic-ai/claude-code
   🎯 ==========================================
   ```

3. **Use the web interface**:
   - Open the web app - it will automatically detect the server
   - Generate your prompt
   - Click **"🚀 Execute Now"** for direct execution
   - Check your terminal for Claude Code output

**Pros**: Direct execution, no copy/paste
**Cons**: Requires server setup and maintenance

## 🛠️ Workspace Commands

From the root directory, you can use these convenient commands:

```bash
# Install all dependencies
npm run install:all

# Start the Claude Code server
npm run start:server     # Production mode
npm run dev:server       # Development mode (auto-restart)

# Start the web interface  
npm run dev:web

# Check if server is running
npm run health-check

# Clean all node_modules
npm run clean
```

## 🔄 Server API Endpoints

If you want to integrate with other tools:

- **Health Check**: `GET http://localhost:3001/health`
- **Execute Claude Code**: `POST http://localhost:3001/execute-claude-code`
  ```json
  {
    "prompt": "your claude code prompt here"
  }
  ```
- **Check CLI Installation**: `GET http://localhost:3001/check-claude-code`

## 🎯 Usage Workflow

1. **Generate App/Screen**: Use the web interface to create your prompt
2. **Choose Method**:
   - **Manual**: Copy CLI command → Paste in terminal
   - **Auto**: Click "Execute Now" (if server is running)
3. **Claude Code runs**: Creates your React Native screens
4. **Preview**: Switch to Preview tab to see your new screens

## 🐛 Troubleshooting

**"Claude Code not found"**:
- Install: `npm install -g @anthropic-ai/claude-code`
- Check PATH: `which claude-code`

**"Server not detected"**:
- Start server: `cd packages/server && npm start`
- Check port 3001 is free: `lsof -i :3001`
- Refresh the web page
- Check server status: `curl http://localhost:3001/health`

**"Command failed"**:
- Check terminal for Claude Code error messages
- Verify your API keys are set up
- Ensure you're in the correct project directory

## 🎉 Success!

Once set up, you can generate complete React Native apps with:
1. **Describe your app** in the web interface
2. **Generate prompts** automatically  
3. **Execute with Claude Code** (manual or auto)
4. **Preview immediately** in the web interface

Happy coding! 🚀 