/**
 * TemplateIndexScreen Registration
 * 
 * Separate registration to avoid circular dependencies between
 * templateConfig.ts and the registry system.
 */

import {registerScreen} from './registry';
import TemplateIndexScreen from '../screens/TemplateIndexScreen/TemplateIndexScreen';

// TemplateIndexScreen registration disabled - removed from bottom navigation
// registerScreen(TemplateIndexScreen, {
//   name: 'Templates',
//   icon: '📋',
//   category: 'System',
//   hasTab: true,
//   tabPosition: 7,
//   description: 'Browse and explore screen templates',
//   tags: ['templates', 'examples', 'ui', 'components']
// });

console.log('✅ TemplateIndexScreen registration skipped (removed from navigation)'); 