#!/bin/bash
# Script to clean up duplicate .tsx files from root directory

echo "Removing duplicate .tsx files from root directory..."

rm -f App.tsx
rm -f BottomNavigation.tsx  
rm -f SettingsScreen.tsx
rm -f ThemeContext.tsx
rm -f TodoScreen.tsx

echo "Cleanup complete!"
echo "Remaining .tsx files in root:"
ls -la *.tsx 2>/dev/null || echo "No .tsx files found in root directory"