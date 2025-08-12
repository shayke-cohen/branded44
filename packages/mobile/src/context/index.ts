// Core context exports
export {ThemeProvider, useTheme} from './ThemeContext';
export {CartProvider, useCart} from './CartContext';
// Platform-aware cart context will be exported from PlatformContextResolver
export {AlertProvider, useAlert} from './AlertContext';

// Platform-aware member context
export {MemberProvider, useMember, withMemberAuth} from './PlatformContextResolver';

// Platform-aware cart context
export {WixCartProvider, useWixCart} from './PlatformContextResolver';

// Product cache exports - export individually to avoid import issues
export {ProductCacheProvider} from './ProductCacheContext';
export {useProductCache} from './ProductCacheContext';
export {useCachedProduct} from './ProductCacheContext';

console.log('✅ [DEBUG] All context exports completed successfully!');