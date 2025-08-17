# React Native App Transformation

Transform the branded44 React Native app into any custom application using AI orchestration.

## 📁 **File Structure**

```
branded44/
├── run-claude.sh              # ✅ EXECUTION SCRIPT - Run this!
├── claude-code-prompt.md      # 📋 PROMPT CONTENT - AI reads this
└── README-TRANSFORMATION.md   # 📖 USAGE GUIDE - You're here
```

## 🚀 **Quick Start Flow**

### **Step 1: Run the Script**
```bash
# Navigate to branded44 directory
cd /Users/shayco/claude-code/branded44

# Make script executable (first time only)
chmod +x run-claude.sh

# Start transformation (recommended)
./run-claude.sh

# OR Quick transformation with just app name
./run-claude.sh quick "Todo App"

# OR Quick transformation with multi-agent (FASTEST)
./run-claude.sh quick-multi "Todo App"
```

### **Step 2: Answer Questions (Full Mode) OR Skip (Quick Mode)**
**Full Mode:** Claude will ask you detailed questions about your app
**Quick Mode:** Skips questions and creates a standard version of the named app

### **Step 3: Watch the Magic**
Claude will:
1. **Deploy specialized sub-agents** for different tasks
2. **Analyze your codebase** and plan the transformation
3. **Implement your app** with proper testing
4. **Verify everything works** before completion

## 🎯 **Available Modes**

### **Multi-Agent (Recommended)**
```bash
./run-claude.sh
# or explicitly:
./run-claude.sh multi-agent
```
- **Faster execution** with parallel sub-agents
- **Better quality** with specialized agents
- **Comprehensive testing** with dedicated test agents
- **Full requirements interview** for custom features

### **Quick Mode (Fast Start)**
```bash
./run-claude.sh quick "App Name"
```
- **Fast option** - just provide app name  
- **Standard features** for the app type
- **No questions asked** - uses common patterns
- **Single-agent processing** - sequential execution

### **Quick Multi-Agent (FASTEST)**
```bash
./run-claude.sh quick-multi "App Name"
```
- **⚡ FASTEST option** - app name + parallel sub-agents
- **Standard features** for the app type  
- **No questions asked** - uses common patterns
- **Multi-agent orchestration** - parallel execution for speed

**Quick Multi-Agent Examples:**
```bash
./run-claude.sh quick-multi "Todo App"           # Task management with priorities
./run-claude.sh quick-multi "Food Tracker"       # Calorie and nutrition tracking
./run-claude.sh quick-multi "Expense Manager"    # Budget and expense tracking
./run-claude.sh quick-multi "Weather App"        # Weather forecasts and alerts
./run-claude.sh quick-multi "Habit Tracker"      # Daily habits and streaks
./run-claude.sh quick-multi "Note Taking App"    # Notes with categories
./run-claude.sh quick-multi "Fitness Tracker"    # Workout and exercise logging
```

### **Single-Agent (Fallback)**
```bash
./run-claude.sh single-agent
```
- **Simpler execution** if multi-agent isn't available
- **Same quality standards** but sequential processing
- **Manual coordination** between phases

## 🏃 **Which Mode Should I Use?**

### **🎯 Choose by Speed:**
1. **Fastest:** `./run-claude.sh quick-multi "App Name"` ⚡
2. **Fast:** `./run-claude.sh` (default multi-agent)
3. **Moderate:** `./run-claude.sh quick "App Name"`
4. **Slower:** `./run-claude.sh single-agent`

### **🎯 Choose by Customization:**
1. **Full Custom:** `./run-claude.sh` (asks detailed questions)
2. **Standard:** `./run-claude.sh quick-multi "App Name"` (common features)
3. **Standard:** `./run-claude.sh quick "App Name"` (common features)
4. **Full Custom:** `./run-claude.sh single-agent` (asks questions, slower)

### **🎯 Recommended Options:**
- **🚀 Most Popular:** `./run-claude.sh quick-multi "Todo App"` 
- **🔧 Custom Needs:** `./run-claude.sh` (default)
- **⚡ Fallback:** `./run-claude.sh single-agent`

## 📋 **What Gets Transformed**

### **✅ What Changes:**
- **Home Screen** → Your custom app interface
- **Navigation** → Removes templates, keeps your app + settings
- **New Components** → Custom UI for your app features
- **State Management** → Context and logic for your data
- **Tests** → Comprehensive test suite for your app

### **✅ What Stays:**
- **Settings Screen** → App preferences
- **Theme System** → Consistent styling
- **Architecture** → Same React Native patterns
- **Code Quality** → TypeScript, ESLint, testing standards

## 🔧 **File Structure After Transformation**

```
src/
  screens/
    HomeScreen/              # ➡️ Becomes [YourApp]Screen/
    SettingsScreen/          # ✅ Stays the same
  
  components/
    [YourAppComponents].tsx  # 🆕 New app-specific components
    BottomNavigation.tsx     # ➡️ Updated (removes templates)
  
  context/
    [YourApp]Context.tsx     # 🆕 Your app state management
  
  types/
    [YourApp]Types.ts        # 🆕 Your app data types
  
  __tests__/
    [YourApp]/               # 🆕 Comprehensive test suite
```

## ⚙️ **How It Works**

### **The Script (`run-claude.sh`)**
- Sets up environment variables for Claude API
- Chooses execution mode (multi-agent vs single-agent)
- References the prompt file for instructions
- Handles errors and provides user feedback

### **The Prompt (`claude-code-prompt.md`)**
- Contains detailed transformation instructions
- Defines orchestration workflow
- Specifies quality standards and testing requirements
- Provides architectural patterns to follow

### **The AI Orchestration**
1. **Requirements Agent** → Asks you questions
2. **Analysis Agent** → Studies your current codebase
3. **Architecture Agent** → Plans the transformation
4. **Implementation Agents** → Build your app features
5. **Testing Agents** → Create and run comprehensive tests
6. **Quality Agents** → Verify everything works

## 🎯 **Example App Types**

Just tell Claude what you want to build:
- **"Food tracking app with calorie counting"**
- **"Expense tracker with categories and budgets"** 
- **"Habit tracker with streaks and reminders"**
- **"Todo app with priorities and due dates"**
- **"Weather app with forecasts and alerts"**
- **"Fitness app with workout logging"**
- **"Note-taking app with categories"**
- **Any other app you can think of!**

## ✅ **Quality Assurance**

The transformation includes:
- **100% test coverage** of new functionality
- **TypeScript compliance** with strict typing
- **ESLint/Prettier** code quality standards  
- **Working iOS/Android builds** verified
- **No console errors** or warnings
- **Proper navigation flows** tested

## 🚨 **Before You Start**

Make sure you have:
- Claude CLI installed and configured
- React Native development environment set up
- Node.js and npm/yarn installed
- iOS/Android simulators available

## 🆘 **Troubleshooting**

### **Script won't run:**
```bash
# Make sure it's executable
chmod +x run-claude.sh

# Check you're in the right directory
pwd  # Should show .../branded44
```

### **Claude connection issues:**
- Verify your API proxy is running on port 3003
- Check ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN
- Ensure you have proper network connectivity

### **Multi-agent mode not available:**
- Fall back to single-agent mode: `./run-claude.sh single-agent`
- Still get same quality, just slower execution

---

**Ready to transform your app? Just run `./run-claude.sh` and let's build something amazing! 🚀** 