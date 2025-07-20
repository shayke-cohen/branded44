# Project Structure

This React Native project follows best practices for organization and maintainability, plus includes an AI-powered transformation system.

## 🚀 **Transformation System Files**

```
branded44/
├── run-claude.sh              # ✅ EXECUTION SCRIPT - Run this to start transformation
├── claude-code-prompt.md      # 📋 AI PROMPT - Orchestration instructions for Claude
├── README-TRANSFORMATION.md   # 📖 USER GUIDE - Complete transformation documentation
└── PROJECT_STRUCTURE.md       # 📁 THIS FILE - Project organization reference
```

### **Transformation Workflow:**
- **`run-claude.sh`** → Executable script with multi-agent and single-agent modes
- **`claude-code-prompt.md`** → Complete AI orchestration prompt with quality gates
- **`README-TRANSFORMATION.md`** → User-friendly guide with examples and troubleshooting

## 📱 **React Native App Structure**

```
src/
├── components/           # Reusable UI components
│   ├── BottomNavigation/
│   │   ├── BottomNavigation.tsx
│   │   └── index.ts
│   └── index.ts         # Component exports
├── screens/             # Screen components
│   ├── HomeScreen/      # 🎯 TARGET FOR TRANSFORMATION
│   │   ├── HomeScreen.tsx
│   │   └── index.ts
│   ├── SettingsScreen/  # ✅ PRESERVED DURING TRANSFORMATION
│   │   ├── SettingsScreen.tsx
│   │   └── index.ts
│   └── index.ts         # Screen exports
├── context/             # React Context providers
│   ├── ThemeContext.tsx # ✅ PRESERVED - Theme system
│   └── index.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── constants/           # App constants and configuration
│   └── index.ts
├── sample-apps/         # 📚 REFERENCE ONLY - Study patterns
│   ├── Calculator/
│   ├── Timer/
│   ├── Weather/
│   └── Todo/
├── screen-templates/    # 🗑️ REMOVED DURING TRANSFORMATION
│   └── [various templates...]
└── index.ts            # Main src exports
```

## 🔄 **Transformation Target Areas**

### **🎯 Files That Get Transformed:**
- **`src/screens/HomeScreen/`** → Becomes your custom app screen
- **`src/components/BottomNavigation.tsx`** → Removes templates tab
- **`src/App.tsx`** → Updates navigation structure

### **🆕 Files That Get Created:**
- **`src/context/[YourApp]Context.tsx`** → Your app's state management
- **`src/components/[YourApp]Components.tsx`** → Custom UI components
- **`src/types/[YourApp]Types.ts`** → Your app's TypeScript interfaces
- **`src/utils/[YourApp]Logic.ts`** → Business logic utilities
- **`__tests__/[YourApp]/`** → Comprehensive test suite

### **✅ Files That Stay Unchanged:**
- **`src/screens/SettingsScreen/`** → Preserved for app preferences
- **`src/context/ThemeContext.tsx`** → Theme system maintained
- **`src/constants/`** → App constants preserved
- **`src/sample-apps/`** → Used as reference patterns only

## 📐 **Architecture Principles**

### 1. **Separation of Concerns**
- **Components**: Reusable UI elements
- **Screens**: Full-screen views with business logic
- **Context**: Global state management (theme + your app state)
- **Types**: TypeScript interfaces and types
- **Constants**: Configuration and static data
- **Utils**: Business logic and helper functions

### 2. **Clean Imports**
Each folder has an `index.ts` file for clean imports:
```typescript
// Instead of:
import TodoScreen from './src/screens/TodoScreen/TodoScreen';

// Use:
import {TodoScreen} from './src/screens';
```

### 3. **TypeScript First**
- All components use TypeScript
- Proper type definitions in `/types`
- Interface-driven development
- Strict typing for transformation outputs

### 4. **Theme System**
- Centralized theme management via `ThemeContext`
- Dark/Light mode support
- System preference detection
- **Preserved during all transformations**

### 5. **Constants Management**
- Centralized configuration
- Easy to maintain and update
- Type-safe constants

### 6. **Testing Strategy**
- Unit tests for all new components
- Context testing for state management
- Integration tests for complete workflows
- **Mandatory 80%+ coverage for transformations**

## 🏗️ **Transformation Architecture**

### **Multi-Agent Orchestration:**
```
Project Orchestrator
├── Codebase Analysis Agent    # Studies existing patterns
├── Architecture Design Agent  # Plans new app structure
├── Implementation Agents      # Parallel development
│   ├── Navigation Specialist  # Updates routing/tabs
│   ├── UI Components Agent    # Creates custom components
│   ├── State Management Agent # Builds context/logic
│   └── Screen Specialist      # Transforms main screen
├── Testing Agents            # Quality assurance
│   ├── Unit Test Engineer    # Component/logic tests
│   ├── Integration Tester    # Workflow tests
│   └── Test Validator        # Coverage/quality gates
└── Quality Assurance Agent   # Final verification
```

### **Quality Gates:**
1. **Analysis Phase** → Architecture design approval
2. **Implementation Phase** → Component integration validation
3. **Testing Phase** → 100% test pass rate + 80% coverage
4. **Verification Phase** → Working build + no errors

## 📝 **File Naming Conventions**

- **Components**: PascalCase (e.g., `BottomNavigation.tsx`)
- **Screens**: PascalCase (e.g., `FoodTrackerScreen.tsx`)
- **Context**: PascalCase + Context (e.g., `FoodTrackerContext.tsx`)
- **Types**: PascalCase + Types (e.g., `FoodTrackerTypes.ts`)
- **Utils**: PascalCase + Logic (e.g., `FoodTrackerLogic.ts`)
- **Folders**: PascalCase for components/screens
- **Constants**: UPPER_SNAKE_CASE (e.g., `THEME_OPTIONS`)

## 📥 **Import Order**

1. React and React Native imports
2. Third-party libraries
3. Internal imports (context, types, constants)
4. Relative imports

## ✅ **Best Practices Implemented**

### **React Native Standards:**
- ✅ Proper folder structure
- ✅ TypeScript interfaces
- ✅ Clean import/export pattern
- ✅ Centralized constants
- ✅ Theme system
- ✅ Component isolation
- ✅ Index files for clean imports
- ✅ Consistent naming conventions

### **Transformation Standards:**
- ✅ AI orchestration with specialized sub-agents
- ✅ Quality gates at every phase
- ✅ Comprehensive testing requirements
- ✅ Code quality verification (TypeScript, ESLint, Prettier)
- ✅ Working build validation
- ✅ User-friendly execution scripts
- ✅ Complete documentation and troubleshooting

## 🎯 **Usage Summary**

### **For Development:**
- Follow the `src/` structure for React Native development
- Use existing patterns from `sample-apps/` as reference
- Maintain TypeScript strict typing
- Use theme system for consistent styling

### **For Transformation:**
```bash
# Transform into any app you want (full customization)
./run-claude.sh

# Quick transformation with standard features
./run-claude.sh quick "Todo App"

# Quick transformation with multi-agent (FASTEST)
./run-claude.sh quick-multi "Todo App"

# Follow the prompts to define your app requirements
# Watch AI orchestration transform the codebase
# Get a fully tested, working custom application
```

This structure supports both **manual development** following React Native best practices and **AI-powered transformation** with quality assurance at every step.