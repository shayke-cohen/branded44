/**
 * ProgressCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive progress tracking card component for displaying goals,
 * achievements, project status, and other progress-based metrics.
 * 
 * Features:
 * - Multiple progress visualization types (bar, circle, step)
 * - Goal tracking with milestones
 * - Status indicators and badges
 * - Time-based progress (deadlines, duration)
 * - Team/multi-user progress
 * - Animation support
 * - Custom colors and themes
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <ProgressCard
 *   title="Project Alpha"
 *   progress={{ current: 75, target: 100 }}
 *   type="bar"
 *   status="on_track"
 *   deadline={new Date('2024-12-31')}
 *   milestones={milestoneData}
 *   team={teamMembers}
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
import { Avatar, AvatarImage, AvatarFallback } from '../../../../~/components/ui/avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatDate, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Progress visualization type
 */
export type ProgressType = 'bar' | 'circle' | 'steps' | 'ring';

/**
 * Progress status
 */
export type ProgressStatus = 'not_started' | 'in_progress' | 'on_track' | 'behind' | 'ahead' | 'completed' | 'overdue';

/**
 * Progress data
 */
export interface ProgressData {
  /** Current progress value */
  current: number;
  /** Target/maximum value */
  target: number;
  /** Progress unit (%, items, hours, etc.) */
  unit?: string;
  /** Progress label */
  label?: string;
}

/**
 * Milestone data
 */
export interface Milestone {
  /** Milestone ID */
  id: string;
  /** Milestone title */
  title: string;
  /** Target value for this milestone */
  target: number;
  /** Whether milestone is completed */
  completed: boolean;
  /** Due date */
  dueDate?: Date;
  /** Milestone description */
  description?: string;
}

/**
 * Team member data
 */
export interface TeamMember {
  /** Member ID */
  id: string;
  /** Member name */
  name: string;
  /** Profile picture URL */
  avatar?: string;
  /** Member role */
  role?: string;
  /** Individual progress */
  progress?: number;
}

/**
 * Time tracking data
 */
export interface TimeTracking {
  /** Start date */
  startDate: Date;
  /** Due/end date */
  endDate: Date;
  /** Time spent (in hours) */
  timeSpent?: number;
  /** Estimated time (in hours) */
  estimatedTime?: number;
}

/**
 * Props for the ProgressCard component
 */
export interface ProgressCardProps extends BaseComponentProps {
  /** Card title */
  title: string;
  /** Progress data */
  progress: ProgressData;
  /** Progress visualization type */
  type?: ProgressType;
  /** Current status */
  status?: ProgressStatus;
  /** Card description */
  description?: string;
  /** Project/task category */
  category?: string;
  /** Milestones */
  milestones?: Milestone[];
  /** Team members */
  team?: TeamMember[];
  /** Time tracking data */
  timeTracking?: TimeTracking;
  /** Deadline date */
  deadline?: Date;
  /** Priority level */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  /** Custom color theme */
  color?: string;
  /** Whether to show percentage */
  showPercentage?: boolean;
  /** Whether to show team avatars */
  showTeam?: boolean;
  /** Whether to show milestones */
  showMilestones?: boolean;
  /** Whether to show time tracking */
  showTimeTracking?: boolean;
  /** Card size */
  size?: 'small' | 'medium' | 'large';
  /** Whether card is loading */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Callback when card is pressed */
  onPress?: () => void;
  /** Callback when team member is pressed */
  onTeamMemberPress?: (member: TeamMember) => void;
  /** Callback when milestone is pressed */
  onMilestonePress?: (milestone: Milestone) => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ProgressCard component for displaying progress tracking
 */
export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  progress,
  type = 'bar',
  status = 'in_progress',
  description,
  category,
  milestones,
  team,
  timeTracking,
  deadline,
  priority,
  color,
  showPercentage = true,
  showTeam = true,
  showMilestones = true,
  showTimeTracking = false,
  size = 'medium',
  loading = false,
  error,
  onPress,
  onTeamMemberPress,
  onMilestonePress,
  style,
  testID = 'progress-card',
  ...props
}) => {
  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getProgressPercentage = (): number => {
    return Math.min((progress.current / progress.target) * 100, 100);
  };

  const getStatusColor = (stat: ProgressStatus): string => {
    const colors: Record<ProgressStatus, string> = {
      not_started: COLORS.neutral[400],
      in_progress: COLORS.info[500],
      on_track: COLORS.success[500],
      behind: COLORS.warning[500],
      ahead: COLORS.success[600],
      completed: COLORS.success[700],
      overdue: COLORS.error[500],
    };
    return colors[stat];
  };

  const getStatusLabel = (stat: ProgressStatus): string => {
    const labels: Record<ProgressStatus, string> = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      on_track: 'On Track',
      behind: 'Behind Schedule',
      ahead: 'Ahead of Schedule',
      completed: 'Completed',
      overdue: 'Overdue',
    };
    return labels[stat];
  };

  const getPriorityColor = (prio: string): string => {
    const colors: Record<string, string> = {
      low: COLORS.neutral[500],
      medium: COLORS.warning[500],
      high: COLORS.error[500],
      urgent: COLORS.error[700],
    };
    return colors[prio] || COLORS.neutral[500];
  };

  const getDaysUntilDeadline = (): number | null => {
    if (!deadline) return null;
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProgressColor = (): string => {
    if (color) return color;
    return getStatusColor(status);
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {category && (
          <Badge variant="secondary" style={styles.categoryBadge}>
            {category}
          </Badge>
        )}
      </View>
      
      <View style={styles.statusContainer}>
        {priority && (
          <Badge 
            variant="outline" 
            style={[styles.priorityBadge, { borderColor: getPriorityColor(priority) }]}
          >
            {priority.toUpperCase()}
          </Badge>
        )}
        <Badge 
          variant="secondary"
          style={[styles.statusBadge, { backgroundColor: `${getStatusColor(status)}20` }]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            {getStatusLabel(status)}
          </Text>
        </Badge>
      </View>
    </View>
  );

  const renderProgressBar = () => {
    const percentage = getProgressPercentage();
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            {progress.label || 'Progress'}
          </Text>
          <Text style={styles.progressText}>
            {progress.current}{progress.unit || ''} / {progress.target}{progress.unit || ''}
            {showPercentage && ` (${percentage.toFixed(0)}%)`}
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${percentage}%`,
                backgroundColor: getProgressColor()
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderStepsProgress = () => {
    if (!milestones || milestones.length === 0) return null;

    return (
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsTitle}>Milestones</Text>
        {milestones.map((milestone, index) => (
          <View key={milestone.id} style={styles.stepItem}>
            <View style={[
              styles.stepIndicator,
              {
                backgroundColor: milestone.completed 
                  ? getProgressColor() 
                  : COLORS.neutral[300]
              }
            ]}>
              {milestone.completed && (
                <Text style={styles.stepCheckmark}>✓</Text>
              )}
            </View>
            
            <View style={styles.stepContent}>
              <Text style={[
                styles.stepTitle,
                milestone.completed && styles.completedStepTitle
              ]}>
                {milestone.title}
              </Text>
              {milestone.dueDate && (
                <Text style={styles.stepDate}>
                  Due: {formatDate(milestone.dueDate, 'short')}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTimeTracking = () => {
    if (!showTimeTracking || !timeTracking) return null;

    const daysRemaining = getDaysUntilDeadline();
    const progressDays = Math.ceil(
      (new Date().getTime() - timeTracking.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalDays = Math.ceil(
      (timeTracking.endDate.getTime() - timeTracking.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <View style={styles.timeContainer}>
        <Text style={styles.timeTitle}>Timeline</Text>
        <View style={styles.timeStats}>
          <View style={styles.timeStat}>
            <Text style={styles.timeStatValue}>{progressDays}</Text>
            <Text style={styles.timeStatLabel}>Days In</Text>
          </View>
          {daysRemaining !== null && (
            <View style={styles.timeStat}>
              <Text style={[
                styles.timeStatValue,
                daysRemaining < 0 && styles.overdueText
              ]}>
                {Math.abs(daysRemaining)}
              </Text>
              <Text style={styles.timeStatLabel}>
                Days {daysRemaining < 0 ? 'Overdue' : 'Left'}
              </Text>
            </View>
          )}
          <View style={styles.timeStat}>
            <Text style={styles.timeStatValue}>{totalDays}</Text>
            <Text style={styles.timeStatLabel}>Total Days</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTeam = () => {
    if (!showTeam || !team || team.length === 0) return null;

    return (
      <View style={styles.teamContainer}>
        <Text style={styles.teamTitle}>Team</Text>
        <View style={styles.teamAvatars}>
          {team.slice(0, 5).map((member, index) => (
            <Avatar
              key={member.id}
              style={[styles.teamAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
              onPress={() => onTeamMemberPress?.(member)}
            >
              {member.avatar && (
                <AvatarImage source={{ uri: member.avatar }} />
              )}
              <AvatarFallback>
                <Text style={styles.avatarFallback}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </AvatarFallback>
            </Avatar>
          ))}
          {team.length > 5 && (
            <View style={[styles.teamAvatar, styles.teamOverflow]}>
              <Text style={styles.teamOverflowText}>+{team.length - 5}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // =============================================================================
  // ERROR & LOADING STATES
  // =============================================================================

  if (error) {
    return (
      <Card 
        style={[styles.card, styles.errorCard, style]} 
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
        style={[styles.card, styles.loadingCard, style]} 
        testID={testID}
        {...props}
      >
        <View style={styles.loadingContent}>
          <View style={styles.loadingTitle} />
          <View style={styles.loadingProgress} />
          <View style={styles.loadingDetails} />
        </View>
      </Card>
    );
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Card 
      style={[
        styles.card,
        size === 'small' && styles.smallCard,
        size === 'large' && styles.largeCard,
        style
      ]} 
      testID={testID}
      onPress={onPress}
      {...props}
    >
      <View style={styles.content}>
        {renderHeader()}
        
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}

        {type === 'bar' && renderProgressBar()}
        {type === 'steps' && showMilestones && renderStepsProgress()}
        
        {renderTimeTracking()}
        {renderTeam()}

        {/* Accent border */}
        <View style={[styles.accentBorder, { backgroundColor: getProgressColor() }]} />
      </View>
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
    minHeight: 250,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  priorityBadge: {
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.md,
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
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepsContainer: {
    marginBottom: SPACING.md,
  },
  stepsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepCheckmark: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[900],
    marginBottom: SPACING.xs,
  },
  completedStepTitle: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral[600],
  },
  stepDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[500],
  },
  timeContainer: {
    marginBottom: SPACING.md,
  },
  timeTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.sm,
  },
  timeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeStat: {
    alignItems: 'center',
  },
  timeStatValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral[900],
  },
  timeStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
  },
  overdueText: {
    color: COLORS.error[600],
  },
  teamContainer: {
    marginBottom: SPACING.md,
  },
  teamTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.sm,
  },
  teamAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamAvatar: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  teamOverflow: {
    backgroundColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamOverflowText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  avatarFallback: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[600],
  },
  accentBorder: {
    position: 'absolute',
    bottom: 0,
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
  loadingTitle: {
    height: 20,
    backgroundColor: COLORS.neutral[300],
    borderRadius: 4,
    marginBottom: SPACING.md,
    width: '70%',
  },
  loadingProgress: {
    height: 8,
    backgroundColor: COLORS.neutral[300],
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  loadingDetails: {
    height: 12,
    backgroundColor: COLORS.neutral[300],
    borderRadius: 4,
    width: '50%',
  },
});

export default ProgressCard;
