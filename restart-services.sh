#!/bin/bash

echo "🔄 Starting service restart process..."

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔍 Checking port $port...${NC}"
    
    local pid=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${RED}🔪 Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
        # Double check
        local check_pid=$(lsof -ti :$port 2>/dev/null)
        if [ -z "$check_pid" ]; then
            echo -e "${GREEN}✅ Port $port cleared${NC}"
        else
            echo -e "${RED}❌ Failed to clear port $port${NC}"
        fi
    else
        echo -e "${GREEN}✅ Port $port already free${NC}"
    fi
}

# Function to kill node processes related to this project
kill_node_processes() {
    echo -e "${YELLOW}🔍 Killing Node.js processes related to this project...${NC}"
    
    # Kill npm/yarn processes
    pkill -f "npm.*run.*dev" 2>/dev/null && echo -e "${RED}🔪 Killed npm dev processes${NC}"
    pkill -f "npm.*start" 2>/dev/null && echo -e "${RED}🔪 Killed npm start processes${NC}"
    pkill -f "yarn.*dev" 2>/dev/null && echo -e "${RED}🔪 Killed yarn dev processes${NC}"
    pkill -f "yarn.*start" 2>/dev/null && echo -e "${RED}🔪 Killed yarn start processes${NC}"
    
    # Kill nodemon processes
    pkill -f "nodemon" 2>/dev/null && echo -e "${RED}🔪 Killed nodemon processes${NC}"
    
    # Kill concurrently processes
    pkill -f "concurrently" 2>/dev/null && echo -e "${RED}🔪 Killed concurrently processes${NC}"
    
    # Kill any node processes running from this directory
    local current_dir=$(pwd)
    local processes=$(ps aux | grep node | grep "$current_dir" | grep -v grep | awk '{print $2}' 2>/dev/null)
    if [ ! -z "$processes" ]; then
        echo -e "${RED}🔪 Killing Node.js processes from current directory...${NC}"
        echo "$processes" | xargs kill -9 2>/dev/null
    fi
    
    sleep 2
}

# Main cleanup function
cleanup_services() {
    echo -e "${YELLOW}🧹 Cleaning up running services...${NC}"
    
    # Kill processes on common ports
    kill_port 3000  # Web
    kill_port 3001  # Server 
    kill_port 3002  # Editor
    kill_port 8080  # Alternative web
    kill_port 8081  # Metro bundler
    kill_port 19000 # Expo
    kill_port 19001 # Expo dev tools
    
    # Kill node processes
    kill_node_processes
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}🚀 Starting services...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}🟢 Starting all services (server, web, editor, mobile)...${NC}"
    echo -e "${YELLOW}📝 Note: Services will run in the background. Use Ctrl+C to stop all services.${NC}"
    
    # Start all services using the npm script
    npm run dev:all
}

# Function to show running services
show_status() {
    echo -e "${YELLOW}🔍 Checking service status...${NC}"
    
    # Check each port
    check_port() {
        local port=$1
        local service=$2
        if lsof -ti :$port >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service running on port $port${NC}"
        else
            echo -e "${RED}❌ $service not running on port $port${NC}"
        fi
    }
    
    echo ""
    check_port 3001 "Server"
    check_port 3000 "Web"
    check_port 3002 "Editor"
    check_port 8081 "Mobile (Metro)"
    echo ""
}

# Main execution
echo -e "${GREEN}🔄 Branded44 Service Restart Script${NC}"
echo "================================="

# Step 1: Cleanup
cleanup_services

# Step 2: Wait a moment
echo -e "${YELLOW}⏱️  Waiting 3 seconds for cleanup to complete...${NC}"
sleep 3

# Step 3: Start services
start_services

# Show final status (after a delay to let services start)
echo ""
echo -e "${YELLOW}⏱️  Waiting 5 seconds for services to start...${NC}"
sleep 5
show_status

echo ""
echo -e "${GREEN}🎉 Service restart completed!${NC}"
echo -e "${YELLOW}📍 URLs:${NC}"
echo -e "  🖥️  Server:  http://localhost:3001"
echo -e "  🌐 Web:     http://localhost:3000"  
echo -e "  ✏️  Editor:  http://localhost:3002"
echo -e "  📱 Mobile:  http://localhost:8081"
echo ""
echo -e "${YELLOW}💡 Tip: Use 'npm run health-check' to verify server status${NC}"
echo -e "${YELLOW}🛑 To stop all services: Press Ctrl+C${NC}"
