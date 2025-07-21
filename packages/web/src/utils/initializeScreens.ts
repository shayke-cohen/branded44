/**
 * Initialize Screens for Web Preview
 * 
 * Import the mobile screen registration to ensure all screens are available
 * in the web preview. This uses the same import system as mobile.
 */

console.log('🌐 Web: Initializing screens from mobile imports...');

// Import mobile screen registrations - this triggers all registerScreen calls
import '@mobile/config/importScreens';

// TemplateIndexScreen registration removed for clean app preview

console.log('✅ Web: All mobile screens imported and registered!'); 