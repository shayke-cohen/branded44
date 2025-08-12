/**
 * Platform Context Resolver
 * 
 * This file provides platform-aware context resolution.
 * It automatically detects the platform and returns the appropriate context.
 */

// Simplified: Mobile context resolver (web handled by webpack alias)

// Lazy context resolution to avoid Metro bundler issues
let cachedContext: any = null;

const getPlatformContext = () => {
  if (cachedContext) {
    return cachedContext;
  }

  // Always use mobile context - web will be handled by webpack alias
  console.log('✅ [PLATFORM RESOLVER] Using mobile context (web handled by webpack alias)');
  const mobileContext = require('./MemberContext');
  const mobileCartContext = require('./WixCartContext');
  cachedContext = {
    MemberProvider: mobileContext.MemberProvider,
    useMember: mobileContext.useMember,
    withMemberAuth: mobileContext.withMemberAuth,
    WixCartProvider: mobileCartContext.WixCartProvider,
    useWixCart: mobileCartContext.useWixCart
  };
  return cachedContext;
};

// Export lazy-resolved context functions
export const MemberProvider = (props: any) => {
  const context = getPlatformContext();
  return context.MemberProvider(props);
};

export const useMember = () => {
  const context = getPlatformContext();
  return context.useMember();
};

export const withMemberAuth = (Component: any) => {
  const context = getPlatformContext();
  return context.withMemberAuth(Component);
};

// Export lazy-resolved cart context functions
export const WixCartProvider = (props: any) => {
  const context = getPlatformContext();
  return context.WixCartProvider(props);
};

export const useWixCart = () => {
  const context = getPlatformContext();
  return context.useWixCart();
};
