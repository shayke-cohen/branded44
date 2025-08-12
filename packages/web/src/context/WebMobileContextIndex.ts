/**
 * Web override for mobile context index
 * 
 * This file replaces the mobile context/index.ts when building for web,
 * ensuring all context imports use web-compatible implementations.
 */

// Core context exports - these work on both platforms
export {ThemeProvider, useTheme} from '@mobile/context/ThemeContext';
export {CartProvider, useCart} from '@mobile/context/CartContext';
export {AlertProvider, useAlert} from '@mobile/context/AlertContext';

// Web-specific member context
import { MemberProvider as WebMemberProvider, useMember as useWebMember, withMemberAuth as webWithMemberAuth } from './WebMemberContext';
import { WixCartProvider as WebWixCartProvider, useWixCart as useWebWixCart } from './WebWixCartContext';

console.log('✅ [WEB CONTEXT INDEX] Using web contexts directly');

// Export web contexts with mobile-compatible interface
export const MemberProvider = WebMemberProvider;
export const useMember = useWebMember;
export const withMemberAuth = webWithMemberAuth || (() => (Component: any) => Component);

export const WixCartProvider = WebWixCartProvider;
export const useWixCart = useWebWixCart;

// Product cache exports - these should work on both platforms
export {ProductCacheProvider} from '@mobile/context/ProductCacheContext';
export {useProductCache} from '@mobile/context/ProductCacheContext';
export {useCachedProduct} from '@mobile/context/ProductCacheContext';

console.log('✅ [WEB CONTEXT INDEX] All context exports completed successfully!');
