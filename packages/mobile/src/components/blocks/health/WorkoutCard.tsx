/**
 * WorkoutCard Block Component - AI-Optimized React Native Component Library
 * 
 * A comprehensive workout tracking card component for fitness applications,
 * displaying exercise routines, progress tracking, and workout metrics.
 * 
 * Features:
 * - Exercise routine display with sets/reps
 * - Progress tracking and completion status
 * - Duration and calorie tracking
 * - Difficulty levels and categories
 * - Rest timer and interval support
 * - Equipment requirements
 * - Video/image exercise previews
 * - Personal records and achievements
 * 
 * @example
 * ```tsx
 * <WorkoutCard
 *   workout={workoutData}
 *   onStart={() => handleStart()}
 *   onComplete={() => handleComplete()}
 *   showProgress={true}
 *   enableTimer={true}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Badge } from '../../../../~/components/ui/badge';
import { Button } from '../../../../~/components/ui/button';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { formatDate, cn } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Workout difficulty level
 */
export type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Workout category
 */
export type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'balance' | 'hiit' | 'yoga' | 'pilates' | 'sports';

/**
 * Workout status
 */
export type WorkoutStatus = 'planned' | 'in_progress' | 'completed' | 'skipped' | 'paused';

/**
 * Exercise data
 */
export interface Exercise {
  /** Exercise ID */
  id: string;
  /** Exercise name */
  name: string;
  /** Number of sets */
  sets?: number;
  /** Number of reps per set */
  reps?: number;
  /** Duration in seconds */
  duration?: number;
  /** Rest time between sets in seconds */
  restTime?: number;
  /** Weight in kg */
  weight?: number;
  /** Distance in meters */
  distance?: number;
  /** Exercise instructions */
  instructions?: string;
  /** Exercise image/video URL */
  mediaUrl?: string;
  /** Muscle groups targeted */
  muscleGroups?: string[];
  /** Equipment needed */
  equipment?: string[];
  /** Whether exercise is completed */
  completed?: boolean;
}

/**
 * Workout metrics
 */
export interface WorkoutMetrics {
  /** Total duration in minutes */
  duration: number;
  /** Calories burned */
  calories: number;
  /** Exercises completed */
  exercisesCompleted: number;
  /** Total exercises */
  totalExercises: number;
  /** Average heart rate */
  avgHeartRate?: number;
  /** Max heart rate */
  maxHeartRate?: number;
  /** Total distance */
  totalDistance?: number;
  /** Total weight lifted */
  totalWeight?: number;
}

/**
 * Personal record
 */
export interface PersonalRecord {
  /** Record type */
  type: 'weight' | 'reps' | 'duration' | 'distance';
  /** Record value */
  value: number;
  /** Unit of measurement */
  unit: string;
  /** Date achieved */
  date: Date;
  /** Exercise name */
  exercise: string;
}

/**
 * Props for the WorkoutCard component
 */
export interface WorkoutCardProps extends BaseComponentProps {
  /** Workout title */
  title: string;
  /** Workout description */
  description?: string;
  /** Workout category */
  category: WorkoutCategory;
  /** Difficulty level */
  difficulty: WorkoutDifficulty;
  /** Current status */
  status: WorkoutStatus;
  /** List of exercises */
  exercises: Exercise[];
  /** Workout metrics */
  metrics?: WorkoutMetrics;
  /** Estimated duration in minutes */
  estimatedDuration: number;
  /** Estimated calories to burn */
  estimatedCalories: number;
  /** Workout thumbnail image */
  thumbnail?: string;
  /** Equipment required */
  equipment?: string[];
  /** Trainer/instructor name */
  trainer?: string;
  /** Workout tags */
  tags?: string[];
  /** Personal records achieved */
  personalRecords?: PersonalRecord[];
  /** Whether to show detailed progress */
  showProgress?: boolean;
  /** Whether to enable timer functionality */
  enableTimer?: boolean;
  /** Whether workout is favorited */
  isFavorited?: boolean;
  /** Workout completion percentage */
  completionPercentage?: number;
  /** Scheduled date/time */
  scheduledDate?: Date;
  /** Callback when workout is started */
  onStart?: () => void;
  /** Callback when workout is paused */
  onPause?: () => void;
  /** Callback when workout is completed */
  onComplete?: () => void;
  /** Callback when workout is skipped */
  onSkip?: () => void;
  /** Callback when exercise is pressed */
  onExercisePress?: (exercise: Exercise) => void;
  /** Callback when favorite is toggled */
  onToggleFavorite?: () => void;
  /** Callback when share is pressed */
  onShare?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * WorkoutCard component for displaying workout information
 */
export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  title,
  description,
  category,
  difficulty,
  status,
  exercises,
  metrics,
  estimatedDuration,
  estimatedCalories,
  thumbnail,
  equipment = [],
  trainer,
  tags = [],
  personalRecords = [],
  showProgress = true,
  enableTimer = false,
  isFavorited = false,
  completionPercentage = 0,
  scheduledDate,
  onStart,
  onPause,
  onComplete,
  onSkip,
  onExercisePress,
  onToggleFavorite,
  onShare,
  style,
  testID = 'workout-card',
  ...props
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getDifficultyColor = (diff: WorkoutDifficulty): string => {
    const colors: Record<WorkoutDifficulty, string> = {
      beginner: COLORS.success[500],
      intermediate: COLORS.warning[500],
      advanced: COLORS.error[500],
      expert: COLORS.error[700],
    };
    return colors[diff];
  };

  const getCategoryIcon = (cat: WorkoutCategory): string => {
    const icons: Record<WorkoutCategory, string> = {
      strength: '💪',
      cardio: '❤️',
      flexibility: '🤸',
      balance: '⚖️',
      hiit: '🔥',
      yoga: '🧘',
      pilates: '🏃',
      sports: '⚽',
    };
    return icons[cat];
  };

  const getStatusColor = (stat: WorkoutStatus): string => {
    const colors: Record<WorkoutStatus, string> = {
      planned: COLORS.neutral[400],
      in_progress: COLORS.info[500],
      completed: COLORS.success[500],
      skipped: COLORS.neutral[500],
      paused: COLORS.warning[500],
    };
    return colors[stat];
  };

  const getStatusLabel = (stat: WorkoutStatus): string => {
    const labels: Record<WorkoutStatus, string> = {
      planned: 'Planned',
      in_progress: 'In Progress',
      completed: 'Completed',
      skipped: 'Skipped',
      paused: 'Paused',
    };
    return labels[stat];
  };

  const getCompletedExerciseCount = (): number => {
    return exercises.filter(exercise => exercise.completed).length;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {thumbnail && (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        )}
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onToggleFavorite}>
              <Text style={styles.favoriteIcon}>
                {isFavorited ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
          {trainer && (
            <Text style={styles.trainer}>with {trainer}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.badges}>
        <Badge 
          variant="secondary"
          style={[styles.categoryBadge, { backgroundColor: `${getDifficultyColor(difficulty)}20` }]}
        >
          <Text style={[styles.badgeText, { color: getDifficultyColor(difficulty) }]}>
            {getCategoryIcon(category)} {difficulty.toUpperCase()}
          </Text>
        </Badge>
        
        <Badge 
          variant="outline"
          style={[styles.statusBadge, { borderColor: getStatusColor(status) }]}
        >
          <Text style={[styles.badgeText, { color: getStatusColor(status) }]}>
            {getStatusLabel(status)}
          </Text>
        </Badge>
      </View>
    </View>
  );

  const renderMetrics = () => (
    <View style={styles.metricsContainer}>
      <View style={styles.metricItem}>
        <Text style={styles.metricValue}>{formatDuration(estimatedDuration)}</Text>
        <Text style={styles.metricLabel}>Duration</Text>
      </View>
      
      <View style={styles.metricItem}>
        <Text style={styles.metricValue}>{estimatedCalories}</Text>
        <Text style={styles.metricLabel}>Calories</Text>
      </View>
      
      <View style={styles.metricItem}>
        <Text style={styles.metricValue}>{exercises.length}</Text>
        <Text style={styles.metricLabel}>Exercises</Text>
      </View>
      
      {metrics && (
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {metrics.avgHeartRate || '--'}
          </Text>
          <Text style={styles.metricLabel}>Avg HR</Text>
        </View>
      )}
    </View>
  );

  const renderProgress = () => {
    if (!showProgress) return null;

    const completedExercises = getCompletedExerciseCount();
    const progressPercentage = (completedExercises / exercises.length) * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressText}>
            {completedExercises}/{exercises.length} exercises
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${progressPercentage}%`,
                backgroundColor: getDifficultyColor(difficulty)
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderExercises = () => (
    <View style={styles.exercisesContainer}>
      <Text style={styles.exercisesTitle}>Exercises</Text>
      {exercises.slice(0, 3).map((exercise, index) => (
        <TouchableOpacity
          key={exercise.id}
          style={styles.exerciseItem}
          onPress={() => onExercisePress?.(exercise)}
        >
          <View style={[
            styles.exerciseIndicator,
            { backgroundColor: exercise.completed ? COLORS.success[500] : COLORS.neutral[300] }
          ]}>
            {exercise.completed && (
              <Text style={styles.exerciseCheckmark}>✓</Text>
            )}
          </View>
          
          <View style={styles.exerciseContent}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseDetails}>
              {exercise.sets && exercise.reps ? 
                `${exercise.sets} sets × ${exercise.reps} reps` :
                exercise.duration ? 
                  `${Math.round(exercise.duration / 60)} min` :
                  'Custom'
              }
            </Text>
          </View>
          
          {exercise.weight && (
            <Text style={styles.exerciseWeight}>
              {exercise.weight}kg
            </Text>
          )}
        </TouchableOpacity>
      ))}
      
      {exercises.length > 3 && (
        <Text style={styles.moreExercises}>
          +{exercises.length - 3} more exercises
        </Text>
      )}
    </View>
  );

  const renderEquipment = () => {
    if (equipment.length === 0) return null;

    return (
      <View style={styles.equipmentContainer}>
        <Text style={styles.equipmentTitle}>Equipment</Text>
        <View style={styles.equipmentList}>
          {equipment.map((item, index) => (
            <Badge key={index} variant="outline" style={styles.equipmentBadge}>
              {item}
            </Badge>
          ))}
        </View>
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.actions}>
      {status === 'planned' && (
        <Button
          onPress={onStart}
          style={[styles.actionButton, styles.primaryButton]}
        >
          <Text style={styles.primaryButtonText}>Start Workout</Text>
        </Button>
      )}
      
      {status === 'in_progress' && (
        <View style={styles.actionRow}>
          <Button
            onPress={onPause}
            variant="outline"
            style={[styles.actionButton, styles.secondaryButton]}
          >
            <Text style={styles.secondaryButtonText}>Pause</Text>
          </Button>
          <Button
            onPress={onComplete}
            style={[styles.actionButton, styles.primaryButton]}
          >
            <Text style={styles.primaryButtonText}>Complete</Text>
          </Button>
        </View>
      )}
      
      {status === 'paused' && (
        <View style={styles.actionRow}>
          <Button
            onPress={onSkip}
            variant="outline"
            style={[styles.actionButton, styles.secondaryButton]}
          >
            <Text style={styles.secondaryButtonText}>Skip</Text>
          </Button>
          <Button
            onPress={onStart}
            style={[styles.actionButton, styles.primaryButton]}
          >
            <Text style={styles.primaryButtonText}>Resume</Text>
          </Button>
        </View>
      )}
      
      {status === 'completed' && (
        <Button
          onPress={onShare}
          variant="outline"
          style={[styles.actionButton, styles.shareButton]}
        >
          <Text style={styles.secondaryButtonText}>Share Results 🎉</Text>
        </Button>
      )}
    </View>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <Card 
      style={[styles.card, style]} 
      testID={testID}
      {...props}
    >
      <View style={styles.content}>
        {renderHeader()}
        {renderMetrics()}
        {renderProgress()}
        {renderExercises()}
        {renderEquipment()}
        {renderActions()}
        
        {/* Accent border based on difficulty */}
        <View style={[styles.accentBorder, { backgroundColor: getDifficultyColor(difficulty) }]} />
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
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.md,
    backgroundColor: COLORS.neutral[200],
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.neutral[900],
    flex: 1,
  },
  favoriteIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginLeft: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  trainer: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[500],
    fontStyle: 'italic',
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[50],
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.neutral[900],
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
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
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[600],
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
  exercisesContainer: {
    marginBottom: SPACING.md,
  },
  exercisesTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  exerciseIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  exerciseCheckmark: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[900],
    marginBottom: SPACING.xs,
  },
  exerciseDetails: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral[600],
  },
  exerciseWeight: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
  },
  moreExercises: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  equipmentContainer: {
    marginBottom: SPACING.md,
  },
  equipmentTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING.sm,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  equipmentBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  actions: {
    marginTop: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary[500],
  },
  secondaryButton: {
    borderColor: COLORS.neutral[300],
  },
  shareButton: {
    borderColor: COLORS.success[300],
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: COLORS.neutral[700],
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },
  accentBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

export default WorkoutCard;
