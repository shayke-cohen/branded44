#!/bin/bash

# React Native App Transformation - Claude Execution Commands
# Usage: ./run-claude.sh [mode] [app-name]
# Modes: multi-agent (default), single-agent, quick, quick-multi
# Quick mode: ./run-claude.sh quick "Todo App"
# Quick Multi-Agent: ./run-claude.sh quick-multi "Todo App"

MODE=${1:-multi-agent}
APP_NAME=$2

# Check if claude-code-prompt.md exists
if [ ! -f "claude-code-prompt.md" ]; then
    echo "Error: claude-code-prompt.md not found in current directory"
    echo "Please run this script from the branded44 directory"
    exit 1
fi

echo "🚀 Starting React Native App Transformation..."
echo "Mode: $MODE"
echo "Working Directory: $(pwd)"
echo ""

if [ "$MODE" = "multi-agent" ]; then
    echo "🤖 Running Multi-Agent Orchestration Mode..."
    ANTHROPIC_BASE_URL="http://localhost:3003/api/anthropic-proxy" \
    ANTHROPIC_AUTH_TOKEN="fake-key-for-proxy" \
    claude -p \
      --multi-agent \
      --append-system-prompt "You are the Project Orchestrator. ULTRATHINK and deploy specialized sub-agents to analyze, plan, build, test, and verify a React Native app transformation. Follow the orchestration workflow from claude-code-prompt.md. Ask user for app requirements first, then coordinate sub-agents for: 1) Codebase Analysis Agent 2) Architecture Design Agent 3) Implementation Agents (Navigation, UI, State, Screen) 4) Testing Agents (Unit, Integration, Validation) 5) Quality Assurance Agents. Ensure all quality gates pass before completion." \
      --allowedTools "filesystem,permissions,todo_write,codebase_search,edit_file,run_terminal_cmd" \
      --working-dir "$(pwd)" \
      --dangerously-skip-permissions

elif [ "$MODE" = "single-agent" ]; then
    echo "⚡ Running Single-Agent Fallback Mode..."
    ANTHROPIC_BASE_URL="http://localhost:3003/api/anthropic-proxy" \
    ANTHROPIC_AUTH_TOKEN="fake-key-for-proxy" \
    claude --dangerously-skip-permissions \
    "Follow the React Native app transformation workflow from claude-code-prompt.md in $(pwd)"

elif [ "$MODE" = "quick" ]; then
    if [ -z "$APP_NAME" ]; then
        echo "❌ Quick mode requires an app name"
        echo "Usage: ./run-claude.sh quick \"App Name\""
        echo ""
        echo "Examples:"
        echo "  ./run-claude.sh quick \"Todo App\""
        echo "  ./run-claude.sh quick \"Food Tracker\""
        echo "  ./run-claude.sh quick \"Expense Manager\""
        echo "  ./run-claude.sh quick \"Weather App\""
        exit 1
    fi
    
    echo "⚡ Running Quick Transformation Mode (Single-Agent)..."
    echo "🎯 App: $APP_NAME"
    echo "📋 Using basic app configuration..."
    echo ""
    
    ANTHROPIC_BASE_URL="http://localhost:3003/api/anthropic-proxy" \
    ANTHROPIC_AUTH_TOKEN="fake-key-for-proxy" \
    claude --dangerously-skip-permissions \
    "Transform the branded44 React Native app into a '$APP_NAME' using the orchestration workflow from claude-code-prompt.md. SKIP the requirements gathering interview and create a standard $APP_NAME with common features. Use typical patterns for this app type and follow all quality standards including comprehensive testing. Work in $(pwd)."

elif [ "$MODE" = "quick-multi" ]; then
    if [ -z "$APP_NAME" ]; then
        echo "❌ Quick Multi-Agent mode requires an app name"
        echo "Usage: ./run-claude.sh quick-multi \"App Name\""
        echo ""
        echo "Examples:"
        echo "  ./run-claude.sh quick-multi \"Todo App\""
        echo "  ./run-claude.sh quick-multi \"Food Tracker\""
        echo "  ./run-claude.sh quick-multi \"Expense Manager\""
        echo "  ./run-claude.sh quick-multi \"Weather App\""
        exit 1
    fi
    
    echo "🚀 Running Quick Multi-Agent Mode (FASTEST)..."
    echo "🎯 App: $APP_NAME"
    echo "📋 Using basic app configuration with parallel sub-agents..."
    echo ""
    
    ANTHROPIC_BASE_URL="http://localhost:3003/api/anthropic-proxy" \
    ANTHROPIC_AUTH_TOKEN="fake-key-for-proxy" \
    claude -p \
      --multi-agent \
      --append-system-prompt "You are the Project Orchestrator for QUICK transformation. Deploy specialized sub-agents to transform branded44 into a '$APP_NAME' app. SKIP the requirements gathering interview and create a standard $APP_NAME with common features for this app type. Use the orchestration workflow from claude-code-prompt.md but bypass Step 1 (requirements). Coordinate sub-agents for: 1) Analysis Agent (study existing patterns) 2) Architecture Agent (plan standard $APP_NAME structure) 3) Implementation Agents (Navigation, UI, State, Screen) 4) Testing Agents 5) Quality Assurance. Use typical patterns and features for $APP_NAME apps. Ensure all quality gates pass." \
      --allowedTools "filesystem,permissions,todo_write,codebase_search,edit_file,run_terminal_cmd" \
      --working-dir "$(pwd)" \
      --dangerously-skip-permissions

else
    echo "❌ Invalid mode: $MODE"
    echo "Available modes: multi-agent, single-agent, quick, quick-multi"
    echo ""
    echo "Usage examples:"
    echo "  ./run-claude.sh                        # Default multi-agent mode"
    echo "  ./run-claude.sh multi-agent            # Multi-agent orchestration"
    echo "  ./run-claude.sh single-agent           # Single-agent fallback"
    echo "  ./run-claude.sh quick \"Todo App\"       # Quick transformation (single-agent)"
    echo "  ./run-claude.sh quick-multi \"Todo App\" # Quick transformation (multi-agent, FASTEST)"
    echo ""
    echo "Quick mode examples:"
    echo "  ./run-claude.sh quick \"Food Tracker\""
    echo "  ./run-claude.sh quick-multi \"Expense Manager\"  # RECOMMENDED"
    echo "  ./run-claude.sh quick-multi \"Weather App\""
    echo "  ./run-claude.sh quick-multi \"Habit Tracker\""
    exit 1
fi 