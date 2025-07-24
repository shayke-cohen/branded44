console.log('🔗 [DEBUG] Starting context exports...');

console.log('🔗 [DEBUG] About to export from ThemeContext...');
export {ThemeProvider, useTheme} from './ThemeContext';
console.log('🔗 [DEBUG] ThemeContext exports successful');

console.log('🔗 [DEBUG] About to export from CartContext...');
export {CartProvider, useCart} from './CartContext';
console.log('🔗 [DEBUG] CartContext exports successful');

console.log('🔗 [DEBUG] About to export from MemberContext...');
export {MemberProvider, useMember, withMemberAuth} from './MemberContext';
console.log('🔗 [DEBUG] MemberContext exports successful');

console.log('✅ [DEBUG] All context exports completed successfully!');