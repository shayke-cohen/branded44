/**
 * Business Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all business-related block components with their TypeScript definitions.
 * These components are optimized for AI agent consumption and code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

// === STATISTICS COMPONENTS ===

export { default as StatsCard } from './StatsCard';
export type { 
  StatsCardProps,
  StatTrend,
  StatProgress,
  StatComparison,
  StatsCardColor,
  StatFormat,
  TrendDirection
} from './StatsCard';

// === PROGRESS COMPONENTS ===

export { default as ProgressCard } from './ProgressCard';
export type { 
  ProgressCardProps,
  ProgressData,
  Milestone,
  TeamMember,
  TimeTracking,
  ProgressType,
  ProgressStatus
} from './ProgressCard';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { formatCurrency, formatDate, cn } from '../../../lib/utils';

/**
 * AI Agent Usage Guide for Business Blocks
 * 
 * Quick Selection Guide:
 * - StatsCard: Display business metrics, KPIs, analytics data
 * - ProgressCard: Show project progress, goal tracking, milestones
 * 
 * Common Implementation Patterns:
 * 
 * 1. Revenue Dashboard:
 * ```tsx
 * <StatsCard
 *   title="Monthly Revenue"
 *   value={125000}
 *   format="currency"
 *   trend={{ direction: 'up', percentage: 12.5 }}
 *   comparison="vs last month"
 *   color="success"
 * />
 * ```
 * 
 * 2. Project Tracking:
 * ```tsx
 * <ProgressCard
 *   title="Website Redesign"
 *   progress={{ current: 75, target: 100 }}
 *   status="on_track"
 *   type="bar"
 *   deadline={new Date('2024-12-31')}
 *   team={teamMembers}
 * />
 * ```
 * 
 * 3. KPI Grid:
 * ```tsx
 * <View style={{ flexDirection: 'row', gap: 16 }}>
 *   <StatsCard title="Users" value={1205} />
 *   <StatsCard title="Sales" value={89500} format="currency" />
 * </View>
 * ```
 * 
 * Performance Tips:
 * - Use appropriate format types for different metrics
 * - Cache frequently accessed data
 * - Implement loading states for async data
 * - Use color coding for quick status recognition
 * 
 * Accessibility Features:
 * - Screen reader support for all metrics
 * - Color-blind friendly status indicators
 * - Keyboard navigation support
 * - Voice over for trend descriptions
 */
