/**
 * StatsCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive statistics card component for displaying business metrics,
 * analytics data, and key performance indicators with visual elements.
 * 
 * Features:
 * - Multiple stat display formats (number, percentage, currency)
 * - Trend indicators (up, down, neutral)
 * - Progress bars and charts
 * - Comparison data (vs previous period)
 * - Color-coded status indicators
 * - Icon support for categories
 * - Loading and error states
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Revenue"
 *   value={125000}
 *   format="currency"
 *   trend={{ direction: 'up', percentage: 12.5 }}
 *   comparison="vs last month"
 *   icon="💰"
 *   color="success"
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet 
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatCurrency, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Stat value format
 */
export type StatFormat = 'number' | 'currency' | 'percentage' | 'decimal';

/**
 * Card color theme
 */
export type StatsCardColor = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * Trend data
 */
export interface StatTrend {
  /** Trend direction */
  direction: TrendDirection;
  /** Percentage change */
  percentage: number;
  /** Time period for comparison */
  period?: string;
}

/**
 * Progress data
 */
export interface StatProgress {
  /** Current value */
  current: number;
  /** Target/maximum value */
  target: number;
  /** Progress label */
  label?: string;
}

/**
 * Comparison data
 */
export interface StatComparison {
  /** Previous period value */
  previousValue: number;
  /** Comparison label */
  label: string;
  /** Show absolute difference */
  showDifference?: boolean;
}

/**
 * Props for the StatsCard component
 */
export interface StatsCardProps extends BaseComponentProps {
  /** Card title */
  title: string;
  /** Main statistic value */
  value: number;
  /** Value format type */
  format?: StatFormat;
  /** Currency code (for currency format) */
  currency?: string;
  /** Decimal places */
  decimals?: number;
  /** Subtitle or description */
  subtitle?: string;
  /** Card icon */
  icon?: string;
  /** Color theme */
  color?: StatsCardColor;
  /** Trend information */
  trend?: StatTrend;
  /** Progress information */
  progress?: StatProgress;
  /** Comparison data */
  comparison?: StatComparison;
  /** Additional metrics */
  metrics?: Array<{
    label: string;
    value: number;
    format?: StatFormat;
  }>;
  /** Whether card is loading */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Card size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show border */
  showBorder?: boolean;
  /** Custom background color */
  backgroundColor?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * StatsCard component for displaying business statistics
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  format = 'number',
  currency = 'USD',
  decimals = 0,
  subtitle,
  icon,
  color = 'default',
  trend,
  progress,
  comparison,
  metrics,
  loading = false,
  error,
  size = 'medium',
  showBorder = true,
  backgroundColor,
  style,
  testID = 'stats-card',
  ...props
}) => {
  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const formatValue = (val: number, fmt: StatFormat = format, dec: number = decimals): string => {
    switch (fmt) {
      case 'currency':
        return formatCurrency(val, currency);
      case 'percentage':
        return `${(val || 0).toFixed(dec)}%`;
      case 'decimal':
        return (val || 0).toFixed(dec);
      case 'number':
      default:
        if ((val || 0) >= 1000000) {
          return `${((val || 0) / 1000000).toFixed(1)}M`;
        }
        if ((val || 0) >= 1000) {
          return `${((val || 0) / 1000).toFixed(1)}K`;
        }
        return (val || 0).toLocaleString();
    }
  };

  const getTrendIcon = (direction: TrendDirection): string => {
    const icons: Record<TrendDirection, string> = {
      up: '↗️',
      down: '↘️',
      neutral: '➡️',
    };
    return icons[direction];
  };

  const getTrendColor = (direction: TrendDirection): string => {
    const colors: Record<TrendDirection, string> = {
      up: COLORS.success[600],
      down: COLORS.error[600],
      neutral: COLORS.neutral[600],
    };
    return colors[direction];
  };

  const getCardColors = () => {
    const colorMap: Record<StatsCardColor, { background: string; accent: string; text: string }> = {
      default: {
        background: COLORS.white,
        accent: COLORS.primary[500],
        text: COLORS.neutral[900],
      },
      success: {
        background: COLORS.success[50],
        accent: COLORS.success[500],
        text: COLORS.success[900],
      },
      warning: {
        background: COLORS.warning[50],
        accent: COLORS.warning[500],
        text: COLORS.warning[900],
      },
      error: {
        background: COLORS.error[50],
        accent: COLORS.error[500],
        text: COLORS.error[900],
      },
      info: {
        background: COLORS.info[50],
        accent: COLORS.info[500],
        text: COLORS.info[900],
      },
    };
    return colorMap[color] || colorMap.default;
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[styles.title, { color: getCardColors().text }]}>
          {title}
        </Text>
      </View>
      {trend && (
        <View style={styles.trendContainer}>
          <Text style={styles.trendIcon}>
            {getTrendIcon(trend.direction)}
          </Text>
          <Text style={[styles.trendText, { color: getTrendColor(trend.direction) }]}>
            {(trend.percentage || 0) > 0 ? '+' : ''}{(trend.percentage || 0).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );

  const renderMainValue = () => (
    <View style={styles.valueContainer}>
      <Text style={[
        styles.mainValue,
        size === 'small' && styles.smallValue,
        size === 'large' && styles.largeValue,
        { color: getCardColors().text }
      ]}>
        {formatValue(value)}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      {trend?.period && (
        <Text style={styles.period}>{trend.period}</Text>
      )}
    </View>
  );

  const renderProgress = () => {
    if (!progress) return null;

    const progressPercentage = Math.min((progress.current / progress.target) * 100, 100);

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            {progress.label || 'Progress'}
          </Text>
          <Text style={styles.progressText}>
            {formatValue(progress.current)} / {formatValue(progress.target)}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${progressPercentage}%`,
                backgroundColor: getCardColors().accent 
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderComparison = () => {
    if (!comparison) return null;

    const difference = value - comparison.previousValue;
    const percentageChange = comparison.previousValue !== 0 
      ? (difference / comparison.previousValue) * 100 
      : 0;

    return (
      <View style={styles.comparisonContainer}>
        <Text style={styles.comparisonLabel}>{comparison.label}</Text>
        <View style={styles.comparisonValues}>
          <Text style={styles.comparisonPrevious}>
            {formatValue(comparison.previousValue)}
          </Text>
          {comparison.showDifference && (
            <Text style={[
              styles.comparisonDifference,
              { color: difference >= 0 ? COLORS.success[600] : COLORS.error[600] }
            ]}>
              {difference >= 0 ? '+' : ''}{formatValue(difference)}
              {' '}({(percentageChange || 0) >= 0 ? '+' : ''}{(percentageChange || 0).toFixed(1)}%)
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderMetrics = () => {
    if (!metrics || metrics.length === 0) return null;

    return (
      <View style={styles.metricsContainer}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricItem}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={[styles.metricValue, { color: getCardColors().text }]}>
              {formatValue(metric.value, metric.format)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // =============================================================================
  // ERROR & LOADING STATES
  // =============================================================================

  if (error) {
    return (
      <Card 
        style={[
          styles.card,
          styles.errorCard,
          style
        ]} 
        testID={testID}
        {...props}
      >
        <Text style={styles.errorText}>❌ {error}</Text>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card 
        style={[
          styles.card,
          styles.loadingCard,
          style
        ]} 
        testID={testID}
        {...props}
      >
        <View style={styles.loadingContent}>
          <View style={styles.loadingHeader}>
            <View style={styles.loadingTitle} />
            <View style={styles.loadingTrend} />
          </View>
          <View style={styles.loadingValue} />
          <View style={styles.loadingSubtitle} />
        </View>
      </Card>
    );
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  const cardColors = getCardColors();

  return (
    <Card 
      style={[
        styles.card,
        size === 'small' && styles.smallCard,
        size === 'large' && styles.largeCard,
        !showBorder && styles.noBorder,
        { backgroundColor: backgroundColor || cardColors.background },
        style
      ]} 
      testID={testID}
      {...props}
    >
      <View style={styles.content}>
        {renderHeader()}
        {renderMainValue()}
        {renderProgress()}
        {renderComparison()}
        {renderMetrics()}
      </View>
      
      {/* Accent border */}
      <View style={[styles.accentBorder, { backgroundColor: cardColors.accent }]} />
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    margin: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  smallCard: {
    minHeight: 120,
  },
  largeCard: {
    minHeight: 200,
  },
  noBorder: {
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    flex: 1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.xs,
  },
  trendText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  valueContainer: {
    marginBottom: SPACING.md,
  },
  mainValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  smallValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
  },
  largeValue: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
  },
  period: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
    marginTop: SPACING.xs,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  comparisonContainer: {
    marginBottom: SPACING.md,
  },
  comparisonLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
  },
  comparisonValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  comparisonPrevious: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.neutral[700],
  },
  comparisonDifference: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  metricItem: {
    flex: 1,
    minWidth: 80,
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
  },
  metricValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  accentBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  errorCard: {
    backgroundColor: COLORS.error[50],
    borderColor: COLORS.error[200],
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error[600],
    textAlign: 'center',
    padding: SPACING.md,
  },
  loadingCard: {
    backgroundColor: COLORS.neutral[50],
  },
  loadingContent: {
    padding: SPACING.md,
  },
  loadingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  loadingTitle: {
    height: 16,
    backgroundColor: COLORS.neutral[300],
    borderRadius: 4,
    flex: 1,
    marginRight: SPACING.md,
  },
  loadingTrend: {
    height: 16,
    width: 60,
    backgroundColor: COLORS.neutral[300],
    borderRadius: 4,
  },
  loadingValue: {
    height: 32,
    backgroundColor: COLORS.neutral[300],
    borderRadius: 4,
    marginBottom: SPACING.sm,
    width: '60%',
  },
  loadingSubtitle: {
    height: 12,
    backgroundColor: COLORS.neutral[300],
    borderRadius: 4,
    width: '40%',
  },
});

export default StatsCard;
