// This file ensures all self-registering screens are imported in the web context
// so their registerScreen() calls execute and they appear in navigation

// AUTO-DISCOVERY: Dynamically import all screen files to trigger registration
// This scans the mobile/screens directory and imports all .tsx files
// No manual imports needed - 100% generic! 🎉

function initializeScreensAutomatically() {
  try {
    // Use webpack's require.context to scan and import all screen files
    // Cast to any to avoid TypeScript issues with webpack-specific feature
    const screenContext = (require as any).context(
      '@mobile/screens',     // Directory to scan
      true,                  // Include subdirectories  
      /\.tsx$/               // Match .tsx files
    );
    
    // Import each screen file to trigger self-registration
    const screenFiles = screenContext.keys();
    screenFiles.forEach((screenFile: string) => {
      try {
        screenContext(screenFile);
        console.log(`📱 Auto-imported: ${screenFile}`);
      } catch (error) {
        console.warn(`⚠️ Failed to import ${screenFile}:`, error);
      }
    });
    
    console.log(`✅ Auto-discovered and initialized ${screenFiles.length} screen files`);
  } catch (error) {
    console.error('❌ Auto-discovery failed:', error);
    console.error('🚨 No screens will be registered for web preview');
  }
}

// Initialize screens automatically
initializeScreensAutomatically(); 