/**
 * Utility Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all utility-related block components with their TypeScript definitions.
 * These components are optimized for AI agent consumption and code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

// === LOADING COMPONENTS ===

export { default as LoadingCard } from './LoadingCard';
export type { 
  LoadingCardProps,
  LoadingType,
  LoadingLayout,
  LoadingSize,
  SkeletonElement
} from './LoadingCard';

export { default as ErrorCard } from './ErrorCard';
export type { 
  ErrorCardProps,
  ErrorType,
  ErrorSeverity,
  RecoveryAction,
  DebugInfo
} from './ErrorCard';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { cn } from '../../../lib/utils';

/**
 * AI Agent Usage Guide for Utility Blocks
 * 
 * Quick Selection Guide:
 * - LoadingCard: Loading states, skeleton screens, progress indicators
 * - ErrorCard: Error states, recovery actions, debug information
 * 
 * Common Implementation Patterns:
 * 
 * 1. Content Loading:
 * ```tsx
 * <LoadingCard
 *   type="skeleton"
 *   layout="card"
 *   message="Loading content..."
 *   animated={true}
 * />
 * ```
 * 
 * 2. Data Processing:
 * ```tsx
 * <LoadingCard
 *   type="spinner"
 *   message="Processing your request..."
 *   showProgress={true}
 *   progress={progressValue}
 *   tips={["This may take a few moments"]}
 * />
 * ```
 * 
 * 3. List Loading:
 * ```tsx
 * <LoadingCard
 *   type="skeleton"
 *   layout="list"
 *   itemCount={5}
 *   message="Loading items..."
 * />
 * ```
 * 
 * 4. Error Handling:
 * ```tsx
 * <ErrorCard
 *   type="network"
 *   title="Connection Error"
 *   message="Unable to connect to server"
 *   severity="medium"
 *   onRetry={handleRetry}
 *   onContactSupport={handleSupport}
 * />
 * ```
 * 
 * Performance Tips:
 * - Use skeleton layouts for perceived performance
 * - Match skeleton to actual content layout
 * - Provide progress feedback for long operations
 * - Use appropriate animation duration
 * 
 * Accessibility Features:
 * - Screen reader announcements for loading states
 * - Progress updates for assistive technology
 * - Appropriate ARIA labels
 * - Reduced motion support
 */
