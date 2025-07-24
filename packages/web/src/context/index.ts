/**
 * Web Context Index
 * 
 * This file re-exports contexts for the web environment.
 * Mobile contexts that work in web are re-exported as-is.
 * Mobile contexts that need web-specific implementations are overridden.
 */

// Re-export mobile contexts that work fine in web
export * from '@mobile/context/ThemeContext';
export * from '@mobile/context/CartContext';
export * from '@mobile/context/WixCartContext';

// Override MemberContext with web-compatible version
export {MemberProvider, useMember, withMemberAuth} from './WebMemberContext'; 