/**
 * Web Platform Context Resolver
 * 
 * This file provides web-specific context resolution without dynamic imports.
 * It directly uses web contexts to avoid Metro bundler issues.
 */

import { MemberProvider as WebMemberProvider, useMember as useWebMember, withMemberAuth as webWithMemberAuth } from './WebMemberContext';
import { WixCartProvider as WebWixCartProvider, useWixCart as useWebWixCart } from './WebWixCartContext';

console.log('✅ [WEB PLATFORM RESOLVER] Using web contexts directly');

// Export web contexts with mobile-compatible interface
export const MemberProvider = WebMemberProvider;
export const useMember = useWebMember;
export const withMemberAuth = webWithMemberAuth || (() => (Component: any) => Component);

export const WixCartProvider = WebWixCartProvider;
export const useWixCart = useWebWixCart;

