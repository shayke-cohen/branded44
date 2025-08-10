/**
 * Health & Fitness Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all health and fitness-related block components with their TypeScript definitions.
 * These components are optimized for AI agent consumption and code generation.
 * 
 * @author AI Component System
 * @version 1.0.0
 */

// === WORKOUT COMPONENTS ===

export { default as WorkoutCard } from './WorkoutCard';
export type { 
  WorkoutCardProps,
  Exercise,
  WorkoutMetrics,
  PersonalRecord,
  WorkoutDifficulty,
  WorkoutCategory,
  WorkoutStatus
} from './WorkoutCard';

// === NUTRITION COMPONENTS ===

export { default as NutritionCard } from './NutritionCard';
export type { 
  NutritionCardProps,
  MealData,
  FoodItem,
  NutritionInfo,
  NutritionGoals,
  MealType,
  DietaryRestriction,
  NutritionScore
} from './NutritionCard';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { formatDate, cn } from '../../../lib/utils';

/**
 * AI Agent Usage Guide for Health & Fitness Blocks
 * 
 * Quick Selection Guide:
 * - WorkoutCard: Display workout routines, exercise tracking, progress monitoring
 * - NutritionCard: Show meal information, calorie tracking, nutrition goals
 * 
 * Common Implementation Patterns:
 * 
 * 1. Workout Tracking:
 * ```tsx
 * <WorkoutCard
 *   title="Full Body Strength"
 *   category="strength"
 *   difficulty="intermediate"
 *   status="planned"
 *   exercises={exerciseList}
 *   estimatedDuration={45}
 *   estimatedCalories={350}
 *   onStart={handleStartWorkout}
 * />
 * ```
 * 
 * 2. Meal Logging:
 * ```tsx
 * <NutritionCard
 *   meal={mealData}
 *   nutritionGoals={dailyGoals}
 *   showProgress={true}
 *   onLogMeal={handleLogMeal}
 *   onViewRecipe={handleViewRecipe}
 * />
 * ```
 * 
 * 3. Fitness Dashboard:
 * ```tsx
 * <View style={{ gap: 16 }}>
 *   <WorkoutCard {...todaysWorkout} status="in_progress" />
 *   <NutritionCard {...breakfastMeal} showProgress={true} />
 * </View>
 * ```
 * 
 * Performance Tips:
 * - Cache workout and meal data for offline access
 * - Use progress tracking for motivation
 * - Implement proper timer functionality for workouts
 * - Optimize nutrition calculations for real-time updates
 * 
 * Accessibility Features:
 * - Screen reader support for all metrics and progress
 * - Voice navigation for workout instructions
 * - High contrast mode for exercise timers
 * - Haptic feedback for workout completion
 */
