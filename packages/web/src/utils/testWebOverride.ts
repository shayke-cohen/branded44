/**
 * Test script to verify the web member service override is working
 */

// Import the override to ensure it's loaded
import '../context-override/WebMemberServiceOverride';

// Import the mobile service (which should be overridden)
import { memberService } from '@mobile/screens/wix/auth/shared/WixMemberService';

export const testWebOverride = () => {
  console.log('🧪 [TEST] Testing web member service override...');
  
  // Check if the override is available
  const hasGlobalOverride = !!(global as any).webMemberServiceOverride;
  const hasWindowOverride = !!(window as any).webMemberServiceOverride;
  
  console.log('🔍 [TEST] Override availability:', {
    global: hasGlobalOverride,
    window: hasWindowOverride
  });
  
  // Get the member service instance
  const service = memberService;
  
  // Check if it's the web service by looking at the constructor name
  const isWebService = service.constructor.name === 'WebMemberService';
  
  console.log('🔍 [TEST] Service details:', {
    constructorName: service.constructor.name,
    isWebService,
    hasLoginMethod: typeof service.login === 'function'
  });
  
  if (isWebService) {
    console.log('✅ [TEST] SUCCESS: Web member service override is working!');
  } else {
    console.log('❌ [TEST] FAILED: Still using mobile member service');
  }
  
  return {
    hasGlobalOverride,
    hasWindowOverride,
    isWebService,
    constructorName: service.constructor.name
  };
};

// Auto-run the test when this module is imported
if (typeof window !== 'undefined') {
  setTimeout(testWebOverride, 1000);
}
